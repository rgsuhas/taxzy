BUDGET_BREAKDOWN = [
    {"category": "Infrastructure & Transport", "percentage": 21.0,
     "copy_template": "Your ₹{amount} helped build {meters:.1f}m of national highways."},
    {"category": "Defence", "percentage": 13.0,
     "copy_template": "Your ₹{amount} contributed to national security for {seconds:.0f} seconds."},
    {"category": "Agriculture & Rural Dev", "percentage": 10.0,
     "copy_template": "Your ₹{amount} supported farmers in rural India."},
    {"category": "Education", "percentage": 9.0,
     "copy_template": "Your ₹{amount} funded {students:.1f} days of mid-day meals for school children."},
    {"category": "Health", "percentage": 8.0,
     "copy_template": "Your ₹{amount} funded Ayushman Bharat coverage for {families:.2f} families."},
    {"category": "Social Welfare", "percentage": 7.0,
     "copy_template": "Your ₹{amount} reached {beneficiaries:.0f} welfare beneficiaries."},
    {"category": "Energy & Power", "percentage": 6.0,
     "copy_template": "Your ₹{amount} helped electrify rural India."},
    {"category": "Interest Payments", "percentage": 20.0,
     "copy_template": "Your ₹{amount} serviced national debt obligations."},
    {"category": "Other Expenditure", "percentage": 6.0,
     "copy_template": "Your ₹{amount} funded miscellaneous government services."},
]

HIGHWAY_COST_PER_METER = 50_000_000 / 1000  # ₹5 crore/km → ₹5000/m
MIDDAY_MEAL_COST = 10  # ₹10/meal/day
AYUSHMAN_FAMILY_COVER = 500_000  # ₹5 lakh per family


def calculate_tax_usage(tax_paid: float) -> dict:
    breakdown = []
    for item in BUDGET_BREAKDOWN:
        amount = round(tax_paid * item["percentage"] / 100)
        extra = {}
        cat = item["category"]
        if "Infrastructure" in cat:
            extra["meters"] = amount / HIGHWAY_COST_PER_METER
        elif "Education" in cat:
            extra["students"] = amount / MIDDAY_MEAL_COST
        elif "Health" in cat:
            extra["families"] = amount / AYUSHMAN_FAMILY_COVER
        elif "Defence" in cat:
            defence_budget_per_second = 5_900_000_000_000 / (365 * 24 * 3600)
            extra["seconds"] = amount / defence_budget_per_second if defence_budget_per_second else 0
        elif "Social" in cat:
            extra["beneficiaries"] = amount / 100

        try:
            copy = item["copy_template"].format(amount=f"{amount:,}", **extra)
        except (KeyError, ZeroDivisionError):
            copy = f"Your ₹{amount:,} funded {cat.lower()}."

        breakdown.append({
            "category": cat,
            "percentage": item["percentage"],
            "amount": amount,
            "personalized_copy": copy,
        })

    total_infra = next((b["amount"] for b in breakdown if "Infrastructure" in b["category"]), 0)
    meters = total_infra / HIGHWAY_COST_PER_METER if HIGHWAY_COST_PER_METER else 0
    summary = (
        f"Your ₹{int(tax_paid):,} in taxes built {meters:.1f}m of national highway, "
        f"funded education for thousands of children, and contributed to India's growth story. "
        f"Every rupee counts."
    )

    return {"breakdown": breakdown, "summary": summary}
