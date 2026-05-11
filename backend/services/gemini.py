import json
from typing import AsyncGenerator, Optional

import google.generativeai as genai

from core.config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are Taxzy, a friendly and knowledgeable Indian tax filing assistant.
You help users file their income tax returns in India. You understand the Indian tax system including:
- Old and New tax regimes (AY 2024-25)
- Deductions under 80C, 80D, HRA, standard deduction
- Form 16, AIS, Form 26AS, ITR forms
- TDS, advance tax, refunds

Guidelines:
- Ask ONE question at a time to collect tax information
- You may respond in Hinglish (mix of Hindi and English) if the user prefers
- Be encouraging and explain tax concepts in simple terms
- When the user provides financial information, acknowledge it and ask the next relevant question
- Never ask for sensitive information beyond what's needed for tax filing
- Always confirm details before moving forward

When extracting information from conversations, look for:
- Gross income / salary
- TDS deducted by employer
- Deductions (80C investments, health insurance 80D, HRA)
- PAN number
- Filing type (salaried/freelancer/both)
"""


async def stream_chat(messages: list[dict], user_profile: Optional[dict] = None) -> AsyncGenerator[str, None]:
    model = genai.GenerativeModel(
        model_name="gemini-1.5-flash",
        system_instruction=SYSTEM_PROMPT,
    )

    profile_context = ""
    if user_profile:
        profile_context = f"\n\n[Current tax profile: {json.dumps(user_profile)}]"

    history = []
    for msg in messages[:-1]:
        history.append({"role": msg["role"], "parts": [msg["content"] + (profile_context if msg == messages[0] else "")]})

    chat = model.start_chat(history=history)
    last_message = messages[-1]["content"] if messages else ""

    response = await chat.send_message_async(last_message, stream=True)

    async for chunk in response:
        if chunk.text:
            yield chunk.text


async def extract_tax_fields(full_response: str, user_message: str) -> dict:
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")

    prompt = f"""Extract any tax-related information from this conversation exchange.
User said: {user_message}
Assistant replied: {full_response}

Return a JSON object with ONLY the fields that were clearly mentioned. Use null for fields not mentioned.
Fields to extract:
- income: annual gross income in rupees (number or null)
- tds: TDS already deducted in rupees (number or null)
- deductions: object with 80c, 80d, hra values in rupees (or null)
- pan: PAN number string (or null)
- filing_type: "salaried", "freelancer", or "both" (or null)

Respond with ONLY valid JSON, no explanation."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {}


async def explain_term(term: str) -> dict:
    model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    prompt = f"""Explain the Indian tax term "{term}" in simple terms.
Return JSON: {{"term": "{term}", "definition": "...", "example": "..."}}
Keep definition under 100 words. Example should be practical.
Respond with ONLY valid JSON."""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {"term": term, "definition": "Definition not available.", "example": ""}
