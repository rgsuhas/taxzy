"""
Smart onboarding MCP tools — stateless questionnaire + JSON pre-fill.

Session state is a plain dict the caller holds between turns; no DB required.
"""
from __future__ import annotations

import json
from typing import Any

from services import tax_calculator

# ---------------------------------------------------------------------------
# Questionnaire definition
# ---------------------------------------------------------------------------

# Each question:
#   id          – stable key used in session dict
#   text        – what to ask the user
#   hint        – brief format hint shown after the question
#   type        – "choice" | "number" | "text" | "yesno" | "date"
#   choices     – list of (value, label) for "choice" questions
#   depends_on  – {field: value} — skip unless session contains this field/value
#   optional    – if True, user can skip (answer "" or "skip")

QUESTIONS: list[dict] = [
    {
        "id": "filing_type",
        "text": "Are you primarily salaried, a freelancer/consultant, or do you have both types of income?",
        "hint": "Reply: salaried / freelancer / both",
        "type": "choice",
        "choices": [("salaried", "Salaried employee"), ("freelancer", "Freelancer / self-employed"), ("both", "Both")],
    },
    {
        "id": "ay",
        "text": "Which Assessment Year are you filing for?",
        "hint": "E.g. 2025-26 (current year) or 2024-25",
        "type": "choice",
        "choices": [("2025-26", "AY 2025-26 (FY 2024-25)"), ("2024-25", "AY 2024-25 (FY 2023-24)")],
    },
    {
        "id": "full_name",
        "text": "What is your full name as it appears on your PAN card?",
        "hint": "E.g. Rahul Sharma",
        "type": "text",
    },
    {
        "id": "pan",
        "text": "What is your PAN number?",
        "hint": "10-character alphanumeric, e.g. ABCDE1234F",
        "type": "text",
        "optional": True,
    },
    {
        "id": "dob",
        "text": "Date of birth? (Used to determine senior citizen slab eligibility)",
        "hint": "Format: YYYY-MM-DD",
        "type": "date",
        "optional": True,
    },
    {
        "id": "gross_income",
        "text": "What is your gross annual income (before any deductions)?",
        "hint": "Enter amount in ₹, e.g. 1200000 for ₹12 lakh",
        "type": "number",
    },
    {
        "id": "tds_paid",
        "text": "How much TDS has already been deducted (from Form 16 or AIS)?",
        "hint": "Enter ₹ amount, or 0 if none",
        "type": "number",
    },
    {
        "id": "has_80c",
        "text": "Did you make any 80C investments? (PPF, ELSS, LIC premium, EPF, home loan principal, etc.)",
        "hint": "Reply: yes / no",
        "type": "yesno",
    },
    {
        "id": "deductions_80c",
        "text": "Total 80C investments amount?",
        "hint": "Max ₹1,50,000. Enter ₹ amount.",
        "type": "number",
        "depends_on": {"has_80c": "yes"},
    },
    {
        "id": "has_80d",
        "text": "Do you pay health insurance premiums (80D)?",
        "hint": "Reply: yes / no",
        "type": "yesno",
    },
    {
        "id": "deductions_80d",
        "text": "Total health insurance premium paid this year?",
        "hint": "Max ₹25,000 (₹50,000 for senior citizens). Enter ₹ amount.",
        "type": "number",
        "depends_on": {"has_80d": "yes"},
    },
    {
        "id": "has_hra",
        "text": "Are you a salaried employee paying rent and receiving HRA from employer?",
        "hint": "Reply: yes / no",
        "type": "yesno",
        "depends_on": {"filing_type": "salaried"},
    },
    {
        "id": "deductions_hra",
        "text": "What is the HRA exemption amount? (Check your Form 16 Part B, Sec 10(13A))",
        "hint": "Enter ₹ amount, or 0 if unsure",
        "type": "number",
        "depends_on": {"has_hra": "yes"},
    },
    {
        "id": "has_other_income",
        "text": "Do you have any other income? (interest from FD/savings, dividends, capital gains, rental income)",
        "hint": "Reply: yes / no",
        "type": "yesno",
    },
    {
        "id": "other_interest",
        "text": "Interest income from FD / savings bank account this year?",
        "hint": "Enter ₹ amount, or 0",
        "type": "number",
        "depends_on": {"has_other_income": "yes"},
    },
    {
        "id": "other_dividends",
        "text": "Dividend income from shares or mutual funds?",
        "hint": "Enter ₹ amount, or 0",
        "type": "number",
        "depends_on": {"has_other_income": "yes"},
    },
    {
        "id": "other_capital_gains",
        "text": "Capital gains from sale of shares or mutual funds?",
        "hint": "Enter ₹ amount (short-term + long-term combined), or 0",
        "type": "number",
        "depends_on": {"has_other_income": "yes"},
    },
    {
        "id": "regime_preference",
        "text": "Do you have a preferred tax regime, or should we recommend the best one for you?",
        "hint": "Reply: old / new / recommend",
        "type": "choice",
        "choices": [("old", "Old regime (maximise deductions)"), ("new", "New regime (flat lower rates)"), ("recommend", "Recommend the best for me")],
    },
]

