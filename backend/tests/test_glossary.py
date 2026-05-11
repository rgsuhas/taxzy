"""Tests for glossary endpoints (no Gemini call needed for known terms)."""
import pytest


class TestGlossaryList:
    def test_list_returns_terms(self, client, auth_headers):
        r = client.get("/api/glossary", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 30  # we seeded 40+ terms

    def test_each_term_has_fields(self, client, auth_headers):
        r = client.get("/api/glossary", headers=auth_headers)
        for term in r.json():
            assert "term" in term
            assert "definition" in term
            assert "example" in term

    def test_list_requires_auth(self, client):
        r = client.get("/api/glossary")
        assert r.status_code in (401, 403)


class TestGlossaryGet:
    def test_get_known_term(self, client, auth_headers):
        r = client.get("/api/glossary/TDS", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["term"] == "TDS"
        assert "Tax Deducted" in data["definition"]

    def test_get_term_case_insensitive(self, client, auth_headers):
        r = client.get("/api/glossary/tds", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["term"] == "TDS"

    def test_get_pan_term(self, client, auth_headers):
        r = client.get("/api/glossary/PAN", headers=auth_headers)
        assert r.status_code == 200

    def test_get_itr_term(self, client, auth_headers):
        r = client.get("/api/glossary/ITR", headers=auth_headers)
        assert r.status_code == 200

    def test_get_80c_term(self, client, auth_headers):
        r = client.get("/api/glossary/80C", headers=auth_headers)
        assert r.status_code == 200

    def test_get_unknown_term_returns_404(self, client, auth_headers):
        r = client.get("/api/glossary/UNKNOWNTERM12345", headers=auth_headers)
        assert r.status_code == 404

    def test_get_requires_auth(self, client):
        r = client.get("/api/glossary/TDS")
        assert r.status_code in (401, 403)


class TestGlossaryExplain:
    def test_explain_known_term_no_gemini_call(self, client, auth_headers):
        # Known term returns from local JSON without calling Gemini
        r = client.post("/api/glossary/explain", json={"term": "TDS"}, headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["term"] == "TDS"
        assert "definition" in data

    def test_explain_requires_auth(self, client):
        r = client.post("/api/glossary/explain", json={"term": "TDS"})
        assert r.status_code in (401, 403)
