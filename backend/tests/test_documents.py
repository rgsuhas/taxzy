"""Tests for document upload, list, get, delete endpoints."""
import io
import json
import pytest


SAMPLE_AIS = json.dumps({
    "salaryData": [{"amount": 900000}],
    "interestIncome": 12000,
    "dividendIncome": 5000,
    "tdsData": [{"deductor": "ACME Corp", "amount": 45000}],
}).encode()

SAMPLE_ITR_XML = b"""<?xml version="1.0"?>
<ITR1>
  <AssessmentYear>2024-25</AssessmentYear>
  <PersonalInfo><PAN>ABCDE1234F</PAN></PersonalInfo>
  <IncomeDeductions>
    <GrossTotIncome>800000</GrossTotIncome>
  </IncomeDeductions>
  <TaxComputation>
    <TaxPayable>20000</TaxPayable>
  </TaxComputation>
</ITR1>"""


class TestDocumentUpload:
    def test_upload_ais_json(self, client, auth_headers):
        r = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files={"file": ("ais_data.json", io.BytesIO(SAMPLE_AIS), "application/json")},
        )
        assert r.status_code == 200
        data = r.json()
        assert data["doc_type"] == "ais_json"
        assert "doc_id" in data
        assert "extracted_fields" in data
        assert data["extracted_fields"]["salary_income"] == 900000

    def test_upload_itr_xml(self, client, auth_headers):
        r = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files={"file": ("itr_return.xml", io.BytesIO(SAMPLE_ITR_XML), "application/xml")},
        )
        assert r.status_code == 200
        data = r.json()
        assert data["doc_type"] == "itr_xml"
        assert data["extracted_fields"]["gross_income"] == 800000

    def test_upload_with_explicit_doc_type(self, client, auth_headers):
        r = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files={"file": ("somefile.json", io.BytesIO(SAMPLE_AIS), "application/json")},
            data={"doc_type": "ais_json"},
        )
        assert r.status_code == 200
        assert r.json()["doc_type"] == "ais_json"

    def test_upload_requires_auth(self, client):
        r = client.post(
            "/api/documents/upload",
            files={"file": ("test.json", io.BytesIO(SAMPLE_AIS), "application/json")},
        )
        assert r.status_code in (401, 403)


class TestDocumentList:
    def test_list_documents(self, client, auth_headers):
        r = client.get("/api/documents", headers=auth_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        # We uploaded at least 2 docs above
        assert len(r.json()) >= 2

    def test_list_fields(self, client, auth_headers):
        r = client.get("/api/documents", headers=auth_headers)
        doc = r.json()[0]
        assert "doc_id" in doc
        assert "doc_type" in doc
        assert "filename" in doc
        assert "uploaded_at" in doc

    def test_list_requires_auth(self, client):
        r = client.get("/api/documents")
        assert r.status_code in (401, 403)


class TestDocumentGet:
    def test_get_document(self, client, auth_headers):
        # Upload one first
        up = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files={"file": ("ais2.json", io.BytesIO(SAMPLE_AIS), "application/json")},
        )
        doc_id = up.json()["doc_id"]

        r = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["doc_id"] == doc_id
        assert "parsed_data" in data

    def test_get_nonexistent(self, client, auth_headers):
        r = client.get("/api/documents/99999", headers=auth_headers)
        assert r.status_code == 404

    def test_cannot_access_other_users_doc(self, client, auth_headers, auth_headers_2):
        up = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files={"file": ("private.json", io.BytesIO(SAMPLE_AIS), "application/json")},
        )
        doc_id = up.json()["doc_id"]
        r = client.get(f"/api/documents/{doc_id}", headers=auth_headers_2)
        assert r.status_code == 404


class TestDocumentDelete:
    def test_delete_document(self, client, auth_headers):
        up = client.post(
            "/api/documents/upload",
            headers=auth_headers,
            files={"file": ("todelete.json", io.BytesIO(SAMPLE_AIS), "application/json")},
        )
        doc_id = up.json()["doc_id"]

        r = client.delete(f"/api/documents/{doc_id}", headers=auth_headers)
        assert r.status_code == 200
        assert "deleted" in r.json()["message"].lower()

        r2 = client.get(f"/api/documents/{doc_id}", headers=auth_headers)
        assert r2.status_code == 404

    def test_delete_nonexistent(self, client, auth_headers):
        r = client.delete("/api/documents/99999", headers=auth_headers)
        assert r.status_code == 404
