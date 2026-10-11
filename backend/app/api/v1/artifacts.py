import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from backend.app.database import get_db
from backend.app.models.artifact import ArtifactModel
from backend.app.schemas.artifact import ArtifactCreate, ArtifactResponse
from backend.app.skills.artifact_generator import sanitize_artifact_content

router = APIRouter(prefix="/artifacts", tags=["Artifacts"])

@router.post("", response_model=ArtifactResponse, status_code=status.HTTP_201_CREATED)
async def create_artifact(payload: ArtifactCreate, db: AsyncSession = Depends(get_db)):
    """Save a generated Markdown or HTML artifact."""
    sanitized = sanitize_artifact_content(payload.content, payload.artifact_type)
    artifact = ArtifactModel(
        id=str(uuid.uuid4()),
        session_id=payload.session_id,
        message_id=payload.message_id,
        title=payload.title,
        artifact_type=payload.artifact_type.lower(),
        content=sanitized
    )
    db.add(artifact)
    await db.commit()
    await db.refresh(artifact)
    return artifact

@router.get("/{artifact_id}", response_model=ArtifactResponse)
async def get_artifact(artifact_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve an artifact by ID for display in the Artifact Viewer."""
    stmt = select(ArtifactModel).where(ArtifactModel.id == artifact_id)
    res = await db.execute(stmt)
    artifact = res.scalar_one_or_none()
    if not artifact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Artifact '{artifact_id}' not found."
        )
    return artifact

@router.get("/session/{session_id}", response_model=List[ArtifactResponse])
async def list_session_artifacts(session_id: str, db: AsyncSession = Depends(get_db)):
    """List all artifacts generated within a specific conversation session."""
    stmt = select(ArtifactModel).where(
        ArtifactModel.session_id == session_id
    ).order_by(ArtifactModel.created_at.desc())
    res = await db.execute(stmt)
    return res.scalars().all()
