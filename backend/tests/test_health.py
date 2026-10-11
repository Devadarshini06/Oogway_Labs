import pytest
import httpx

@pytest.mark.asyncio
async def test_health_endpoint(async_client: httpx.AsyncClient):
    """Verify liveness probe returns 200 OK with application metadata."""
    response = await async_client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "the-lenny-growth-assistant"
    assert "version" in data
    assert "timestamp" in data

@pytest.mark.asyncio
async def test_readiness_endpoint(async_client: httpx.AsyncClient):
    """Verify readiness probe verifies database and returns status of LLM models."""
    response = await async_client.get("/api/v1/ready")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ready"
    assert data["database"]["connected"] is True
    assert "models" in data
    assert isinstance(data["models"], list)
    assert len(data["models"]) >= 1
