from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from backend.app.database import get_db
from backend.app.models.session import SessionModel
from backend.app.models.message import MessageModel
from backend.app.schemas.session import (
    SessionCreate,
    SessionResponse,
    SessionListResponse
)
from backend.app.schemas.chat import (
    MessageItem,
    MessageListResponse,
    Citation
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(payload: SessionCreate, db: AsyncSession = Depends(get_db)):
    """Create a new isolated conversation session."""
    session = SessionModel(
        title=payload.title or "New Conversation",
        custom_metadata=payload.metadata or {}
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("", response_model=SessionListResponse)
async def list_sessions(db: AsyncSession = Depends(get_db)):
    """List all previous conversation sessions ordered by updated timestamp."""
    stmt = select(SessionModel).order_by(SessionModel.updated_at.desc())
    res = await db.execute(stmt)
    sessions = res.scalars().all()
    return SessionListResponse(
        sessions=[SessionResponse.model_validate(s) for s in sessions],
        total=len(sessions)
    )

@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve details for a specific session."""
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )
    return session

@router.get("/{session_id}/messages", response_model=MessageListResponse)
async def get_session_messages(session_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve all messages belonging to a session in chronological order."""
    session_stmt = select(SessionModel).where(SessionModel.id == session_id)
    s_res = await db.execute(session_stmt)
    session = s_res.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    stmt = select(MessageModel).where(
        MessageModel.session_id == session_id
    ).order_by(MessageModel.created_at.asc())
    res = await db.execute(stmt)
    messages = res.scalars().all()

    formatted = []
    for m in messages:
        citations_data = [Citation(**c) for c in (m.citations or [])]
        formatted.append(
            MessageItem(
                id=m.id,
                session_id=m.session_id,
                role=m.role,
                content=m.content,
                provider=m.provider,
                model_name=m.model_name,
                citations=citations_data,
                created_at=m.created_at
            )
        )

    return MessageListResponse(
        session_id=session_id,
        messages=formatted
    )

@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(session_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a session and all its associated messages and artifacts."""
    stmt = select(SessionModel).where(SessionModel.id == session_id)
    res = await db.execute(stmt)
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found."
        )

    await db.delete(session)
    await db.commit()
    return None
