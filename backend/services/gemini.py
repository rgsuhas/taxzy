import json
import logging
import time
from typing import AsyncGenerator, Optional

from google import genai
from google.genai import types

from core.config import settings

logger = logging.getLogger("taxzy.gemini")

client = genai.Client(api_key=settings.GEMINI_API_KEY)

SYSTEM_PROMPT = """You are Taxzy, a friendly and knowledgeable Indian tax filing assistant. \
Your job is to guide users through filing their Indian income tax return (ITR) step by step.

## Knowledge Base
You are well-versed in:
- Old vs New tax regime (AY 2025-26 / FY 2024-25)
- Deductions: 80C (up to ₹1.5L), 80D (health insurance), HRA, standard deduction (₹75,000 under new regime)
- Documents: Form 16, AIS, Form 26AS, ITR-1, ITR-2, ITR-4
- TDS reconciliation, advance tax, self-assessment tax, refunds

## Conversation Style
- Ask **ONE question at a time** — never fire multiple questions in the same turn.
- Acknowledge what the user just told you before asking the next question.
- Use simple language; avoid jargon unless the user uses it first.
- You may reply in Hinglish if the user writes in Hindi or Hinglish.
- If a number seems unusual (e.g., income of ₹10 crore for a salaried person), gently confirm.
- Never ask for OTPs, passwords, or bank account credentials.

## Guided Flow (follow this order unless the user jumps ahead)
1. Filing type — salaried, freelancer, or both?
2. Gross annual income (CTC or total receipts)
3. TDS already deducted (from Form 16 / AIS)
4. 80C investments (PF, PPF, ELSS, LIC, etc.)
5. 80D health insurance premiums
6. HRA — if salaried and paying rent
7. Other deductions or income (interest, capital gains, etc.)
8. Preferred tax regime — explain the trade-off if they're unsure
9. Confirm PAN and assessment year

## Few-Shot Examples

### Example 1 — Greeting / first message
User: Hi, I need to file my taxes.
Taxzy: Hey! Welcome to Taxzy 😊 I'll help you file your ITR quickly. \
To get started — are you filing as a **salaried employee**, a **freelancer/self-employed**, or **both**?

### Example 2 — User provides income
User: My salary is 12 lakhs per year.
Taxzy: Got it — ₹12,00,000 gross annual income. \
Has your employer deducted any TDS so far? You can find this on your Form 16 or in AIS on the Income Tax portal.

### Example 3 — User is unsure about regime
User: I don't know which regime to pick.
Taxzy: No worries, I'll help you compare! Under the **New Regime** you get a flat standard deduction of ₹75,000 \
but most other deductions (80C, 80D, HRA) are not available. Under the **Old Regime** you can claim all those \
deductions but tax rates are slightly higher. Based on your profile, let me calculate which saves you more — \
can you tell me roughly how much you've invested under 80C (PF, ELSS, LIC, etc.) this year?

### Example 4 — User provides deductions
User: I have 1.5 lakh in PPF and 25000 in health insurance.
Taxzy: Perfect — ₹1,50,000 under 80C (maxed out!) and ₹25,000 under 80D. \
Do you pay rent? If yes, I can also check if you're eligible for HRA exemption.

### Example 5 — Out-of-scope question
User: Can you help me file GST returns?
Taxzy: I'm specialised in **income tax (ITR) filing** and can't help with GST right now. \
Is there anything related to your income tax return I can assist with?
"""

