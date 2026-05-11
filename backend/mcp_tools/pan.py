"""PAN verification MCP tool."""
import asyncio
from core.database import SessionLocal
from models.tax_profile import TaxProfile
from services import pan_verifier


async def verify_pan_async(pan: str, user_id: int | None = None) -> dict:
    result = await pan_verifier.verify_pan(pan)
    if result.get("valid") and user_id is not None:
        db = SessionLocal()
        try:
            profile = db.query(TaxProfile).filter(TaxProfile.user_id == user_id).first()
            if profile:
                profile.pan = pan.upper().strip()
                profile.pan_verified = True
                if result.get("full_name") and "Mock" not in result["full_name"]:
                    profile.full_name = result["full_name"]
                if result.get("dob"):
                    profile.dob = result["dob"]
                db.commit()
                result["profile_updated"] = True
        finally:
            db.close()
    return result


def verify_pan(pan: str, user_id: int | None = None) -> dict:
    """
    Verify a PAN number.
    If user_id is provided and PAN is valid, updates the user's tax profile automatically.
    """
    return asyncio.run(verify_pan_async(pan, user_id))
