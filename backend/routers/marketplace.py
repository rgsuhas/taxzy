from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from models.marketplace import Redemption
from models.tax_profile import TaxProfile
from models.user import User
from schemas.marketplace import OfferOut, RedeemRequest, RedeemResponse
from services.marketplace import get_offers, generate_voucher_code, find_offer
from services.tax_calculator import calculate

router = APIRouter(prefix="/api/marketplace", tags=["marketplace"])


def _get_refund_amount(db: Session, user_id: int) -> float:
    profile = db.query(TaxProfile).filter(TaxProfile.user_id == user_id).first()
    if not profile or not profile.gross_income:
        return 5000.0  # demo default
    result = calculate(profile)
    refund = result.get("refund_or_payable", 0)
    return max(float(refund), 0)


@router.get("/offers", response_model=list[OfferOut])
def list_offers(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    refund = _get_refund_amount(db, current_user.id)
    return get_offers(refund)


@router.post("/redeem", response_model=RedeemResponse)
def redeem_offer(
    body: RedeemRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    offer = find_offer(body.offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    refund = _get_refund_amount(db, current_user.id)
    if refund < offer.get("min_refund", 0):
        raise HTTPException(status_code=400, detail="Refund amount below minimum for this offer")

    voucher_code = generate_voucher_code(offer["brand"])
    voucher_amount = round(refund * offer["conversion_rate"], 2)
    now = datetime.now(timezone.utc)

    redemption = Redemption(
        user_id=current_user.id,
        offer_id=body.offer_id,
        voucher_code=voucher_code,
        amount=voucher_amount,
        status="claimed",
        redeemed_at=now,
    )
    db.add(redemption)
    db.commit()

    return RedeemResponse(voucher_code=voucher_code, brand=offer["brand"], amount=voucher_amount, status="claimed", redeemed_at=now)
