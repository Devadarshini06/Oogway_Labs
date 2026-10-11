from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from datetime import datetime, timezone
from backend.app.database import get_db
from backend.app.providers.router import provider_router
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Health & Readiness"])

@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    """Liveness probe: verifies that FastAPI application is running."""
    return {
        "status": "ok",
        "service": "the-lenny-growth-assistant",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Readiness probe: verifies database connectivity and model provider status.
    Returns 200 if dependencies are healthy, 503 if database is unreachable.
    """
    # 1. Check Database
    db_ok = False
    db_error = None
    try:
        res = await db.execute(text("SELECT 1"))
        db_ok = res.scalar() == 1
    except Exception as e:
        logger.error(f"Readiness DB probe failed: {e}")
        db_error = str(e)

    # 2. Check Models
    model_statuses = await provider_router.list_available_models()
    has_any_model = any(m.is_available for m in model_statuses)

    if not db_ok:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "database": {"connected": False, "error": db_error},
                "models": [m.model_dump() for m in model_statuses],
                "message": "Database connection failed. Ensure PostgreSQL is active."
            }
        )

    return {
        "status": "ready",
        "database": {"connected": True},
        "models": [m.model_dump() for m in model_statuses],
        "has_active_model": has_any_model,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
