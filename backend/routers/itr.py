import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from core.database import get_db
from core.security import get_current_user
from models.tax_profile import TaxProfile
from models.user import User
from services.tax_calculator import calculate
from services.itr_generator import generate_itr_xml, validate_xml

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
