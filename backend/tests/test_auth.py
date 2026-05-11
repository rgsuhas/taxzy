"""Tests for POST /api/auth/register, login, logout, GET /me."""
import pytest


class TestRegister:
    def test_register_success(self, client):
        r = client.post("/api/auth/register", json={"username": "newuser1", "password": "pass1234"})
        assert r.status_code == 201
        data = r.json()
        assert data["username"] == "newuser1"
        assert "user_id" in data

    def test_register_duplicate_username(self, client):
        client.post("/api/auth/register", json={"username": "dupuser", "password": "pass1234"})
        r = client.post("/api/auth/register", json={"username": "dupuser", "password": "pass1234"})
        assert r.status_code == 400
        assert "already taken" in r.json()["detail"].lower()

    def test_register_missing_fields(self, client):
        r = client.post("/api/auth/register", json={"username": "onlyuser"})
        assert r.status_code == 422


class TestLogin:
    def test_login_success(self, client):
        client.post("/api/auth/register", json={"username": "loginuser", "password": "pass1234"})
        r = client.post("/api/auth/login", json={"username": "loginuser", "password": "pass1234"})
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        client.post("/api/auth/register", json={"username": "loginuser2", "password": "correct"})
        r = client.post("/api/auth/login", json={"username": "loginuser2", "password": "wrong"})
        assert r.status_code == 401

    def test_login_nonexistent_user(self, client):
        r = client.post("/api/auth/login", json={"username": "ghost", "password": "pass"})
        assert r.status_code == 401


class TestMe:
    def test_me_authenticated(self, client, auth_headers):
        r = client.get("/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["username"] == "testuser"
        assert "user_id" in data
        assert "created_at" in data

    def test_me_unauthenticated(self, client):
        r = client.get("/api/auth/me")
        assert r.status_code in (401, 403)

    def test_me_invalid_token(self, client):
        r = client.get("/api/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401


class TestLogout:
    def test_logout(self, client, auth_headers):
        r = client.post("/api/auth/logout", headers=auth_headers)
        assert r.status_code == 200
        assert "message" in r.json()
