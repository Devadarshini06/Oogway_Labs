from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from backend.app.database import get_db
from backend.app.models.chunk import TranscriptChunkModel
from backend.app.schemas.knowledge import IngestRequest, IngestResponse
from backend.app.rag.ingestion import ingest_transcripts

router = APIRouter(prefix="/knowledge", tags=["Knowledge & RAG"])

@router.post("/ingest", response_model=IngestResponse, status_code=status.HTTP_200_OK)
async def ingest_knowledge(
    payload: IngestRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ingest Lenny's Podcast transcripts from local archive into PostgreSQL.
    Extracts metadata, chunks text with timestamps, embeds content, and indexes for RAG.
    """
    result = await ingest_transcripts(
        db=db,
        source_dir=payload.source_dir,
        max_episodes=payload.max_episodes or 15,
        force_reindex=payload.force_reindex
    )
    return IngestResponse(**result)

@router.get("/stats")
async def get_knowledge_stats(db: AsyncSession = Depends(get_db)):
    """Return summary statistics of the indexed podcast knowledge base."""
    total_chunks_res = await db.execute(select(func.count(TranscriptChunkModel.id)))
    total_chunks = total_chunks_res.scalar() or 0

    episodes_res = await db.execute(
        select(func.count(func.distinct(TranscriptChunkModel.episode_slug)))
    )
    distinct_episodes = episodes_res.scalar() or 0

    guests_res = await db.execute(
        select(TranscriptChunkModel.guest).distinct().limit(20)
    )
    guests = [g[0] for g in guests_res.fetchall()]

    return {
        "indexed_episodes_count": distinct_episodes,
        "indexed_chunks_count": total_chunks,
        "sample_guests": guests
    }
