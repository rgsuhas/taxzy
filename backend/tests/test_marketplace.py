"""Tests for marketplace offers, redemption, refund tracker, tax usage."""
import pytest
from services.marketplace import get_offers, generate_voucher_code, find_offer
from services.tax_usage import calculate_tax_usage


class TestMarketplaceService:
    def test_offers_returned_for_valid_refund(self):
        offers = get_offers(5000)
        assert len(offers) > 0

    def test_offer_fields(self):
        offers = get_offers(5000)
        o = offers[0]
        assert "offer_id" in o
        assert "brand" in o
        assert "voucher_amount" in o
        assert "conversion_rate" in o
        assert o["voucher_amount"] > 5000  # should be more than refund

    def test_offers_filtered_by_min_refund(self):
        # Myntra requires min ₹2000
        low_offers = get_offers(100)
        high_offers = get_offers(5000)
        assert len(high_offers) >= len(low_offers)

    def test_zero_refund_returns_empty(self):
        offers = get_offers(0)
        assert offers == []

    def test_voucher_code_format(self):
        code = generate_voucher_code("Amazon")
        assert code.startswith("AMA-")
        assert len(code) == 12  # "AMA-" + 8 chars

    def test_find_offer_exists(self):
        o = find_offer("AMZ001")
        assert o is not None
        assert o["brand"] == "Amazon"

    def test_find_offer_missing(self):
        assert find_offer("NONEXISTENT") is None


class TestMarketplaceEndpoints:
    def test_list_offers(self, client, auth_headers):
        # Set income so refund can be calculated
        client.put("/api/tax-profile", json={"field": "gross_income", "value": 700000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "tds_paid", "value": 50000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "regime", "value": "new"}, headers=auth_headers)

        r = client.get("/api/marketplace/offers", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_redeem_offer(self, client, auth_headers):
        client.put("/api/tax-profile", json={"field": "gross_income", "value": 700000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "tds_paid", "value": 50000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "regime", "value": "new"}, headers=auth_headers)

        r = client.post("/api/marketplace/redeem", json={"offer_id": "AMZ001"}, headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "voucher_code" in data
        assert data["brand"] == "Amazon"
        assert data["amount"] > 0
        assert "redeemed_at" in data

    def test_redeem_nonexistent_offer(self, client, auth_headers):
        r = client.post("/api/marketplace/redeem", json={"offer_id": "FAKE999"}, headers=auth_headers)
        assert r.status_code == 404

    def test_marketplace_requires_auth(self, client):
        r = client.get("/api/marketplace/offers")
        assert r.status_code in (401, 403)


class TestRefundTracker:
    def test_refund_status(self, client, auth_headers):
        r = client.get("/api/refund/status", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "status" in data
        assert "current_step" in data
        assert "estimated_date" in data
        assert "timeline" in data
        assert isinstance(data["timeline"], list)
        assert len(data["timeline"]) == 5

    def test_timeline_structure(self, client, auth_headers):
        r = client.get("/api/refund/status", headers=auth_headers)
        step = r.json()["timeline"][0]
        assert "step" in step
        assert "label" in step
        assert "done" in step

    def test_refund_requires_auth(self, client):
        r = client.get("/api/refund/status")
        assert r.status_code in (401, 403)


class TestTaxUsageService:
    def test_breakdown_percentages_sum_to_100(self):
        result = calculate_tax_usage(50000)
        total = sum(b["percentage"] for b in result["breakdown"])
        assert abs(total - 100.0) < 0.01

    def test_amounts_sum_to_tax(self):
        tax = 50000
        result = calculate_tax_usage(tax)
        total = sum(b["amount"] for b in result["breakdown"])
        assert abs(total - tax) <= len(result["breakdown"])  # rounding tolerance

    def test_summary_present(self):
        result = calculate_tax_usage(50000)
        assert "summary" in result
        assert len(result["summary"]) > 20

    def test_personalized_copy(self):
        result = calculate_tax_usage(50000)
        for item in result["breakdown"]:
            assert "personalized_copy" in item
            assert len(item["personalized_copy"]) > 0


class TestTaxUsageEndpoint:
    def test_tax_usage_endpoint(self, client, auth_headers):
        r = client.post("/api/tax-usage", json={"tax_paid": 50000}, headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert "breakdown" in data
        assert "summary" in data
        assert len(data["breakdown"]) > 0

    def test_tax_usage_requires_auth(self, client):
        r = client.post("/api/tax-usage", json={"tax_paid": 50000})
        assert r.status_code in (401, 403)
