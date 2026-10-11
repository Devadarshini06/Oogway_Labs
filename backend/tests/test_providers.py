import pytest
import httpx
from backend.app.providers.router import provider_router
from backend.app.providers.base import ProviderUnavailableError
from backend.app.providers.anthropic import AnthropicProvider
from backend.app.providers.openai import OpenAIProvider
from backend.app.providers.ollama import OllamaProvider

@pytest.mark.asyncio
async def test_provider_router_retrieval():
    """Verify provider router returns proper concrete implementations."""
    ollama = provider_router.get_provider("ollama")
    assert isinstance(ollama, OllamaProvider)
    assert ollama.get_provider_name() == "ollama"

    anthropic = provider_router.get_provider("anthropic")
    assert isinstance(anthropic, AnthropicProvider)
    assert anthropic.get_provider_name() == "anthropic"

    openai_p = provider_router.get_provider("openai")
    assert isinstance(openai_p, OpenAIProvider)
    assert openai_p.get_provider_name() == "openai"

@pytest.mark.asyncio
async def test_missing_cloud_api_key_error():
    """Verify clear, structured error when cloud API key is missing."""
    p = AnthropicProvider(api_key=None)
    with pytest.raises(ProviderUnavailableError) as exc_info:
        await p.generate(messages=[{"role": "user", "content": "hi"}])
    err = exc_info.value
    assert err.provider == "anthropic"
    assert "not configured" in err.message.lower()
    assert "hint" in str(err).lower()

@pytest.mark.asyncio
async def test_unavailable_ollama_port():
    """Verify clean ProviderUnavailableError when Ollama endpoint is down."""
    p = OllamaProvider(base_url="http://localhost:59999")  # Unused port
    with pytest.raises(ProviderUnavailableError) as exc_info:
        await p.generate(messages=[{"role": "user", "content": "hi"}])
    err = exc_info.value
    assert err.provider == "ollama"
    assert "failed to connect" in err.message.lower()
    assert "brew services start ollama" in err.resolution_hint.lower()

@pytest.mark.asyncio
async def test_chat_error_response_on_unavailable_provider(async_client: httpx.AsyncClient):
    """Verify chat API endpoint returns 503 with structured JSON error on provider failure."""
    res = await async_client.post(
        "/api/v1/chat",
        json={
            "message": "test message",
            "provider": "anthropic",
            "enable_rag": False
        }
    )
    # Since ANTHROPIC_API_KEY is not set in local env, must return 503 with helpful hint
    assert res.status_code == 503
    data = res.json()["detail"]
    assert data["error"] == "provider_unavailable"
    assert data["provider"] == "anthropic"
    assert "hint" in data
