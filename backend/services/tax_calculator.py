from typing import Optional


def _apply_slabs(income: float, slabs: list[tuple[float, float, float]]) -> float:
    """Apply progressive tax slabs. Each slab: (lower, upper, rate). upper=-1 means no limit."""
    tax = 0.0
    for lower, upper, rate in slabs:
        if income <= lower:
            break
        taxable = (min(income, upper) if upper > 0 else income) - lower
        tax += taxable * rate
    return tax


OLD_REGIME_SLABS = [
    (0, 250000, 0.0),
    (250000, 500000, 0.05),
    (500000, 1000000, 0.20),
    (1000000, -1, 0.30),
]

NEW_REGIME_SLABS = [
    (0, 300000, 0.0),
    (300000, 600000, 0.05),
    (600000, 900000, 0.10),
    (900000, 1200000, 0.15),
    (1200000, 1500000, 0.20),
    (1500000, -1, 0.30),
]

STANDARD_DEDUCTION = 50000
REBATE_87A_LIMIT_NEW = 700000
REBATE_87A_LIMIT_OLD = 500000
REBATE_87A_AMOUNT = 25000
SURCHARGE_THRESHOLDS = [(5000000, 0.10), (10000000, 0.15), (20000000, 0.25), (50000000, 0.37)]
HEALTH_ED_CESS = 0.04


def _apply_surcharge(tax: float, income: float) -> float:
    surcharge_rate = 0.0
    for threshold, rate in SURCHARGE_THRESHOLDS:
        if income > threshold:
            surcharge_rate = rate
    return tax * (1 + surcharge_rate)


def _apply_cess(tax: float) -> float:
    return tax * (1 + HEALTH_ED_CESS)


def calculate_old_regime(
    gross_income: float,
    tds_paid: float,
    deductions_80c: float = 0,
    deductions_80d: float = 0,
    hra: float = 0,
) -> dict:
    deductions_80c = min(deductions_80c, 150000)
    deductions_80d = min(deductions_80d, 25000)

    taxable = gross_income - STANDARD_DEDUCTION - deductions_80c - deductions_80d - hra
    taxable = max(taxable, 0)

    tax = _apply_slabs(taxable, OLD_REGIME_SLABS)

    if taxable <= REBATE_87A_LIMIT_OLD:
        tax = max(0, tax - REBATE_87A_AMOUNT)

    tax = _apply_surcharge(tax, taxable)
    tax = _apply_cess(tax)
    tax = round(tax)

    return {
        "regime": "old",
        "gross_income": gross_income,
        "taxable_income": taxable,
        "tax_liability": tax,
        "tds_paid": tds_paid,
        "refund_or_payable": tds_paid - tax,
        "deductions_breakdown": {
            "80c": deductions_80c,
            "80d": deductions_80d,
            "hra": hra,
            "standard": STANDARD_DEDUCTION,
        },
    }


def calculate_new_regime(
    gross_income: float,
    tds_paid: float,
) -> dict:
    taxable = gross_income - STANDARD_DEDUCTION
    taxable = max(taxable, 0)

    tax = _apply_slabs(taxable, NEW_REGIME_SLABS)

    if taxable <= REBATE_87A_LIMIT_NEW:
        tax = max(0, tax - min(tax, REBATE_87A_AMOUNT))

    tax = _apply_surcharge(tax, taxable)
    tax = _apply_cess(tax)
    tax = round(tax)

    return {
        "regime": "new",
        "gross_income": gross_income,
        "taxable_income": taxable,
        "tax_liability": tax,
        "tds_paid": tds_paid,
        "refund_or_payable": tds_paid - tax,
        "deductions_breakdown": {
            "80c": 0,
            "80d": 0,
            "hra": 0,
            "standard": STANDARD_DEDUCTION,
        },
    }


def calculate(profile) -> dict:
    gross = float(profile.gross_income or 0)
    tds = float(profile.tds_paid or 0)
    deductions = profile.deductions or {}
    regime = profile.regime or "new"

    d80c = float(deductions.get("80c", 0) or 0)
    d80d = float(deductions.get("80d", 0) or 0)
    hra = float(deductions.get("hra", 0) or 0)

    if regime == "old":
        return calculate_old_regime(gross, tds, d80c, d80d, hra)
    return calculate_new_regime(gross, tds)
