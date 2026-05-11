from fastapi import APIRouter, Depends
from core.security import get_current_user
from models.user import User

router = APIRouter(prefix="/api/refund", tags=["refund"])

REFUND_TIMELINE = [
    {"step": 1, "label": "ITR Filed", "date": "2024-08-01", "done": True},
    {"step": 2, "label": "ITR Verified", "date": "2024-08-03", "done": True},
    {"step": 3, "label": "Processing by CPC", "date": "2024-08-15", "done": False},
    {"step": 4, "label": "Refund Initiated", "date": "2024-08-25", "done": False},
    {"step": 5, "label": "Refund Credited", "date": "2024-09-05", "done": False},
]


@router.get("/status")
def get_refund_status(current_user: User = Depends(get_current_user)):
    return {
        "status": "verified",
        "current_step": 2,
        "estimated_date": "2024-09-05",
        "timeline": REFUND_TIMELINE,
    }
