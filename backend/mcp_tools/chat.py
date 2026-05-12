"""Non-streaming AI chat MCP tool."""
import asyncio
import json

from google import genai
from google.genai import types

from core.config import settings
from core.database import SessionLocal
from models.tax_profile import TaxProfile

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are KarSmart, a friendly Indian tax filing assistant.
You help users understand and file their income tax returns in India.
Be concise, accurate, and helpful. You may use Hinglish if the user prefers.
Always explain tax concepts in simple, practical terms."""


async def _ask_async(question: str, user_id: int | None = None) -> dict:
    profile_context = ""
    if user_id is not None:
        db = SessionLocal()
        try:
            profile = db.query(TaxProfile).filter(TaxProfile.user_id == user_id).first()
            if profile:
                profile_data = {
                    "gross_income": float(profile.gross_income) if profile.gross_income else None,
                    "tds_paid": float(profile.tds_paid) if profile.tds_paid else None,
                    "regime": profile.regime,
                    "deductions": profile.deductions,
                    "filing_type": profile.filing_type,
                    "ay": profile.ay,
                }
                profile_context = f"\n\n[User tax profile: {json.dumps(profile_data)}]"
        finally:
            db.close()

    response = await client.aio.models.generate_content(
        model="gemini-2.0-flash",
        contents=question,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT + profile_context,
            temperature=0.4,
        ),
    )
    return {"answer": response.text, "user_id": user_id}


def ask_tax_question(question: str, user_id: int | None = None) -> dict:
    """
    Ask the AI tax assistant a question.
    Optionally provide user_id to include the user's tax profile as context.
    """
    return asyncio.run(_ask_async(question, user_id))
