"""
Taxzy MCP Server
----------------
Exposes Taxzy tax-filing capabilities as MCP tools for AI agents.

Run:
    python mcp_server.py                        # stdio (Claude Desktop / claude CLI)
    mcp dev mcp_server.py                       # MCP inspector (browser UI)

Register with claude CLI:
    claude mcp add taxzy -- python /path/to/backend/mcp_server.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from mcp.server.fastmcp import FastMCP

from mcp_tools.onboarding import (
    start_profiling,
    answer_question,
    get_prefill_json,
    recommend_itr_form,
    profile_summary,
)
from mcp_tools.tax import calculate_tax
from mcp_tools.documents import generate_itr_xml, validate_itr_xml
from mcp_tools.pan import verify_pan
from mcp_tools.chat import ask_tax_question
from mcp_tools.utils import get_glossary_term, get_marketplace_offers

mcp = FastMCP(
    "Taxzy",
    instructions=(
        "Taxzy is an AI-powered Indian tax filing assistant (ITR AY 2025-26). "
        "WORKFLOW: Call start_profiling() to begin, then loop answer_question() until done=True. "
        "Then call get_prefill_json() to get the structured payload and tax estimate. "
        "Use recommend_itr_form() at any time to check which ITR form applies. "
        "Use profile_summary() to review collected data. "
        "Use calculate_tax() for a quick estimate if user_id is known. "
        "Use ask_tax_question() for freeform tax Q&A."
    ),
)

# ---------------------------------------------------------------------------
# Onboarding + profiling (primary workflow)
# ---------------------------------------------------------------------------

@mcp.tool()
def tool_start_profiling() -> dict:
    """
    Begin a new user onboarding session.
    Returns the first question and an empty session dict.
    Store the returned `session` and pass it to tool_answer_question on each turn.
    """
    return start_profiling()


@mcp.tool()
def tool_answer_question(session: dict, question_id: str, answer: str) -> dict:
    """
    Submit the user's answer for the current onboarding question.

    session      – the session dict from the previous tool_start_profiling or tool_answer_question call
    question_id  – the id of the question being answered (from the previous response)
    answer       – the user's answer (see hint in the question for accepted formats)

    Returns either:
      - The next question with updated session (done=False)
      - A completion summary with ITR form + regime recommendation (done=True)
    """
    return answer_question(session, question_id, answer)


@mcp.tool()
def tool_get_prefill_json(session: dict) -> dict:
    """
    Convert the completed questionnaire session into a structured JSON pre-fill payload.

    Returns:
      profile_payload  – ready to PATCH /api/tax-profile on the Taxzy backend
      filing_info      – recommended ITR form and assessment year
      tax_estimate     – side-by-side old vs new regime comparison with refund/payable amounts
      missing_fields   – fields still needed before filing can proceed
      ready_to_file    – True if all required fields are present
    """
    return get_prefill_json(session)


@mcp.tool()
def tool_recommend_itr_form(session: dict) -> dict:
    """
    Determine the correct ITR form (ITR-1 / ITR-2 / ITR-4) given the current session answers.
    Can be called at any point — even mid-questionnaire for early guidance.

    Returns the form name, plain-language reason, and eligibility flags.
    """
    return recommend_itr_form(session)


@mcp.tool()
def tool_profile_summary(session: dict) -> dict:
    """
    Return a human-readable summary of what has been collected in the session so far,
    completion percentage, and list of still-missing required fields.
    """
    return profile_summary(session)


# ---------------------------------------------------------------------------
# Tax calculation
# ---------------------------------------------------------------------------

@mcp.tool()
def tool_calculate_tax(user_id: int, regime: str = "both") -> dict:
    """
    Calculate income tax for a registered user by user_id.

    regime: 'old' | 'new' | 'both' (default: both — returns side-by-side comparison)
    Use tool_get_prefill_json instead if the user hasn't registered yet.
    """
    return calculate_tax(user_id, regime)


# ---------------------------------------------------------------------------
# Documents
# ---------------------------------------------------------------------------

@mcp.tool()
def tool_generate_itr_xml(user_id: int) -> dict:
    """
    Generate an ITR XML file (ITR-1 or ITR-2) from the registered user's tax profile.
    Returns form name and base64-encoded XML ready for download or submission.
    """
    return generate_itr_xml(user_id)


@mcp.tool()
def tool_validate_itr_xml(xml_base64: str) -> dict:
    """Validate a base64-encoded ITR XML. Returns {valid, errors}."""
    return validate_itr_xml(xml_base64)


# ---------------------------------------------------------------------------
# PAN verification
# ---------------------------------------------------------------------------

@mcp.tool()
def tool_verify_pan(pan: str, user_id: int | None = None) -> dict:
    """
    Verify a PAN number format and authenticity.
    If user_id is provided and PAN is valid, automatically updates the tax profile.
    """
    return verify_pan(pan, user_id)


# ---------------------------------------------------------------------------
# AI chat + utilities
# ---------------------------------------------------------------------------

@mcp.tool()
def tool_ask_tax_question(question: str, user_id: int | None = None) -> dict:
    """
    Ask Taxzy a freeform tax question. Returns a concise AI answer.
    If user_id is provided, the answer is personalised to the user's tax profile.
    """
    return ask_tax_question(question, user_id)


@mcp.tool()
def tool_get_glossary_term(term: str) -> dict:
    """
    Look up an Indian tax term (TDS, ITR, 80C, HRA, AIS, etc.).
    Falls back to an AI-generated explanation if the term is not in the local glossary.
    """
    return get_glossary_term(term)


@mcp.tool()
def tool_get_marketplace_offers(refund_amount: float) -> dict:
    """
    Get refund marketplace voucher offers for a given refund amount (₹).
    Returns brand offers (Amazon, Flipkart, Swiggy, etc.) with conversion rates.
    """
    return get_marketplace_offers(refund_amount)


if __name__ == "__main__":
    mcp.run()
