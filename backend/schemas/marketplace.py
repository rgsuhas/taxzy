from datetime import datetime
from pydantic import BaseModel


class OfferOut(BaseModel):
    offer_id: str
    brand: str
    logo_url: str
    refund_amount: float
    voucher_amount: float
    conversion_rate: float
    delivery: str
    description: str = ""


class RedeemRequest(BaseModel):
    offer_id: str


class RedeemResponse(BaseModel):
    voucher_code: str
    brand: str
    amount: float
    redeemed_at: datetime
