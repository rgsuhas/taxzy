from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.tax_profile import TaxProfile
from models.user import User
from services.pan_verifier import verify_pan

router = APIRouter(prefix="/api/pan", tags=["pan"])


class PanRequest(BaseModel):
    pan: str


@router.post("/verify")
async def verify_pan_endpoint(
    body: PanRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await verify_pan(body.pan)

    if result.get("valid"):
        profile = db.query(TaxProfile).filter(TaxProfile.user_id == current_user.id).first()
        if not profile:
            profile = TaxProfile(user_id=current_user.id)
            db.add(profile)

        profile.pan = body.pan.upper().strip()
        profile.pan_verified = True
        if result.get("full_name") and "Mock" not in result["full_name"]:
            profile.full_name = result["full_name"]
        if result.get("dob"):
            profile.dob = result["dob"]
        db.commit()

    return result
