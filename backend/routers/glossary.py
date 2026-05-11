import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from core.security import get_current_user
from models.user import User
from services.gemini import explain_term

router = APIRouter(prefix="/api/glossary", tags=["glossary"])

DATA_FILE = Path(__file__).parent.parent / "data" / "glossary.json"


def _load_glossary() -> list[dict]:
    with open(DATA_FILE) as f:
        return json.load(f)


class ExplainRequest(BaseModel):
    term: str


@router.get("")
def list_terms(current_user: User = Depends(get_current_user)):
    return _load_glossary()


@router.get("/{term}")
def get_term(term: str, current_user: User = Depends(get_current_user)):
    glossary = _load_glossary()
    match = next((g for g in glossary if g["term"].lower() == term.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Term '{term}' not found. Use POST /api/glossary/explain for AI lookup.")
    return match


@router.post("/explain")
async def explain(body: ExplainRequest, current_user: User = Depends(get_current_user)):
    glossary = _load_glossary()
    local = next((g for g in glossary if g["term"].lower() == body.term.lower()), None)
    if local:
        return local
    return await explain_term(body.term)
