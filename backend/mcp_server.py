"""
KarSmart MCP Server
-------------------
Exposes KarSmart tax-filing capabilities as MCP tools for AI agents.

Run:
    python mcp_server.py                        # stdio (Claude Desktop / claude CLI)
    mcp dev mcp_server.py                       # MCP inspector (browser UI)

Register with claude CLI:
    claude mcp add karsmart -- python /path/to/backend/mcp_server.py
"""
import sys
import os

# ensure backend package root is on the path when invoked directly
sys.path.insert(0, os.path.dirname(__file__))

from mcp.server.fastmcp import FastMCP

from mcp_tools.tax import get_tax_profile, update_tax_profile, calculate_tax
from mcp_tools.documents import parse_document, generate_itr_xml, validate_itr_xml
from mcp_tools.pan import verify_pan
from mcp_tools.chat import ask_tax_question
from mcp_tools.utils import (
    list_glossary_terms,
    get_glossary_term,
    get_marketplace_offers,
    get_refund_status,
    calculate_tax_usage,
)

mcp = FastMCP(
    "KarSmart",
    instructions=(
        "KarSmart is an AI-powered Indian tax filing assistant. "
        "Use these tools to read/update tax profiles, calculate tax under old and new regimes, "
        "verify PANs, parse tax documents, generate ITR XML, and answer tax questions. "
        "Most tools that touch DB data require a user_id parameter."
    ),
)

# --- Tax profile ---

@mcp.tool()
def tool_get_tax_profile(user_id: int) -> dict:
    """Get the full tax profile for a user (income, deductions, PAN, regime, etc.)."""
    return get_tax_profile(user_id)


@mcp.tool()
def tool_update_tax_profile(user_id: int, field: str, value: str) -> dict:
    """
    Update a single field on a user's tax profile.

    Updatable fields: pan, full_name, dob, filing_type, ay, gross_income,
                      tds_paid, regime, other_income, deductions
    JSON fields (other_income, deductions) accept a JSON string,
    e.g. value='{"80c": 150000, "80d": 25000}'.
    """
    return update_tax_profile(user_id, field, value)


@mcp.tool()
def tool_calculate_tax(user_id: int, regime: str = "both") -> dict:
    """
    Calculate income tax for a user.

    regime: 'old' | 'new' | 'both'
    When 'both', returns a side-by-side comparison and recommends the better regime.
    """
    return calculate_tax(user_id, regime)


# --- Documents ---

@mcp.tool()
def tool_parse_document(content_base64: str, doc_type: str) -> dict:
    """
    Parse a tax document and extract structured fields.

    doc_type: 'form16_pdf' | 'form26as_pdf' | 'ais_json' | 'itr_xml'
    content_base64: base64-encoded file bytes
    """
    return parse_document(content_base64, doc_type)


@mcp.tool()
def tool_generate_itr_xml(user_id: int) -> dict:
    """
    Generate an ITR XML file (ITR-1 or ITR-2) from the user's tax profile.
    Returns form name and base64-encoded XML ready for download or submission.
    """
    return generate_itr_xml(user_id)


@mcp.tool()
def tool_validate_itr_xml(xml_base64: str) -> dict:
    """Validate a base64-encoded ITR XML. Returns {valid, errors}."""
    return validate_itr_xml(xml_base64)


# --- PAN ---

@mcp.tool()
def tool_verify_pan(pan: str, user_id: int | None = None) -> dict:
    """
    Verify a PAN number format and authenticity.
    If user_id is provided and PAN is valid, automatically updates the tax profile.
    """
    return verify_pan(pan, user_id)


# --- AI Chat ---

@mcp.tool()
def tool_ask_tax_question(question: str, user_id: int | None = None) -> dict:
    """
    Ask KarSmart a tax question. Returns a concise AI answer.
    If user_id is provided, the answer is personalised to the user's tax profile.
    """
    return ask_tax_question(question, user_id)


# --- Utilities ---

@mcp.tool()
def tool_list_glossary_terms() -> dict:
    """List all Indian tax terms in the glossary (TDS, ITR, PAN, 80C, HRA, etc.)."""
    return list_glossary_terms()


@mcp.tool()
def tool_get_glossary_term(term: str) -> dict:
    """
    Look up a specific Indian tax term.
    Falls back to AI-generated explanation if the term is not in the local glossary.
    """
    return get_glossary_term(term)


@mcp.tool()
def tool_get_marketplace_offers(refund_amount: float) -> dict:
    """
    Get refund marketplace voucher offers for a given refund amount (₹).
    Returns brand offers (Amazon, Flipkart, Swiggy, etc.) with conversion rates.
    """
    return get_marketplace_offers(refund_amount)


@mcp.tool()
def tool_get_refund_status() -> dict:
    """Get the current ITR refund processing status and timeline."""
    return get_refund_status()


@mcp.tool()
def tool_calculate_tax_usage(tax_paid: float) -> dict:
    """
    Show how a given tax amount (₹) is allocated across government budget categories.
    Returns personalized copy for each category with concrete impact metrics.
    """
    return calculate_tax_usage(tax_paid)


if __name__ == "__main__":
    mcp.run()
