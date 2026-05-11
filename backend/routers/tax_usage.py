from fastapi import APIRouter, Depends
from pydantic import BaseModel
from core.security import get_current_user
from models.user import User
from services.tax_usage import calculate_tax_usage

router = APIRouter(prefix="/api/tax-usage", tags=["tax-usage"])


class TaxUsageRequest(BaseModel):
    tax_paid: float


@router.post("")
def get_tax_usage(body: TaxUsageRequest, current_user: User = Depends(get_current_user)):
    return calculate_tax_usage(body.tax_paid)
