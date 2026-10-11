from fastapi import APIRouter
from backend.app.schemas.model import ModelListResponse
from backend.app.providers.router import provider_router
from backend.app.config import settings

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("", response_model=ModelListResponse)
async def list_models():
    """List available LLM providers, their reachability status, and current active selection."""
    models = await provider_router.list_available_models()
    return ModelListResponse(
        active_provider=settings.LLM_PROVIDER,
        active_model=settings.OLLAMA_MODEL if settings.LLM_PROVIDER == "ollama" else settings.ANTHROPIC_MODEL,
        models=models
    )
