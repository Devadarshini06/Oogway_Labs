from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.database import get_db
from backend.app.schemas.chat import ChatMessageRequest, ChatMessageResponse
from backend.app.agent.orchestrator import orchestrator
from backend.app.providers.base import ProviderUnavailableError
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatMessageResponse)
async def send_chat_message(
    payload: ChatMessageRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Send a prompt to The Lenny Growth Assistant.
    Retrieves grounded podcast excerpts, executes agent reasoning or skills,
    and persists conversation history in PostgreSQL.
    """
    if not payload.message.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message content cannot be blank."
        )

    try:
        response = await orchestrator.process_chat(request=payload, db=db)
        return response
    except ProviderUnavailableError as e:
        logger.error(f"Provider error during chat: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "error": "provider_unavailable",
                "provider": e.provider,
                "message": e.message,
                "hint": e.resolution_hint
            }
        )
    except Exception as e:
        logger.exception(f"Unexpected error in chat endpoint: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_error",
                "message": "An error occurred while generating the response. Please try again."
            }
        )
