from lxml import etree
from datetime import date
from typing import Optional


def _select_form(profile) -> str:
    """ITR-1 for salaried single employer; ITR-2 for multiple/other sources."""
    if profile.filing_type in ("freelancer", "both"):
        return "ITR-2"
    other = profile.other_income or {}
    if any(float(v or 0) > 0 for v in other.values()):
        return "ITR-2"
    return "ITR-1"


def _text(parent: etree._Element, tag: str, value: str) -> etree._Element:
    el = etree.SubElement(parent, tag)
    el.text = value
    return el


def build_itr1_xml(profile, calculation: dict) -> bytes:
    root = etree.Element("ITR1", nsmap={"xsi": "http://www.w3.org/2001/XMLSchema-instance"})

    header = etree.SubElement(root, "ITR1_Header")
    _text(header, "FormName", "ITR-1")
    _text(header, "Description", "For individuals having Income from Salaries")
    _text(header, "AssessmentYear", profile.ay or "2024-25")
    _text(header, "SchemaVer", "Ver1.0")
    _text(header, "HdrTaxScheme", "RuleRule12")
    _text(header, "CreatedDate", date.today().isoformat())

    personal = etree.SubElement(root, "PersonalInfo")
    _text(personal, "AssesseeName", profile.full_name or "")
    _text(personal, "PAN", profile.pan or "")
    _text(personal, "DOB", profile.dob or "")
    _text(personal, "FilingType", profile.filing_type or "salaried")

    income = etree.SubElement(root, "IncomeDeductions")
    _text(income, "GrossSalary", str(int(profile.gross_income or 0)))
    _text(income, "StandardDeduction", "50000")
    deductions = profile.deductions or {}
    _text(income, "Deduction80C", str(int(float(deductions.get("80c", 0) or 0))))
    _text(income, "Deduction80D", str(int(float(deductions.get("80d", 0) or 0))))
    _text(income, "HRA", str(int(float(deductions.get("hra", 0) or 0))))
    _text(income, "TaxableIncome", str(int(calculation.get("taxable_income", 0))))

    tax_comp = etree.SubElement(root, "TaxComputation")
    _text(tax_comp, "TaxRegime", profile.regime or "new")
    _text(tax_comp, "TaxLiability", str(int(calculation.get("tax_liability", 0))))
    _text(tax_comp, "TDSPaid", str(int(float(profile.tds_paid or 0))))
    refund = calculation.get("refund_or_payable", 0)
    _text(tax_comp, "RefundOrPayable", str(int(refund)))
    _text(tax_comp, "RefundOrPayableType", "REFUND" if refund >= 0 else "PAYABLE")

    return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8")


def build_itr2_xml(profile, calculation: dict) -> bytes:
    root = etree.Element("ITR2", nsmap={"xsi": "http://www.w3.org/2001/XMLSchema-instance"})

    header = etree.SubElement(root, "ITR2_Header")
    _text(header, "FormName", "ITR-2")
    _text(header, "Description", "For Individuals and HUFs not having Income from Business/Profession")
    _text(header, "AssessmentYear", profile.ay or "2024-25")
    _text(header, "CreatedDate", date.today().isoformat())

    personal = etree.SubElement(root, "PersonalInfo")
    _text(personal, "AssesseeName", profile.full_name or "")
    _text(personal, "PAN", profile.pan or "")

    income = etree.SubElement(root, "IncomeDetails")
    _text(income, "GrossIncome", str(int(profile.gross_income or 0)))
    other = profile.other_income or {}
    _text(income, "InterestIncome", str(int(float(other.get("interest", 0) or 0))))
    _text(income, "DividendIncome", str(int(float(other.get("dividends", 0) or 0))))
    _text(income, "CapitalGains", str(int(float(other.get("capital_gains", 0) or 0))))
    _text(income, "TaxableIncome", str(int(calculation.get("taxable_income", 0))))

    tax_comp = etree.SubElement(root, "TaxComputation")
    _text(tax_comp, "TaxLiability", str(int(calculation.get("tax_liability", 0))))
    _text(tax_comp, "TDSPaid", str(int(float(profile.tds_paid or 0))))
    refund = calculation.get("refund_or_payable", 0)
    _text(tax_comp, "RefundOrPayable", str(int(refund)))

    return etree.tostring(root, pretty_print=True, xml_declaration=True, encoding="UTF-8")


def generate_itr_xml(profile, calculation: dict) -> tuple[bytes, str]:
    form = _select_form(profile)
    if form == "ITR-2":
        return build_itr2_xml(profile, calculation), "ITR-2"
    return build_itr1_xml(profile, calculation), "ITR-1"


def validate_xml(xml_content: bytes) -> dict:
    errors = []
    try:
        root = etree.fromstring(xml_content)
        required_elements = ["PersonalInfo", "IncomeDeductions", "TaxComputation"]
        for tag in required_elements:
            if root.find(f".//{tag}") is None:
                errors.append(f"Missing required element: {tag}")

        pan_el = root.find(".//PAN")
        if pan_el is not None and pan_el.text:
            import re
            if not re.match(r"^[A-Z]{5}\d{4}[A-Z]$", pan_el.text):
                errors.append(f"Invalid PAN format: {pan_el.text}")
    except etree.XMLSyntaxError as e:
        errors.append(f"XML syntax error: {str(e)}")

    return {"valid": len(errors) == 0, "errors": errors}
