"""Tests for GET/PUT /api/tax-profile and POST /api/tax-profile/calculate."""
import pytest


class TestGetTaxProfile:
    def test_get_creates_empty_profile(self, client, auth_headers):
        r = client.get("/api/tax-profile", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "pan" in data
        assert "gross_income" in data
        assert "regime" in data

    def test_requires_auth(self, client):
        r = client.get("/api/tax-profile")
        assert r.status_code in (401, 403)


class TestUpdateTaxProfile:
    def test_update_gross_income(self, client, auth_headers):
        r = client.put("/api/tax-profile", json={"field": "gross_income", "value": 840000}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["gross_income"] == 840000

    def test_update_regime(self, client, auth_headers):
        r = client.put("/api/tax-profile", json={"field": "regime", "value": "new"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["regime"] == "new"

    def test_update_tds(self, client, auth_headers):
        r = client.put("/api/tax-profile", json={"field": "tds_paid", "value": 42000}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["tds_paid"] == 42000

    def test_update_deductions(self, client, auth_headers):
        deductions = {"80c": 150000, "80d": 25000, "hra": 0}
        r = client.put("/api/tax-profile", json={"field": "deductions", "value": deductions}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["deductions"]["80c"] == 150000

    def test_update_invalid_field(self, client, auth_headers):
        r = client.put("/api/tax-profile", json={"field": "hacked_field", "value": "bad"}, headers=auth_headers)
        assert r.status_code == 400

    def test_update_pan(self, client, auth_headers):
        r = client.put("/api/tax-profile", json={"field": "pan", "value": "ABCDE1234F"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["pan"] == "ABCDE1234F"

    def test_update_filing_type(self, client, auth_headers):
        r = client.put("/api/tax-profile", json={"field": "filing_type", "value": "salaried"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["filing_type"] == "salaried"


class TestCalculate:
    def test_calculate_new_regime(self, client, auth_headers):
        # Ensure profile has required data
        client.put("/api/tax-profile", json={"field": "gross_income", "value": 840000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "tds_paid", "value": 42000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "regime", "value": "new"}, headers=auth_headers)

        r = client.post("/api/tax-profile/calculate", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["regime"] == "new"
        assert data["gross_income"] == 840000
        assert "taxable_income" in data
        assert "tax_liability" in data
        assert "tds_paid" in data
        assert "refund_or_payable" in data
        assert "deductions_breakdown" in data
        assert data["deductions_breakdown"]["standard"] == 50000

    def test_calculate_old_regime(self, client, auth_headers):
        client.put("/api/tax-profile", json={"field": "regime", "value": "old"}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "deductions", "value": {"80c": 150000, "80d": 25000, "hra": 0}}, headers=auth_headers)

        r = client.post("/api/tax-profile/calculate", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["regime"] == "old"
        assert data["deductions_breakdown"]["80c"] == 150000

    def test_calculate_missing_income(self, client, auth_headers_2):
        r = client.post("/api/tax-profile/calculate", headers=auth_headers_2)
        assert r.status_code == 400
