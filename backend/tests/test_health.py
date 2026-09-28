"""Unit tests for backend startup and health endpoints."""

from fastapi.testclient import TestClient


def test_api_health_endpoint(client: TestClient):
    """Verify GET /api/health returns 200 OK with correct schema."""
    response = client.get("/api/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"
    assert data["app_name"] == "WHY-Test"
    assert data["version"] == "0.1.0-test"
    assert data["environment"] == "test"
    assert "timestamp" in data


def test_root_health_endpoint(client: TestClient):
    """Verify convenience GET /health returns 200 OK."""
    response = client.get("/health")
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "ok"


def test_app_startup_metadata(client: TestClient):
    """Verify application metadata and docs endpoint accessibility."""
    docs_response = client.get("/docs")
    assert docs_response.status_code == 200
    assert "WHY - Organizational Decision Memory" in docs_response.text