_EXTRACTION_FEW_SHOTS = """
## Examples

Input:
  User: My salary is 8 lakh per annum and my employer deducted 45000 as TDS.
  Assistant: Got it — ₹8,00,000 income and ₹45,000 TDS noted. Do you have any 80C investments?
Output:
{"income": 800000, "tds": 45000, "deductions": null, "pan": null, "filing_type": null}

Input:
  User: I'm a freelancer, earned about 15 lakhs last year. PAN is ABCDE1234F.
  Assistant: Great, noted ₹15,00,000 freelance income and PAN ABCDE1234F.
Output:
{"income": 1500000, "tds": null, "deductions": null, "pan": "ABCDE1234F", "filing_type": "freelancer"}

Input:
  User: I invested 1.2 lakh in ELSS and pay 18000 for health insurance.
  Assistant: Noted — ₹1,20,000 under 80C and ₹18,000 under 80D.
Output:
{"income": null, "tds": null, "deductions": {"80c": 120000, "80d": 18000, "hra": null}, "pan": null, "filing_type": null}

Input:
  User: What is the deadline for filing?
  Assistant: The deadline for AY 2025-26 is 31 July 2025 for most individuals.
Output:
{"income": null, "tds": null, "deductions": null, "pan": null, "filing_type": null}
"""


def _strip_markdown_json(text: str) -> str:
    text = text.strip()
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    return text.strip()


async def stream_chat(messages: list[dict], user_profile: Optional[dict] = None) -> AsyncGenerator[str, None]:
    profile_context = ""
    if user_profile:
        profile_context = f"\n\n[User's current tax profile on file: {json.dumps(user_profile)}. Use this to avoid re-asking questions already answered.]"

    contents = []
    for i, msg in enumerate(messages):
        role = "user" if msg["role"] == "user" else "model"
        content = msg["content"]
        if i == 0 and profile_context:
            content = profile_context + "\n\n" + content
        contents.append(types.Content(role=role, parts=[types.Part(text=content)]))

    config = types.GenerateContentConfig(
        system_instruction=SYSTEM_PROMPT,
        temperature=0.4,
    )

    user_snippet = messages[-1]["content"][:80] if messages else ""
    logger.info("stream_chat start | turns=%d profile=%s msg=%r", len(messages), bool(user_profile), user_snippet)
    t0 = time.perf_counter()
    total_chars = 0

    try:
        async for chunk in await client.aio.models.generate_content_stream(
            model="gemini-2.0-flash",
            contents=contents,
            config=config,
        ):
            if chunk.text:
                total_chars += len(chunk.text)
                yield chunk.text
    except Exception:
        logger.exception("stream_chat error | turns=%d", len(messages))
        raise

    elapsed = time.perf_counter() - t0
    logger.info("stream_chat done | chars=%d elapsed=%.2fs", total_chars, elapsed)


async def extract_tax_fields(full_response: str, user_message: str) -> dict:
    prompt = f"""You are a data-extraction assistant. Read the conversation exchange below and return a JSON \
object containing ONLY the tax fields explicitly stated by the user. Do not infer or guess values.
{_EXTRACTION_FEW_SHOTS}
## Now extract from this exchange
User: {user_message}
Assistant: {full_response}

Return ONLY valid JSON. No markdown, no explanation.
Fields: income (number|null), tds (number|null), deductions ({{80c, 80d, hra}} or null), pan (string|null), filing_type ("salaried"|"freelancer"|"both"|null)"""

    logger.debug("extract_tax_fields | user_msg=%r", user_message[:60])
    t0 = time.perf_counter()
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.0),
        )
        text = _strip_markdown_json(response.text)
        result = json.loads(text)
        elapsed = time.perf_counter() - t0
        logger.info("extract_tax_fields done | extracted=%s elapsed=%.2fs", list(k for k, v in result.items() if v is not None), elapsed)
        return result
    except json.JSONDecodeError:
        logger.warning("extract_tax_fields JSON parse failed | raw=%r", response.text[:200] if response else "no response")
        return {}
    except Exception:
        logger.exception("extract_tax_fields error")
        return {}


async def explain_term(term: str) -> dict:
    prompt = f"""Explain the Indian tax term "{term}" in plain English for a first-time filer.
Return ONLY valid JSON — no markdown, no extra text.
Schema: {{"term": string, "definition": string (≤100 words), "example": string (practical, ≤60 words)}}"""

    logger.debug("explain_term | term=%r", term)
    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2),
        )
        text = _strip_markdown_json(response.text)
        return json.loads(text)
    except Exception:
        logger.warning("explain_term failed | term=%r", term)
        return {"term": term, "definition": "Definition not available.", "example": ""}
