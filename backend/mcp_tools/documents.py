"""Document parsing and ITR generation MCP tools."""
import base64
from core.database import SessionLocal
from models.tax_profile import TaxProfile
from services import document_parser, itr_generator, tax_calculator


def parse_document(content_base64: str, doc_type: str) -> dict:
    """
    Parse a tax document from base64-encoded bytes.
    doc_type: 'form16_pdf' | 'form26as_pdf' | 'ais_json' | 'itr_xml'
    Returns extracted fields from the document.
    """
    valid_types = {"form16_pdf", "form26as_pdf", "ais_json", "itr_xml"}
    if doc_type not in valid_types:
        return {"error": f"Invalid doc_type. Must be one of: {sorted(valid_types)}"}

    try:
        data = base64.b64decode(content_base64)
    except Exception:
        return {"error": "content_base64 is not valid base64"}

    return document_parser.parse_document(data, doc_type)


def generate_itr_xml(user_id: int) -> dict:
    """
    Generate ITR XML (ITR-1 or ITR-2) for a user based on their tax profile.
    Returns the XML as a base64-encoded string along with the form name used.
    """
    db = SessionLocal()
    try:
        profile = db.query(TaxProfile).filter(TaxProfile.user_id == user_id).first()
        if not profile:
            return {"error": f"No tax profile found for user_id={user_id}"}
        if not profile.gross_income:
            return {"error": "gross_income is required to generate ITR XML"}

        calculation = tax_calculator.calculate(profile)
        xml_bytes, form_name = itr_generator.generate_itr_xml(profile, calculation)
        return {
            "form": form_name,
            "xml_base64": base64.b64encode(xml_bytes).decode(),
            "tax_summary": {
                "taxable_income": calculation["taxable_income"],
                "tax_liability": calculation["tax_liability"],
                "tds_paid": calculation["tds_paid"],
                "refund_or_payable": calculation["refund_or_payable"],
            },
        }
    finally:
        db.close()


def validate_itr_xml(xml_base64: str) -> dict:
    """Validate a base64-encoded ITR XML against required schema elements."""
    try:
        xml_bytes = base64.b64decode(xml_base64)
    except Exception:
        return {"error": "xml_base64 is not valid base64"}

    return itr_generator.validate_xml(xml_bytes)
