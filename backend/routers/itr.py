import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from core.database import get_db
from core.security import get_current_user
from models.tax_profile import TaxProfile
from models.user import User
from services.tax_calculator import calculate, calculate_old_regime, calculate_new_regime
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


class WizardAnswers(BaseModel):
    filing_type: str                      # salaried | freelancer | both
    has_capital_gains: bool
    has_business_income: bool
    has_foreign_income: bool
    gross_income: Optional[float] = None
    tds_paid: Optional[float] = None
    deductions_80c: Optional[float] = None
    deductions_80d: Optional[float] = None
    hra: Optional[float] = None


@router.post("/recommend")
def recommend_itr(body: WizardAnswers):
    # Determine ITR form
    if body.has_foreign_income:
        form = "ITR-2"
        reason = "Foreign income or foreign assets require ITR-2."
    elif body.has_business_income or body.filing_type in ("freelancer", "both"):
        form = "ITR-4"
        reason = "Business or freelance income falls under ITR-4 (Sugam) for presumptive taxation."
    elif body.has_capital_gains:
        form = "ITR-2"
        reason = "Capital gains from shares or mutual funds require ITR-2."
    else:
        form = "ITR-1"
        reason = "Salaried income with standard deductions — ITR-1 (Sahaj) applies."

    # Regime comparison (only if income provided)
    regime_comparison = None
    if body.gross_income:
        tds = body.tds_paid or 0
        old = calculate_old_regime(
            body.gross_income, tds,
            body.deductions_80c or 0,
            body.deductions_80d or 0,
            body.hra or 0,
        )
        new = calculate_new_regime(body.gross_income, tds)
        recommended_regime = "new" if new["tax_liability"] <= old["tax_liability"] else "old"
        regime_comparison = {
            "recommended": recommended_regime,
            "old": {"tax_liability": old["tax_liability"], "refund_or_payable": old["refund_or_payable"]},
            "new": {"tax_liability": new["tax_liability"], "refund_or_payable": new["refund_or_payable"]},
            "saving": abs(old["tax_liability"] - new["tax_liability"]),
        }

    return {
        "recommended_form": form,
        "reason": reason,
        "regime_comparison": regime_comparison,
    }
