from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

class LLMResponse(BaseModel):
    content: str
    provider: str
    model_name: str
    raw_response: Optional[Dict[str, Any]] = None

class ProviderUnavailableError(Exception):
    """Raised when an LLM provider cannot be reached or is not configured."""
    def __init__(self, provider: str, message: str, resolution_hint: str):
        self.provider = provider
        self.message = message
        self.resolution_hint = resolution_hint
        super().__init__(f"[{provider}] {message} - Hint: {resolution_hint}")

class BaseLLMProvider(ABC):
    """Abstract base class for all LLM providers."""

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return provider identifier (e.g. 'ollama', 'anthropic', 'openai')."""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Return active model name."""
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Check if provider is configured and reachable."""
        pass

    @abstractmethod
    async def generate(
        self,
        messages: List[Dict[str, str]],
        system_prompt: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4096
    ) -> LLMResponse:
        """Generate a completion for the given conversation messages."""
        pass
