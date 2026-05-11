"""Unit tests for document parsing service — no HTTP needed."""
import json
import pytest
from services.document_parser import (
    parse_ais_json,
    parse_itr_xml,
    detect_doc_type,
    parse_document,
    merge_into_profile,
)


AIS_DATA = json.dumps({
    "salaryData": [{"amount": 750000}, {"amount": 50000}],
    "interestIncome": 15000,
    "dividendIncome": 3000,
    "tdsData": [{"deductor": "ACME", "amount": 40000}],
}).encode()

ITR_XML = b"""<?xml version="1.0"?>
<ITR1>
  <AssessmentYear>2024-25</AssessmentYear>
  <GrossTotIncome>800000</GrossTotIncome>
  <TaxPayable>20600</TaxPayable>
</ITR1>"""

INVALID_XML = b"not xml at all <<<<"


class TestParseAisJson:
    def test_salary_sum(self):
        r = parse_ais_json(AIS_DATA)
        assert r["salary_income"] == 800000  # 750k + 50k

    def test_interest_income(self):
        r = parse_ais_json(AIS_DATA)
        assert r["interest_income"] == 15000

    def test_dividend_income(self):
        r = parse_ais_json(AIS_DATA)
        assert r["dividend_income"] == 3000

    def test_doc_type_tag(self):
        r = parse_ais_json(AIS_DATA)
        assert r["doc_type"] == "ais_json"

    def test_invalid_json(self):
        r = parse_ais_json(b"not json")
        assert "parse_error" in r

    def test_empty_json(self):
        r = parse_ais_json(b"{}")
        assert r["salary_income"] is None
        assert r["interest_income"] is None


class TestParseItrXml:
    def test_gross_income(self):
        r = parse_itr_xml(ITR_XML)
        assert r["gross_income"] == 800000

    def test_tax_paid(self):
        r = parse_itr_xml(ITR_XML)
        assert r["tax_paid"] == 20600

    def test_assessment_year(self):
        r = parse_itr_xml(ITR_XML)
        assert r["assessment_year"] == "2024-25"

    def test_doc_type_tag(self):
        r = parse_itr_xml(ITR_XML)
        assert r["doc_type"] == "itr_xml"

    def test_invalid_xml(self):
        r = parse_itr_xml(INVALID_XML)
        assert "parse_error" in r


class TestDetectDocType:
    def test_detect_ais_by_filename(self):
        assert detect_doc_type("ais_data.json", "application/json") == "ais_json"

    def test_detect_itr_xml_by_extension(self):
        assert detect_doc_type("myreturn.xml", "application/xml") == "itr_xml"

    def test_detect_form16_by_name(self):
        assert detect_doc_type("form16_2024.pdf", "application/pdf") == "form16_pdf"

    def test_detect_form26as_by_name(self):
        assert detect_doc_type("form26as.pdf", "application/pdf") == "form26as_pdf"

    def test_detect_itr_by_content_type(self):
        assert detect_doc_type("unknown.file", "application/xml") == "itr_xml"

    def test_detect_ais_by_content_type(self):
        assert detect_doc_type("unknown.file", "application/json") == "ais_json"


class TestMergeIntoProfile:
    class MockProfile:
        gross_income = None
        tds_paid = None
        deductions = None
        other_income = None
        ay = None

    def test_merge_ais(self):
        p = self.MockProfile()
        parsed = parse_ais_json(AIS_DATA)
        merge_into_profile(parsed, p)
        assert p.gross_income == 800000
        assert p.other_income["interest"] == 15000

    def test_merge_itr_xml(self):
        p = self.MockProfile()
        parsed = parse_itr_xml(ITR_XML)
        merge_into_profile(parsed, p)
        assert p.gross_income == 800000
        assert p.ay == "2024-25"
