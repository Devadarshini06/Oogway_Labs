import logging
from typing import Dict, List, Optional
from backend.app.providers.base import BaseLLMProvider, ProviderUnavailableError
from backend.app.providers.ollama import OllamaProvider
from backend.app.providers.anthropic import AnthropicProvider
from backend.app.providers.openai import OpenAIProvider
from backend.app.schemas.model import ModelInfo
from backend.app.config import settings

logger = logging.getLogger(__name__)

class ProviderRouter:
    """Manages LLM provider instances and dynamic model routing."""

    def __init__(self):
        self._providers: Dict[str, BaseLLMProvider] = {}
        self._init_providers()

    def _init_providers(self):
        self._providers["ollama"] = OllamaProvider()
        self._providers["anthropic"] = AnthropicProvider()
        self._providers["openai"] = OpenAIProvider()

    def get_provider(
        self,
        provider_name: Optional[str] = None,
        model_name: Optional[str] = None
    ) -> BaseLLMProvider:
        """
        Get the requested or default provider.
        If a specific model name is supplied, create a customized instance.
        """
        target_name = (provider_name or settings.LLM_PROVIDER).lower().strip()

        if target_name == "ollama":
            return OllamaProvider(model=model_name or settings.OLLAMA_MODEL)
        elif target_name == "anthropic":
            return AnthropicProvider(model=model_name or settings.ANTHROPIC_MODEL)
        elif target_name == "openai":
            return OpenAIProvider(model=model_name or settings.OPENAI_MODEL)
        else:
            raise ProviderUnavailableError(
                provider=target_name,
                message=f"Unknown LLM provider '{target_name}'.",
                resolution_hint="Valid options are 'ollama', 'anthropic', or 'openai'."
            )

    async def list_available_models(self) -> List[ModelInfo]:
        """Inspect all providers and return their readiness status."""
        results = []

        # 1. Ollama
        ollama = self._providers["ollama"]
        ollama_avail = await ollama.is_available()
        results.append(ModelInfo(
            id="ollama",
            name=f"Ollama Local ({ollama.get_model_name()})",
            provider="ollama",
            is_local=True,
            is_available=ollama_avail,
            status_message="Running locally via Ollama daemon" if ollama_avail else "Ollama daemon offline. Run `brew services start ollama`."
        ))

        # 2. Anthropic
        anthropic = self._providers["anthropic"]
        anthropic_avail = await anthropic.is_available()
        results.append(ModelInfo(
            id="anthropic",
            name=f"Anthropic Claude ({anthropic.get_model_name()})",
            provider="anthropic",
            is_local=False,
            is_available=anthropic_avail,
            status_message="Configured with API Key" if anthropic_avail else "API key missing. Set ANTHROPIC_API_KEY in .env."
        ))

        # 3. OpenAI
        openai_p = self._providers["openai"]
        openai_avail = await openai_p.is_available()
        results.append(ModelInfo(
            id="openai",
            name=f"OpenAI ({openai_p.get_model_name()})",
            provider="openai",
            is_local=False,
            is_available=openai_avail,
            status_message="Configured with API Key" if openai_avail else "API key missing. Set OPENAI_API_KEY in .env."
        ))

        return results

provider_router = ProviderRouter()
