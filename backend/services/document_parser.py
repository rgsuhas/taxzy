import json
import re
from typing import Optional

import pdfplumber
from lxml import etree


def _extract_amount(text: str, pattern: str) -> Optional[float]:
    match = re.search(pattern, text, re.IGNORECASE)
    if match:
        raw = match.group(1).replace(",", "").strip()
        try:
            return float(raw)
        except ValueError:
            return None
    return None


def parse_form16_pdf(data: bytes) -> dict:
    result = {"doc_type": "form16_pdf", "employer_name": None, "gross_salary": None, "tds": None, "deductions_80c": None}
    try:
        import io
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        result["gross_salary"] = _extract_amount(text, r"gross\s+salary[^\d]+([\d,]+)")
        result["tds"] = _extract_amount(text, r"tax\s+deducted\s+at\s+source[^\d]+([\d,]+)")
        result["deductions_80c"] = _extract_amount(text, r"80\s*C[^\d]+([\d,]+)")

        employer_match = re.search(r"name\s+of\s+employer[:\s]+([A-Za-z\s]+)", text, re.IGNORECASE)
        if employer_match:
            result["employer_name"] = employer_match.group(1).strip()
    except Exception as e:
        result["parse_error"] = str(e)
    return result


def parse_ais_json(data: bytes) -> dict:
    result = {"doc_type": "ais_json", "salary_income": None, "interest_income": None, "dividend_income": None, "tds_entries": []}
    try:
        ais = json.loads(data.decode("utf-8"))
        # AIS JSON structure varies; attempt common keys
        for key in ("salaryData", "salary", "SalaryIncome"):
            if key in ais:
                entries = ais[key]
                if isinstance(entries, list) and entries:
                    result["salary_income"] = sum(float(e.get("amount", 0)) for e in entries)
                elif isinstance(entries, (int, float)):
                    result["salary_income"] = float(entries)

        for key in ("interestIncome", "interest", "InterestIncome"):
            if key in ais:
                result["interest_income"] = float(ais[key]) if isinstance(ais[key], (int, float)) else None

        for key in ("dividendIncome", "dividend", "DividendIncome"):
            if key in ais:
                result["dividend_income"] = float(ais[key]) if isinstance(ais[key], (int, float)) else None

        for key in ("tdsData", "tds", "TDSEntries"):
            if key in ais and isinstance(ais[key], list):
                result["tds_entries"] = ais[key][:10]  # cap at 10 entries
    except Exception as e:
        result["parse_error"] = str(e)
    return result


def parse_form26as_pdf(data: bytes) -> dict:
    result = {"doc_type": "form26as_pdf", "total_tds": None, "deductors": []}
    try:
        import io
        with pdfplumber.open(io.BytesIO(data)) as pdf:
            text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        result["total_tds"] = _extract_amount(text, r"total\s+tax\s+deposited[^\d]+([\d,]+)")

        deductor_matches = re.findall(r"([A-Z]{5}\d{4}[A-Z])\s+([^\n]+)\s+([\d,]+)", text)
        result["deductors"] = [
            {"tan": m[0], "name": m[1].strip(), "tds_amount": float(m[2].replace(",", ""))}
            for m in deductor_matches[:10]
        ]
    except Exception as e:
        result["parse_error"] = str(e)
    return result


def parse_itr_xml(data: bytes) -> dict:
    result = {"doc_type": "itr_xml", "gross_income": None, "tax_paid": None, "assessment_year": None}
    try:
        root = etree.fromstring(data)
        ns = {"": root.nsmap.get(None, "")}

        def find_text(tag):
            el = root.find(f".//{tag}")
            return el.text if el is not None else None

        result["assessment_year"] = find_text("AssessmentYear") or find_text("AY")
        gross = find_text("GrossTotIncome") or find_text("GrossIncome")
        if gross:
            result["gross_income"] = float(gross)
        tax = find_text("TaxPayable") or find_text("TaxDue")
        if tax:
            result["tax_paid"] = float(tax)
    except Exception as e:
        result["parse_error"] = str(e)
    return result


def detect_doc_type(filename: str, content_type: str) -> str:
    name = filename.lower()
    if "form16" in name or "form_16" in name:
        return "form16_pdf"
    if "26as" in name or "form26" in name:
        return "form26as_pdf"
    if name.endswith(".json") or "ais" in name:
        return "ais_json"
    if name.endswith(".xml") or "itr" in name:
        return "itr_xml"
    if content_type == "application/json":
        return "ais_json"
    if content_type in ("application/xml", "text/xml"):
        return "itr_xml"
    return "form16_pdf"  # default for PDFs


def parse_document(data: bytes, doc_type: str) -> dict:
    parsers = {
        "form16_pdf": parse_form16_pdf,
        "form26as_pdf": parse_form26as_pdf,
        "ais_json": parse_ais_json,
        "itr_xml": parse_itr_xml,
    }
    parser = parsers.get(doc_type, parse_form16_pdf)
    return parser(data)


def merge_into_profile(parsed_data: dict, profile) -> None:
    doc_type = parsed_data.get("doc_type")
    if doc_type == "form16_pdf":
        if parsed_data.get("gross_salary"):
            profile.gross_income = parsed_data["gross_salary"]
        if parsed_data.get("tds"):
            profile.tds_paid = parsed_data["tds"]
        if parsed_data.get("deductions_80c"):
            deductions = profile.deductions or {}
            deductions["80c"] = parsed_data["deductions_80c"]
            profile.deductions = deductions
    elif doc_type == "ais_json":
        if parsed_data.get("salary_income"):
            profile.gross_income = parsed_data["salary_income"]
        other = profile.other_income or {}
        if parsed_data.get("interest_income"):
            other["interest"] = parsed_data["interest_income"]
        if parsed_data.get("dividend_income"):
            other["dividends"] = parsed_data["dividend_income"]
        if other:
            profile.other_income = other
    elif doc_type == "form26as_pdf":
        if parsed_data.get("total_tds"):
            profile.tds_paid = parsed_data["total_tds"]
    elif doc_type == "itr_xml":
        if parsed_data.get("gross_income"):
            profile.gross_income = parsed_data["gross_income"]
        if parsed_data.get("assessment_year"):
            profile.ay = parsed_data["assessment_year"]
