import logging
from typing import List, Dict, Any, Optional
from backend.app.providers.base import BaseLLMProvider, LLMResponse, ProviderUnavailableError
from backend.app.config import settings

logger = logging.getLogger(__name__)

class OpenAIProvider(BaseLLMProvider):
    """Cloud LLM provider interfacing with OpenAI API."""

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.model = model or settings.OPENAI_MODEL
        self.timeout = settings.LLM_TIMEOUT_SECONDS

    def get_provider_name(self) -> str:
        return "openai"

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
                provider="openai",
                message="OpenAI API key is not configured.",
                resolution_hint="Add OPENAI_API_KEY=your_key in .env or switch to local Ollama."
            )

        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=self.api_key, timeout=float(self.timeout))

            formatted_messages = []
            if system_prompt:
                formatted_messages.append({"role": "system", "content": system_prompt})
            formatted_messages.extend(messages)

            response = await client.chat.completions.create(
                model=self.model,
                messages=formatted_messages,
                temperature=temperature,
                max_tokens=max_tokens
            )

            choice = response.choices[0]
            content = choice.message.content or ""

            return LLMResponse(
                content=content,
                provider="openai",
                model_name=self.model,
                raw_response=response.model_dump() if hasattr(response, "model_dump") else None
            )
        except Exception as exc:
            logger.error(f"OpenAI API call failed: {exc}")
            raise ProviderUnavailableError(
                provider="openai",
                message=f"OpenAI error: {str(exc)}",
                resolution_hint="Verify your OPENAI_API_KEY, billing status, or switch to Ollama."
            ) from exc
