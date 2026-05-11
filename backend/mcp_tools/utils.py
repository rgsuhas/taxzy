"""Glossary, marketplace, refund status, and tax usage MCP tools."""
import asyncio
import json
from pathlib import Path
from services import marketplace as marketplace_service, tax_usage as tax_usage_service
from services.gemini import explain_term

GLOSSARY_FILE = Path(__file__).parent.parent / "data" / "glossary.json"


def _load_glossary() -> list[dict]:
    with open(GLOSSARY_FILE) as f:
        return json.load(f)


def list_glossary_terms() -> dict:
    """Return all tax glossary terms and definitions."""
    return {"terms": _load_glossary()}


def get_glossary_term(term: str) -> dict:
    """
    Look up a specific tax term.
    Falls back to AI explanation if the term is not in the local glossary.
    """
    glossary = _load_glossary()
    match = next((g for g in glossary if g["term"].lower() == term.lower()), None)
    if match:
        return match
    return asyncio.run(explain_term(term))


def get_marketplace_offers(refund_amount: float) -> dict:
    """
    Get available refund marketplace offers for a given refund amount (in ₹).
    Returns voucher offers from brands like Amazon, Flipkart, Swiggy.
    """
    if refund_amount <= 0:
        return {"error": "refund_amount must be greater than 0", "offers": []}
    offers = marketplace_service.get_offers(refund_amount)
    return {"refund_amount": refund_amount, "offers": offers, "total_offers": len(offers)}


def get_refund_status() -> dict:
    """Return the mock ITR refund processing timeline and current status."""
    return {
        "status": "processing",
        "current_step": 2,
        "estimated_date": "2025-03-15",
        "timeline": [
            {"step": 1, "label": "ITR Filed", "date": "2024-07-31", "done": True},
            {"step": 2, "label": "ITR Verified", "date": "2024-08-10", "done": True},
            {"step": 3, "label": "Processing", "date": None, "done": False},
            {"step": 4, "label": "Refund Initiated", "date": None, "done": False},
            {"step": 5, "label": "Amount Credited", "date": None, "done": False},
        ],
    }


def calculate_tax_usage(tax_paid: float) -> dict:
    """
    Show how a given tax payment is allocated across government budget categories.
    Provides personalized copy for each category (e.g. infrastructure, defence, health).
    """
    if tax_paid <= 0:
        return {"error": "tax_paid must be greater than 0"}
    return tax_usage_service.calculate_tax_usage(tax_paid)