_QUESTION_INDEX: dict[str, dict] = {q["id"]: q for q in QUESTIONS}


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _next_question(session: dict) -> dict | None:
    """Return the next unanswered question that applies given current session state."""
    for q in QUESTIONS:
        if q["id"] in session:
            continue
        dep = q.get("depends_on")
        if dep:
            key, val = next(iter(dep.items()))
            if session.get(key) != val:
                continue
        return q
    return None


def _session_to_profile(session: dict) -> dict:
    """Convert questionnaire session into a structured profile dict."""
    deductions: dict[str, float] = {}
    if float(session.get("deductions_80c") or 0) > 0:
        deductions["80c"] = float(session["deductions_80c"])
    if float(session.get("deductions_80d") or 0) > 0:
        deductions["80d"] = float(session["deductions_80d"])
    if float(session.get("deductions_hra") or 0) > 0:
        deductions["hra"] = float(session["deductions_hra"])

    other_income: dict[str, float] = {}
    if float(session.get("other_interest") or 0) > 0:
        other_income["interest"] = float(session["other_interest"])
    if float(session.get("other_dividends") or 0) > 0:
        other_income["dividends"] = float(session["other_dividends"])
    if float(session.get("other_capital_gains") or 0) > 0:
        other_income["capital_gains"] = float(session["other_capital_gains"])

    return {
        "full_name": session.get("full_name"),
        "pan": session.get("pan"),
        "dob": session.get("dob"),
        "filing_type": session.get("filing_type"),
        "ay": session.get("ay", "2025-26"),
        "gross_income": float(session.get("gross_income") or 0) or None,
        "tds_paid": float(session.get("tds_paid") or 0),
        "deductions": deductions or None,
        "other_income": other_income or None,
        "regime": None if session.get("regime_preference") == "recommend" else session.get("regime_preference"),
    }


def _determine_itr_form(session: dict) -> tuple[str, str]:
    """Return (form_name, reason)."""
    filing_type = session.get("filing_type", "salaried")
    capital_gains = float(session.get("other_capital_gains") or 0)
    dividends = float(session.get("other_dividends") or 0)
    other_interest = float(session.get("other_interest") or 0)

    if filing_type in ("freelancer", "both"):
        return "ITR-4", "Business/freelance income requires ITR-4 (Sugam) for presumptive taxation, or ITR-3 for full books."
    if capital_gains > 0 or dividends > 0:
        return "ITR-2", "Capital gains or dividend income requires ITR-2."
    if other_interest > 10000:
        return "ITR-2", "Interest income above ₹10,000 from non-savings sources typically needs ITR-2."
    return "ITR-1", "Salaried income with standard deductions — ITR-1 (Sahaj) applies."


def _regime_recommendation(session: dict) -> dict:
    """Compare old vs new regime and return the recommended one with numbers."""
    gross = float(session.get("gross_income") or 0)
    tds = float(session.get("tds_paid") or 0)
    d80c = float(session.get("deductions_80c") or 0)
    d80d = float(session.get("deductions_80d") or 0)
    hra = float(session.get("deductions_hra") or 0)

    if not gross:
        return {"recommended": "new", "reason": "Income not provided yet — defaulting to new regime."}

    old = tax_calculator.calculate_old_regime(gross, tds, d80c, d80d, hra)
    new = tax_calculator.calculate_new_regime(gross, tds)
    recommended = "new" if new["tax_liability"] <= old["tax_liability"] else "old"
    saving = abs(old["tax_liability"] - new["tax_liability"])

    return {
        "recommended": recommended,
        "old_tax_liability": old["tax_liability"],
        "new_tax_liability": new["tax_liability"],
        "saving": saving,
        "reason": (
            f"{'New' if recommended == 'new' else 'Old'} regime saves you ₹{saving:,.0f}. "
            f"Old: ₹{old['tax_liability']:,.0f} | New: ₹{new['tax_liability']:,.0f}"
        ),
    }


def _completion_percent(session: dict) -> int:
    applicable = [
        q["id"] for q in QUESTIONS
        if not q.get("depends_on") or session.get(next(iter(q["depends_on"]))) == next(iter(q["depends_on"].values()))
    ]
    if not applicable:
        return 0
    filled = sum(1 for qid in applicable if qid in session)
    return round(filled / len(applicable) * 100)


# ---------------------------------------------------------------------------
# Public MCP tool functions
# ---------------------------------------------------------------------------

