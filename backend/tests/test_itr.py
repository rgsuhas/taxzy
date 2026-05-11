"""Tests for ITR XML generation + validation."""
import pytest
from lxml import etree
from services.itr_generator import (
    build_itr1_xml,
    build_itr2_xml,
    generate_itr_xml,
    validate_xml,
    _select_form,
)


class MockProfile:
    def __init__(self, **kwargs):
        self.pan = kwargs.get("pan", "ABCDE1234F")
        self.full_name = kwargs.get("full_name", "Test User")
        self.dob = kwargs.get("dob", "1990-01-01")
        self.filing_type = kwargs.get("filing_type", "salaried")
        self.ay = kwargs.get("ay", "2024-25")
        self.gross_income = kwargs.get("gross_income", 840000)
        self.tds_paid = kwargs.get("tds_paid", 42000)
        self.regime = kwargs.get("regime", "new")
        self.deductions = kwargs.get("deductions", {"80c": 0, "80d": 0, "hra": 0})
        self.other_income = kwargs.get("other_income", {})


CALC = {
    "taxable_income": 790000,
    "tax_liability": 20000,
    "refund_or_payable": 22000,
    "deductions_breakdown": {"80c": 0, "80d": 0, "hra": 0, "standard": 50000},
}


class TestFormSelection:
    def test_salaried_selects_itr1(self):
        p = MockProfile(filing_type="salaried")
        assert _select_form(p) == "ITR-1"

    def test_freelancer_selects_itr2(self):
        p = MockProfile(filing_type="freelancer")
        assert _select_form(p) == "ITR-2"

    def test_both_selects_itr2(self):
        p = MockProfile(filing_type="both")
        assert _select_form(p) == "ITR-2"

    def test_capital_gains_selects_itr2(self):
        p = MockProfile(filing_type="salaried", other_income={"capital_gains": 50000})
        assert _select_form(p) == "ITR-2"

    def test_zero_other_income_stays_itr1(self):
        p = MockProfile(filing_type="salaried", other_income={"interest": 0, "dividends": 0})
        assert _select_form(p) == "ITR-1"


class TestBuildItr1:
    def test_produces_valid_xml(self):
        p = MockProfile()
        xml = build_itr1_xml(p, CALC)
        root = etree.fromstring(xml)
        assert root.tag == "ITR1"

    def test_pan_in_output(self):
        p = MockProfile(pan="XYZAB1234C")
        xml = build_itr1_xml(p, CALC)
        assert b"XYZAB1234C" in xml

    def test_assessment_year(self):
        p = MockProfile(ay="2024-25")
        xml = build_itr1_xml(p, CALC)
        assert b"2024-25" in xml

    def test_tax_regime(self):
        p = MockProfile(regime="new")
        xml = build_itr1_xml(p, CALC)
        assert b"new" in xml

    def test_refund_type(self):
        p = MockProfile()
        xml = build_itr1_xml(p, CALC)
        assert b"REFUND" in xml


class TestBuildItr2:
    def test_produces_valid_xml(self):
        p = MockProfile(filing_type="freelancer")
        xml = build_itr2_xml(p, CALC)
        root = etree.fromstring(xml)
        assert root.tag == "ITR2"

    def test_pan_in_output(self):
        p = MockProfile(pan="ABCDE1234F", filing_type="freelancer")
        xml = build_itr2_xml(p, CALC)
        assert b"ABCDE1234F" in xml


class TestGenerateItrXml:
    def test_returns_itr1_for_salaried(self):
        p = MockProfile(filing_type="salaried")
        _, form_name = generate_itr_xml(p, CALC)
        assert form_name == "ITR-1"

    def test_returns_itr2_for_freelancer(self):
        p = MockProfile(filing_type="freelancer")
        _, form_name = generate_itr_xml(p, CALC)
        assert form_name == "ITR-2"

    def test_bytes_output(self):
        p = MockProfile()
        xml_bytes, _ = generate_itr_xml(p, CALC)
        assert isinstance(xml_bytes, bytes)
        assert xml_bytes.startswith(b"<?xml")


class TestValidateXml:
    def test_valid_itr1_xml(self):
        p = MockProfile()
        xml_bytes, _ = generate_itr_xml(p, CALC)
        result = validate_xml(xml_bytes)
        assert result["valid"] is True
        assert result["errors"] == []

    def test_invalid_pan_format(self):
        p = MockProfile(pan="INVALID")
        xml_bytes = build_itr1_xml(p, CALC)
        result = validate_xml(xml_bytes)
        assert result["valid"] is False
        assert any("PAN" in e for e in result["errors"])

    def test_malformed_xml(self):
        result = validate_xml(b"<not>valid xml<<<<")
        assert result["valid"] is False
        assert len(result["errors"]) > 0


class TestItrEndpoints:
    def test_generate_xml_endpoint(self, client, auth_headers):
        # Ensure profile has income
        client.put("/api/tax-profile", json={"field": "gross_income", "value": 840000}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "filing_type", "value": "salaried"}, headers=auth_headers)
        client.put("/api/tax-profile", json={"field": "regime", "value": "new"}, headers=auth_headers)

        r = client.get("/api/itr/generate-xml", headers=auth_headers)
        assert r.status_code == 200
        assert r.headers["content-type"] == "application/xml"
        assert b"<?xml" in r.content

    def test_validate_endpoint_valid(self, client, auth_headers):
        p = MockProfile()
        xml_bytes, _ = generate_itr_xml(p, CALC)
        r = client.post("/api/itr/validate", json={"xml_content": xml_bytes.decode()}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["valid"] is True

    def test_validate_endpoint_invalid(self, client, auth_headers):
        r = client.post("/api/itr/validate", json={"xml_content": "<bad><xml>"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["valid"] is False

    def test_generate_requires_income(self, client, auth_headers_2):
        r = client.get("/api/itr/generate-xml", headers=auth_headers_2)
        assert r.status_code == 400
