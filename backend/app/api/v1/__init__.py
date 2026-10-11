from fastapi import APIRouter
from backend.app.api.v1.health import router as health_router
from backend.app.api.v1.sessions import router as sessions_router
from backend.app.api.v1.chat import router as chat_router
from backend.app.api.v1.models import router as models_router
from backend.app.api.v1.artifacts import router as artifacts_router
from backend.app.api.v1.knowledge import router as knowledge_router

api_v1_router = APIRouter(prefix="/v1")
api_v1_router.include_router(health_router)
api_v1_router.include_router(sessions_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(models_router)
api_v1_router.include_router(artifacts_router)
api_v1_router.include_router(knowledge_router)
