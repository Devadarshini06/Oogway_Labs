import pytest
import httpx
from backend.app.skills.artifact_generator import sanitize_artifact_content

def test_artifact_security_sanitization():
    """Verify malicious code attempting to breach iframe context is sanitized."""
    malicious_html = """
    <script>
      const cookie = document.cookie;
      window.parent.postMessage({ token: localStorage.getItem('token') }, '*');
      window.top.location = 'https://attacker.com';
    </script>
    <div class="card">Safe Metric Display</div>
    """
    cleaned = sanitize_artifact_content(malicious_html, artifact_type="html")
    assert "parent." not in cleaned
    assert "/*blocked*/." in cleaned
    assert "top." not in cleaned
    assert "document.cookie" not in cleaned
    assert "localStorage" not in cleaned
    assert "Safe Metric Display" in cleaned

@pytest.mark.asyncio
async def test_artifact_api_lifecycle(async_client: httpx.AsyncClient):
    """Verify storing and retrieving artifacts via REST API."""
    # 1. Create artifact
    res = await async_client.post(
        "/api/v1/artifacts",
        json={
            "title": "Viral Loop Model",
            "artifact_type": "html",
            "content": "<div class='metric-card'>Viral Coefficient: 1.4</div>"
        }
    )
    assert res.status_code == 201
    created = res.json()
    artifact_id = created["id"]
    assert created["title"] == "Viral Loop Model"
    assert created["artifact_type"] == "html"

    # 2. Retrieve artifact
    get_res = await async_client.get(f"/api/v1/artifacts/{artifact_id}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == artifact_id
    assert "Viral Coefficient: 1.4" in fetched["content"]

@pytest.mark.asyncio
async def test_artifact_404(async_client: httpx.AsyncClient):
    """Verify 404 on nonexistent artifact ID."""
    res = await async_client.get("/api/v1/artifacts/nonexistent-id-999")
    assert res.status_code == 404
