import json
import random
import string
from pathlib import Path

DATA_FILE = Path(__file__).parent.parent / "data" / "marketplace_offers.json"


def _load_offers() -> list[dict]:
    with open(DATA_FILE) as f:
        return json.load(f)


def get_offers(refund_amount: float) -> list[dict]:
    offers = _load_offers()
    eligible = [o for o in offers if refund_amount >= o.get("min_refund", 0)]
    result = []
    for o in eligible:
        voucher_amount = round(refund_amount * o["conversion_rate"], 2)
        result.append({
            "offer_id": o["offer_id"],
            "brand": o["brand"],
            "logo_url": o["logo_url"],
            "refund_amount": refund_amount,
            "voucher_amount": voucher_amount,
            "conversion_rate": o["conversion_rate"],
            "delivery": o["delivery"],
            "description": o.get("description", ""),
        })
    return result


def generate_voucher_code(brand: str) -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"{brand[:3].upper()}-{suffix}"


def find_offer(offer_id: str) -> dict | None:
    for o in _load_offers():
        if o["offer_id"] == offer_id:
            return o
    return None
