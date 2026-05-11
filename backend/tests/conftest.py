"""
Shared fixtures for all tests.
Uses SQLite in-memory so no Postgres install is required.
"""
import os
os.environ["DATABASE_URL"] = "sqlite:///./test_taxzy.db"
os.environ["GEMINI_API_KEY"] = "fake-key-for-tests"
os.environ["JWT_SECRET"] = "test-secret-key"
os.environ["SETU_API_KEY"] = ""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.database import Base, get_db
from main import app

TEST_DB_URL = "sqlite:///./test_taxzy.db"
engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)


@pytest.fixture(scope="module")
def client():
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c


@pytest.fixture(scope="module")
def auth_headers(client):
    client.post("/api/auth/register", json={"username": "testuser", "password": "TestPass123"})
    resp = client.post("/api/auth/login", json={"username": "testuser", "password": "TestPass123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(scope="module")
def auth_headers_2(client):
    client.post("/api/auth/register", json={"username": "otheruser", "password": "OtherPass123"})
    resp = client.post("/api/auth/login", json={"username": "otheruser", "password": "OtherPass123"})
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
