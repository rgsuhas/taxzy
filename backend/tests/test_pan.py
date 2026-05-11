"""Tests for PAN verification — uses mock verifier (no SETU_API_KEY set)."""
import pytest
from services.pan_verifier import is_valid_pan_format


class TestPanFormat:
    def test_valid_pan(self):
        assert is_valid_pan_format("ABCDE1234F") is True

    def test_lowercase_pan(self):
        assert is_valid_pan_format("abcde1234f") is True  # uppercased inside function

    def test_invalid_too_short(self):
        assert is_valid_pan_format("ABCD1234F") is False

    def test_invalid_bad_chars(self):
        assert is_valid_pan_format("ABCDE12345") is False  # last char should be letter

    def test_invalid_empty(self):
        assert is_valid_pan_format("") is False


class TestPanEndpoint:
    def test_verify_valid_pan(self, client, auth_headers):
        r = client.post("/api/pan/verify", json={"pan": "ABCDE1234F"}, headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["valid"] is True
        assert "full_name" in data
        assert "status" in data

    def test_verify_invalid_format(self, client, auth_headers):
        r = client.post("/api/pan/verify", json={"pan": "INVALID"}, headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["valid"] is False
        assert data["status"] == "INVALID_FORMAT"

    def test_verify_updates_profile(self, client, auth_headers):
        r = client.post("/api/pan/verify", json={"pan": "PQRST9876Z"}, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["valid"] is True

        profile = client.get("/api/tax-profile", headers=auth_headers)
        assert profile.json()["pan"] == "PQRST9876Z"
        assert profile.json()["pan_verified"] is True

    def test_verify_requires_auth(self, client):
        r = client.post("/api/pan/verify", json={"pan": "ABCDE1234F"})
        assert r.status_code in (401, 403)
