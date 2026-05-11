import re
import httpx
from core.config import settings

PAN_REGEX = re.compile(r"^[A-Z]{5}\d{4}[A-Z]$")


def is_valid_pan_format(pan: str) -> bool:
    return bool(PAN_REGEX.match(pan.upper()))


async def verify_pan(pan: str) -> dict:
    pan = pan.upper().strip()
    if not is_valid_pan_format(pan):
        return {"valid": False, "full_name": None, "dob": None, "pan_type": None, "status": "INVALID_FORMAT"}

    if not settings.SETU_API_KEY:
        return _mock_verify(pan)

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(
                f"{settings.SETU_API_URL}/api/verify/pan",
                json={"pan": pan},
                headers={
                    "x-client-id": settings.SETU_API_KEY,
                    "Content-Type": "application/json",
                },
            )
            data = response.json()
            return {
                "valid": data.get("valid", False),
                "full_name": data.get("name"),
                "dob": data.get("dob"),
                "pan_type": data.get("panType"),
                "status": data.get("status", "UNKNOWN"),
            }
    except Exception:
        return _mock_verify(pan)


def _mock_verify(pan: str) -> dict:
    pan_types = {"P": "Individual", "C": "Company", "H": "HUF", "F": "Firm"}
    pan_type = pan_types.get(pan[3], "Individual")
    return {
        "valid": True,
        "full_name": "Demo User (Mock)",
        "dob": "1990-01-01",
        "pan_type": pan_type,
        "status": "VALID",
    }
