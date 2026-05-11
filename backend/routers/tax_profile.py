from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.tax_profile import TaxProfile
from models.user import User
from schemas.tax_profile import TaxProfileOut, TaxProfileUpdate, TaxCalculationResult
from services.tax_calculator import calculate

router = APIRouter(prefix="/api/tax-profile", tags=["tax-profile"])

ALLOWED_FIELDS = {
    "pan", "full_name", "dob", "filing_type", "ay",
    "gross_income", "tds_paid", "regime", "other_income", "deductions",
}


def _get_or_create_profile(db: Session, user_id: int) -> TaxProfile:
    profile = db.query(TaxProfile).filter(TaxProfile.user_id == user_id).first()
    if not profile:
        profile = TaxProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("", response_model=TaxProfileOut)
def get_tax_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = _get_or_create_profile(db, current_user.id)
    return TaxProfileOut(
        pan=profile.pan,
        pan_verified=profile.pan_verified,
        full_name=profile.full_name,
        dob=profile.dob,
        filing_type=profile.filing_type,
        ay=profile.ay,
        gross_income=float(profile.gross_income) if profile.gross_income else None,
        tds_paid=float(profile.tds_paid) if profile.tds_paid else None,
        other_income=profile.other_income,
        deductions=profile.deductions,
        regime=profile.regime,
    )


@router.put("", response_model=TaxProfileOut)
def update_tax_profile(
    body: TaxProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if body.field not in ALLOWED_FIELDS:
        raise HTTPException(status_code=400, detail=f"Field '{body.field}' is not updatable")

    profile = _get_or_create_profile(db, current_user.id)
    setattr(profile, body.field, body.value)
    db.commit()
    db.refresh(profile)

    return TaxProfileOut(
        pan=profile.pan,
        pan_verified=profile.pan_verified,
        full_name=profile.full_name,
        dob=profile.dob,
        filing_type=profile.filing_type,
        ay=profile.ay,
        gross_income=float(profile.gross_income) if profile.gross_income else None,
        tds_paid=float(profile.tds_paid) if profile.tds_paid else None,
        other_income=profile.other_income,
        deductions=profile.deductions,
        regime=profile.regime,
    )


@router.post("/calculate", response_model=TaxCalculationResult)
def calculate_tax(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(TaxProfile).filter(TaxProfile.user_id == current_user.id).first()
    if not profile or not profile.gross_income:
        raise HTTPException(status_code=400, detail="Tax profile incomplete — gross income required")

    result = calculate(profile)
    return TaxCalculationResult(**result)
