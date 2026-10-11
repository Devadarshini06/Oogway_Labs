import logging
from typing import List, Dict, Any, Optional
from backend.app.providers.base import BaseLLMProvider, LLMResponse, ProviderUnavailableError
from backend.app.config import settings

logger = logging.getLogger(__name__)

class AnthropicProvider(BaseLLMProvider):
    """Cloud LLM provider interfacing with Anthropic Claude API."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.ANTHROPIC_API_KEY
        self.model = model or settings.ANTHROPIC_MODEL
        self.timeout = settings.LLM_TIMEOUT_SECONDS

    def get_provider_name(self) -> str:
        return "anthropic"

    def get_model_name(self) -> str:
        return self.model

    async def is_available(self) -> bool:
        """Available only if API key is provided and non-empty."""
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    async def generate(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096
    ) -> LLMResponse:
        if not await self.is_available():
            raise ProviderUnavailableError(
                provider="anthropic",
                message="Anthropic API key is not configured.",
                resolution_hint="Add ANTHROPIC_API_KEY=your_key in .env or switch to local Ollama."
            )

        try:
            from anthropic import AsyncAnthropic
            client = AsyncAnthropic(api_key=self.api_key, timeout=float(self.timeout))

            # Filter messages into Anthropic format (alternating user/assistant)
            anthropic_messages = []
            for m in messages:
                role = m["role"]
                if role in ("user", "assistant"):
                    anthropic_messages.append({"role": role, "content": m["content"]})

            kwargs: Dict[str, Any] = {
                "model": self.model,
                "messages": anthropic_messages,
                "max_tokens": max_tokens,
                "temperature": temperature,
            }
            if system_prompt:
                kwargs["system"] = system_prompt

            response = await client.messages.create(**kwargs)
            content = ""
            for block in response.content:
                if block.type == "text":
                    content += block.text

            return LLMResponse(
                content=content,
                provider="anthropic",
                model_name=self.model,
                raw_response=response.model_dump() if hasattr(response, "model_dump") else None
            )
        except Exception as exc:
            logger.error(f"Anthropic API call failed: {exc}")
            raise ProviderUnavailableError(
                provider="anthropic",
                message=f"Anthropic error: {str(exc)}",
                resolution_hint="Verify your ANTHROPIC_API_KEY, billing status, or switch to Ollama."
            ) from exc