def start_profiling() -> dict:
    """
    Start a new onboarding session.
    Returns the first question and an empty session dict.
    The caller must store `session` and pass it back to `answer_question`.
    """
    first = QUESTIONS[0]
    return {
        "session": {},
        "question_id": first["id"],
        "question": first["text"],
        "hint": first.get("hint", ""),
        "type": first["type"],
        "choices": [{"value": v, "label": l} for v, l in first.get("choices", [])],
        "optional": first.get("optional", False),
        "progress": {"answered": 0, "completion_pct": 0},
        "done": False,
    }


def answer_question(session: dict[str, Any], question_id: str, answer: str) -> dict:
    """
    Submit an answer for the current question.
    Returns either the next question (done=False) or a completion summary (done=True).

    session      – the session dict from the previous call (start_profiling or answer_question)
    question_id  – the id of the question being answered (from the previous response)
    answer       – the user's raw answer string
    """
    session = dict(session)  # don't mutate caller's dict

    q = _QUESTION_INDEX.get(question_id)
    if not q:
        return {"error": f"Unknown question_id '{question_id}'"}

    # Normalise and validate
    raw = answer.strip()
    skip = raw.lower() in ("", "skip", "-") and q.get("optional")

    if skip:
        session[question_id] = None  # mark as explicitly skipped so _next_question advances
    else:
        if q["type"] == "choice":
            valid = [v for v, _ in q.get("choices", [])]
            if raw.lower() not in [v.lower() for v in valid]:
                return {
                    "error": f"Invalid choice '{raw}'. Valid options: {', '.join(valid)}",
                    "question_id": question_id,
                    "question": q["text"],
                    "hint": q.get("hint", ""),
                    "type": q["type"],
                    "choices": [{"value": v, "label": l} for v, l in q.get("choices", [])],
                    "session": session,
                    "done": False,
                }
            raw = raw.lower()

        elif q["type"] == "yesno":
            if raw.lower() not in ("yes", "no", "y", "n"):
                return {
                    "error": "Please answer yes or no.",
                    "question_id": question_id,
                    "question": q["text"],
                    "hint": q.get("hint", ""),
                    "type": "yesno",
                    "session": session,
                    "done": False,
                }
            raw = "yes" if raw.lower() in ("yes", "y") else "no"

        elif q["type"] == "number":
            try:
                # accept "1,50,000" or "1.5 lakh" patterns
                cleaned = raw.replace(",", "").replace(" ", "").lower()
                if cleaned.endswith("lakh"):
                    cleaned = str(float(cleaned[:-4]) * 100000)
                elif cleaned.endswith("l"):
                    cleaned = str(float(cleaned[:-1]) * 100000)
                elif cleaned.endswith("cr"):
                    cleaned = str(float(cleaned[:-2]) * 10000000)
                raw = str(float(cleaned))
            except ValueError:
                return {
                    "error": f"Expected a number, got '{raw}'. You can use formats like 1200000 or '12 lakh'.",
                    "question_id": question_id,
                    "question": q["text"],
                    "hint": q.get("hint", ""),
                    "type": "number",
                    "session": session,
                    "done": False,
                }

        session[question_id] = raw

    next_q = _next_question(session)

    if next_q:
        return {
            "session": session,
            "question_id": next_q["id"],
            "question": next_q["text"],
            "hint": next_q.get("hint", ""),
            "type": next_q["type"],
            "choices": [{"value": v, "label": l} for v, l in next_q.get("choices", [])],
            "optional": next_q.get("optional", False),
            "progress": {
                "answered": len(session),
                "completion_pct": _completion_percent(session),
            },
            "done": False,
        }

    # Questionnaire complete — return summary
    itr_form, itr_reason = _determine_itr_form(session)
    regime_rec = _regime_recommendation(session)

    return {
        "session": session,
        "done": True,
        "summary": _profile_summary_from_session(session),
        "recommended_itr_form": itr_form,
        "itr_reason": itr_reason,
        "regime_recommendation": regime_rec,
        "next_step": "Call get_prefill_json(session) to get the JSON payload ready to POST to the backend.",
    }


