"""Tax profile and calculation MCP tools."""
import json
from core.database import SessionLocal
from models.tax_profile import TaxProfile
from services import tax_calculator


def _get_profile(db, user_id: int) -> TaxProfile | None:
    return db.query(TaxProfile).filter(TaxProfile.user_id == user_id).first()


def _profile_to_dict(p: TaxProfile) -> dict:
    return {
        "user_id": p.user_id,
        "pan": p.pan,
        "pan_verified": p.pan_verified,
        "full_name": p.full_name,
        "dob": p.dob,
        "filing_type": p.filing_type,
        "ay": p.ay,
        "gross_income": float(p.gross_income) if p.gross_income is not None else None,
        "tds_paid": float(p.tds_paid) if p.tds_paid is not None else None,
        "other_income": p.other_income,
        "deductions": p.deductions,
        "regime": p.regime,
    }


def get_tax_profile(user_id: int) -> dict:
    """Return the full tax profile for a user."""
    db = SessionLocal()
    try:
        profile = _get_profile(db, user_id)
        if not profile:
            return {"error": f"No tax profile found for user_id={user_id}"}
        return _profile_to_dict(profile)
    finally:
        db.close()


ALLOWED_FIELDS = {
    "pan", "full_name", "dob", "filing_type", "ay",
    "gross_income", "tds_paid", "regime",
}

JSON_FIELDS = {"other_income", "deductions"}


def update_tax_profile(user_id: int, field: str, value: str) -> dict:
    """Update a single field on the tax profile. JSON fields (other_income, deductions) accept a JSON string."""
    if field not in ALLOWED_FIELDS | JSON_FIELDS:
        return {"error": f"Field '{field}' is not updatable. Allowed: {sorted(ALLOWED_FIELDS | JSON_FIELDS)}"}

    db = SessionLocal()
    try:
        profile = _get_profile(db, user_id)
        if not profile:
            profile = TaxProfile(user_id=user_id)
            db.add(profile)

        if field in JSON_FIELDS:
            try:
                parsed = json.loads(value)
            except json.JSONDecodeError:
                return {"error": f"Field '{field}' expects a JSON string, e.g. '{{\"80c\": 150000}}'"}
            setattr(profile, field, parsed)
        elif field in ("gross_income", "tds_paid"):
            try:
                setattr(profile, field, float(value))
            except ValueError:
                return {"error": f"Field '{field}' expects a numeric value"}
        else:
            setattr(profile, field, value)

        db.commit()
        db.refresh(profile)
        return {"updated": True, "profile": _profile_to_dict(profile)}
    finally:
        db.close()


def calculate_tax(user_id: int, regime: str = "both") -> dict:
    """
    Calculate tax liability for a user.
    regime: 'old' | 'new' | 'both' (default: both, returns comparison)
    """
    db = SessionLocal()
    try:
        profile = _get_profile(db, user_id)
        if not profile:
            return {"error": f"No tax profile found for user_id={user_id}"}
        if not profile.gross_income:
            return {"error": "gross_income is not set on the tax profile"}

        if regime == "both":
            old = tax_calculator.calculate_old_regime(
                float(profile.gross_income or 0),
                float(profile.tds_paid or 0),
                float((profile.deductions or {}).get("80c") or 0),
                float((profile.deductions or {}).get("80d") or 0),
                float((profile.deductions or {}).get("hra") or 0),
            )
            new = tax_calculator.calculate_new_regime(
                float(profile.gross_income or 0),
                float(profile.tds_paid or 0),
            )
            recommended = "new" if new["tax_liability"] <= old["tax_liability"] else "old"
            return {"old_regime": old, "new_regime": new, "recommended_regime": recommended}

        # override profile regime temporarily for calculation
        original_regime = profile.regime
        profile.regime = regime
        result = tax_calculator.calculate(profile)
        profile.regime = original_regime
        return result
    finally:
        db.close()
