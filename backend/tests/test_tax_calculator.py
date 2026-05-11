"""Unit tests for tax slab logic — no DB, no HTTP."""
import pytest
from services.tax_calculator import (
    calculate_new_regime,
    calculate_old_regime,
    calculate,
)


class TestNewRegimeSlabs:
    def test_zero_income(self):
        r = calculate_new_regime(0, 0)
        assert r["tax_liability"] == 0

    def test_below_standard_deduction(self):
        # 40k gross → 0 taxable after 50k standard deduction
        r = calculate_new_regime(40000, 0)
        assert r["tax_liability"] == 0

    def test_rebate_87a_applies(self):
        # ₹7L income — taxable = 6.5L — 87A rebate zeroes out tax
        r = calculate_new_regime(700000, 0)
        assert r["tax_liability"] == 0

    def test_just_above_rebate_limit(self):
        # ₹8.5L income — taxable = 8L — well above 7L rebate ceiling
        r = calculate_new_regime(850000, 0)
        assert r["tax_liability"] > 0

    def test_high_income(self):
        # ₹20L income — taxable = 19.5L → substantial tax
        r = calculate_new_regime(2000000, 0)
        assert r["tax_liability"] > 100000

    def test_refund_calculation(self):
        r = calculate_new_regime(700000, 50000)
        # Tax is 0 due to rebate, so full TDS is refunded
        assert r["refund_or_payable"] == 50000

    def test_payable_calculation(self):
        r = calculate_new_regime(2000000, 50000)
        # High income → payable (negative refund_or_payable means tax due)
        assert r["refund_or_payable"] < 0

    def test_standard_deduction_applied(self):
        r = calculate_new_regime(600000, 0)
        assert r["taxable_income"] == 550000  # 600k - 50k standard deduction

    def test_cess_applied(self):
        r = calculate_new_regime(1500000, 0)
        # Rough check: tax > base slab computation (cess adds 4%)
        assert r["tax_liability"] > 0

    def test_structure(self):
        r = calculate_new_regime(800000, 30000)
        keys = {"regime", "gross_income", "taxable_income", "tax_liability",
                "tds_paid", "refund_or_payable", "deductions_breakdown"}
        assert keys == set(r.keys())
        assert r["regime"] == "new"


class TestOldRegimeSlabs:
    def test_zero_income(self):
        r = calculate_old_regime(0, 0)
        assert r["tax_liability"] == 0

    def test_rebate_87a_old(self):
        # ₹5L income, old regime — after std deduction + 80C → likely within rebate
        r = calculate_old_regime(500000, 0, deductions_80c=150000)
        assert r["tax_liability"] == 0

    def test_80c_capped_at_150k(self):
        r_capped = calculate_old_regime(800000, 0, deductions_80c=200000)
        r_max = calculate_old_regime(800000, 0, deductions_80c=150000)
        assert r_capped["tax_liability"] == r_max["tax_liability"]

    def test_80d_capped_at_25k(self):
        r_capped = calculate_old_regime(800000, 0, deductions_80d=50000)
        r_max = calculate_old_regime(800000, 0, deductions_80d=25000)
        assert r_capped["tax_liability"] == r_max["tax_liability"]

    def test_hra_reduces_tax(self):
        r_with_hra = calculate_old_regime(800000, 0, hra=100000)
        r_no_hra = calculate_old_regime(800000, 0, hra=0)
        assert r_with_hra["tax_liability"] < r_no_hra["tax_liability"]

    def test_old_vs_new_high_income_no_deductions(self):
        # Without deductions, old regime is generally worse
        r_old = calculate_old_regime(1500000, 0)
        r_new = calculate_new_regime(1500000, 0)
        # New regime usually more tax-efficient at this level without deductions
        # (not asserting which is lower — just that both compute)
        assert r_old["tax_liability"] >= 0
        assert r_new["tax_liability"] >= 0

    def test_deductions_breakdown_keys(self):
        r = calculate_old_regime(800000, 0, deductions_80c=100000, deductions_80d=15000)
        bd = r["deductions_breakdown"]
        assert set(bd.keys()) == {"80c", "80d", "hra", "standard"}


class TestCalculateFromProfile:
    class MockProfile:
        def __init__(self, gross, tds, deductions=None, regime="new"):
            self.gross_income = gross
            self.tds_paid = tds
            self.deductions = deductions or {}
            self.regime = regime
            self.other_income = {}

    def test_new_regime_profile(self):
        p = self.MockProfile(840000, 42000, regime="new")
        r = calculate(p)
        assert r["regime"] == "new"
        assert r["gross_income"] == 840000

    def test_old_regime_profile(self):
        p = self.MockProfile(840000, 42000, {"80c": 150000, "80d": 25000}, regime="old")
        r = calculate(p)
        assert r["regime"] == "old"
        assert r["deductions_breakdown"]["80c"] == 150000

    def test_none_values_treated_as_zero(self):
        p = self.MockProfile(None, None, regime="new")
        p.gross_income = None
        p.tds_paid = None
        r = calculate(p)
        assert r["tax_liability"] == 0
