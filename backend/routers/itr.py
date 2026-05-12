import io
import json
import csv
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.database import get_db
from core.security import get_current_user
from models.tax_profile import TaxProfile
from models.user import User
from services.tax_calculator import calculate
from services.itr_generator import generate_itr_xml, validate_xml
from services.itr_converter import convert_json_to_format

router = APIRouter(prefix="/api/itr", tags=["itr"])


class ValidateRequest(BaseModel):
    xml_content: str


@router.get("/generate-xml")
def generate_xml(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(TaxProfile).filter(TaxProfile.user_id == current_user.id).first()
    if not profile or not profile.gross_income:
        raise HTTPException(status_code=400, detail="Tax profile incomplete")

    calculation = calculate(profile)
    xml_bytes, form_name = generate_itr_xml(profile, calculation)

    filename = f"{form_name}_{profile.pan or 'export'}_{profile.ay or '2024-25'}.xml"
    return StreamingResponse(
        io.BytesIO(xml_bytes),
        media_type="application/xml",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("/validate")
def validate_itr(body: ValidateRequest):
    result = validate_xml(body.xml_content.encode("utf-8"))
    return result


SUPPORTED_FORMATS = {"xml", "csv", "json"}

FORMAT_MIME = {
    "xml": ("application/xml", "itr_data.xml"),
    "csv": ("text/csv", "itr_data.csv"),
    "json": ("application/json", "itr_data.json"),
}


@router.post("/convert")
async def convert_itr_json(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    if target_format not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Unsupported format '{target_format}'. Choose from: xml, csv, json")

    raw = await file.read()
    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")

    converted = convert_json_to_format(data, target_format)
    mime, filename = FORMAT_MIME[target_format]
    return StreamingResponse(
        io.BytesIO(converted if isinstance(converted, bytes) else converted.encode("utf-8")),
        media_type=mime,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
