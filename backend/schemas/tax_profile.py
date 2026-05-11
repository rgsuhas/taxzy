from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class OtherIncome(BaseModel):
    interest: float = 0
    dividends: float = 0
    capital_gains: float = 0


class Deductions(BaseModel):
    c80: float = 0  # 80C
    d80: float = 0  # 80D
    hra: float = 0
    standard: float = 50000

    class Config:
        populate_by_name = True


class TaxProfileOut(BaseModel):
    pan: Optional[str] = None
    pan_verified: bool = False
    full_name: Optional[str] = None
    dob: Optional[str] = None
    filing_type: Optional[str] = None
    ay: Optional[str] = None
    gross_income: Optional[float] = None
    tds_paid: Optional[float] = None
    other_income: Optional[dict] = None
    deductions: Optional[dict] = None
    regime: Optional[str] = None


class TaxProfileUpdate(BaseModel):
    field: str
    value: object


class TaxCalculationResult(BaseModel):
    regime: str
    gross_income: float
    taxable_income: float
    tax_liability: float
    tds_paid: float
    refund_or_payable: float
    deductions_breakdown: dict
