import httpx
import logging
from typing import List, Dict, Any, Optional
from backend.app.providers.base import BaseLLMProvider, LLMResponse, ProviderUnavailableError
from backend.app.config import settings

logger = logging.getLogger(__name__)

class OllamaProvider(BaseLLMProvider):
    """Local LLM provider interfacing with Ollama daemon."""

    def __init__(self, base_url: Optional[str] = None, model: Optional[str] = None):
        self.base_url = (base_url or settings.OLLAMA_BASE_URL).rstrip("/")
        clean_model = (model or "").strip()
        if not clean_model or clean_model.lower() == "ollama":
            self.model = settings.OLLAMA_MODEL
        else:
            self.model = clean_model
        self.timeout = settings.LLM_TIMEOUT_SECONDS

    def get_provider_name(self) -> str:
        return "ollama"

    def get_model_name(self) -> str:
        return self.model

    async def is_available(self) -> bool:
        """Check if Ollama server is running and model is loaded."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    models = res.json().get("models", [])
                    # Check if requested model or any model is available
                    return len(models) > 0
                return False
        except Exception:
            return False

    async def generate(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096
    ) -> LLMResponse:
        """Generate response via Ollama /api/chat."""
        payload_messages = []
        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})
        payload_messages.extend(messages)

        payload = {
            "model": self.model,
            "messages": payload_messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": max_tokens
            }
        }

        try:
            async with httpx.AsyncClient(timeout=float(self.timeout)) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload
                )
                if response.status_code == 404 and self.model != settings.OLLAMA_MODEL:
                    logger.warning(
                        f"Ollama model '{self.model}' not found (404). Falling back to configured '{settings.OLLAMA_MODEL}'."
                    )
                    payload["model"] = settings.OLLAMA_MODEL
                    response = await client.post(
                        f"{self.base_url}/api/chat",
                        json=payload
                    )
                if response.status_code != 200:
                    raise ProviderUnavailableError(
                        provider="ollama",
                        message=f"Ollama returned status {response.status_code}: {response.text}",
                        resolution_hint="Check if the model exists in Ollama using `ollama list`."
                    )
                data = response.json()
                content = data.get("message", {}).get("content", "")
                return LLMResponse(
                    content=content,
                    provider="ollama",
                    model_name=payload.get("model", self.model),
                    raw_response=data
                )
        except httpx.ConnectError as exc:
            logger.error(f"Cannot connect to Ollama at {self.base_url}: {exc}")
            raise ProviderUnavailableError(
                provider="ollama",
                message=f"Failed to connect to Ollama daemon at {self.base_url}",
                resolution_hint="Start Ollama by running `brew services start ollama` or `ollama serve`."
            ) from exc
        except httpx.TimeoutException as exc:
            logger.error(f"Ollama generation timed out after {self.timeout}s: {exc}")
            raise ProviderUnavailableError(
                provider="ollama",
                message=f"Generation timed out after {self.timeout} seconds",
                resolution_hint="Use a smaller model or increase LLM_TIMEOUT_SECONDS in .env."
            ) from exc