def get_prefill_json(session: dict[str, Any]) -> dict:
    """
    Convert a completed (or partial) questionnaire session into a structured
    JSON pre-fill payload ready to PATCH /api/tax-profile on the Taxzy backend.

    Returns:
        profile_payload  – body for PATCH /api/tax-profile
        filing_info      – recommended ITR form + regime with reasoning
        tax_estimate     – quick old vs new regime comparison (if income is known)
        missing_fields   – list of fields still needed before filing
    """
    profile = _session_to_profile(session)
    itr_form, itr_reason = _determine_itr_form(session)

    # Identify missing required fields
    required = ["full_name", "pan", "filing_type", "ay", "gross_income"]
    missing = [f for f in required if not profile.get(f)]

    tax_estimate: dict = {}
    if profile.get("gross_income"):
        d = profile.get("deductions") or {}
        old = tax_calculator.calculate_old_regime(
            profile["gross_income"],
            profile.get("tds_paid") or 0,
            float(d.get("80c") or 0),
            float(d.get("80d") or 0),
            float(d.get("hra") or 0),
        )
        new = tax_calculator.calculate_new_regime(
            profile["gross_income"],
            profile.get("tds_paid") or 0,
        )
        recommended = "new" if new["tax_liability"] <= old["tax_liability"] else "old"
        tax_estimate = {
            "old_regime": {"tax_liability": old["tax_liability"], "refund_or_payable": old["refund_or_payable"]},
            "new_regime": {"tax_liability": new["tax_liability"], "refund_or_payable": new["refund_or_payable"]},
            "recommended_regime": recommended,
            "saving": abs(old["tax_liability"] - new["tax_liability"]),
        }
        if not profile["regime"]:
            profile["regime"] = recommended

    return {
        "profile_payload": profile,
        "filing_info": {
            "recommended_itr_form": itr_form,
            "reason": itr_reason,
            "ay": profile.get("ay", "2025-26"),
        },
        "tax_estimate": tax_estimate,
        "missing_fields": missing,
        "ready_to_file": len(missing) == 0,
    }


def recommend_itr_form(session: dict[str, Any]) -> dict:
    """
    Determine the correct ITR form based on current session answers.
    Can be called at any point during the questionnaire.

    Returns the recommended form (ITR-1 / ITR-2 / ITR-4) with a plain-language explanation.
    """
    itr_form, reason = _determine_itr_form(session)
    filing_type = session.get("filing_type", "unknown")
    capital_gains = float(session.get("other_capital_gains") or 0)
    has_business = filing_type in ("freelancer", "both")

    notes = []
    if not session.get("filing_type"):
        notes.append("filing_type not answered yet — recommendation may change.")
    if not session.get("has_other_income"):
        notes.append("Other income not confirmed yet — capital gains / dividend answers may change the form.")

    return {
        "recommended_form": itr_form,
        "reason": reason,
        "eligibility_flags": {
            "salaried_only": filing_type == "salaried",
            "has_business_income": has_business,
            "has_capital_gains": capital_gains > 0,
            "needs_itr2": itr_form == "ITR-2",
            "needs_itr4": itr_form == "ITR-4",
        },
        "notes": notes,
    }


def profile_summary(session: dict[str, Any]) -> dict:
    """
    Return a human-readable summary of what has been collected so far
    and what fields are still missing.
    """
    return _profile_summary_from_session(session)


# ---------------------------------------------------------------------------
# Internal summary builder
# ---------------------------------------------------------------------------

def _profile_summary_from_session(session: dict) -> dict:
    def fmt_inr(v: Any) -> str:
        try:
            return f"₹{float(v):,.0f}"
        except (TypeError, ValueError):
            return str(v)

    collected = {}
    if session.get("full_name"):
        collected["Name"] = session["full_name"]
    if session.get("pan"):
        collected["PAN"] = session["pan"]
    if session.get("dob"):
        collected["Date of birth"] = session["dob"]
    if session.get("filing_type"):
        collected["Filing type"] = session["filing_type"]
    if session.get("ay"):
        collected["Assessment year"] = session["ay"]
    if session.get("gross_income"):
        collected["Gross income"] = fmt_inr(session["gross_income"])
    if session.get("tds_paid"):
        collected["TDS paid"] = fmt_inr(session["tds_paid"])
    if session.get("deductions_80c"):
        collected["80C deductions"] = fmt_inr(session["deductions_80c"])
    if session.get("deductions_80d"):
        collected["80D (health insurance)"] = fmt_inr(session["deductions_80d"])
    if session.get("deductions_hra"):
        collected["HRA exemption"] = fmt_inr(session["deductions_hra"])
    if session.get("other_interest"):
        collected["Interest income"] = fmt_inr(session["other_interest"])
    if session.get("other_dividends"):
        collected["Dividend income"] = fmt_inr(session["other_dividends"])
    if session.get("other_capital_gains"):
        collected["Capital gains"] = fmt_inr(session["other_capital_gains"])
    if session.get("regime_preference"):
        collected["Regime preference"] = session["regime_preference"]

    required = ["full_name", "pan", "filing_type", "ay", "gross_income", "tds_paid", "regime_preference"]
    missing_required = [f for f in required if f not in session]

    return {
        "collected": collected,
        "completion_pct": _completion_percent(session),
        "missing_required": missing_required,
        "ready_for_prefill": len(missing_required) == 0,
    }
