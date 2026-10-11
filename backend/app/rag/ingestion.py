import os
import logging
from pathlib import Path
from typing import List, Optional
from sqlalchemy import select, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.chunk import TranscriptChunkModel
from backend.app.rag.chunker import parse_transcript_file, chunk_transcript
from backend.app.rag.embedder import embedder

logger = logging.getLogger(__name__)

# Key representative episodes covering diverse PM/Growth topics
CURATED_EPISODES = [
    "elena-verna",
    "casey-winters",
    "shreyas-doshi",
    "brian-balfour",
    "rahul-vohra",
    "gustaf-alstromer",
    "gibson-biddle",
    "hila-qu",
    "bob-moesta",
    "daphne-tideman",
    "adam-fishman",
    "fareed-mosavat",
    "petra-wille",
    "teresa-torres",
    "luke-behnke"
]

async def ingest_transcripts(
    db: AsyncSession,
    source_dir: Optional[str] = None,
    max_episodes: int = 15,
    force_reindex: bool = False
) -> dict:
    """Ingest transcript files into PostgreSQL transcript_chunks table with embeddings."""
    base_path = Path(source_dir or "data/lennys-podcast-transcripts/episodes")
    if not base_path.exists():
        logger.error(f"Transcript directory not found: {base_path}")
        return {
            "status": "error",
            "episodes_ingested": 0,
            "chunks_created": 0,
            "total_chunks_in_db": 0,
            "message": f"Source directory {base_path} does not exist."
        }

    # Discover episode folders
    episode_folders = []
    # Prioritize curated high-signal episodes first
    for slug in CURATED_EPISODES:
        target = base_path / slug
        if target.is_dir() and (target / "transcript.md").exists():
            episode_folders.append(target)

    # Add remaining folders up to max_episodes
    for folder in sorted(base_path.iterdir()):
        if folder.is_dir() and (folder / "transcript.md").exists():
            if folder not in episode_folders:
                episode_folders.append(folder)
        if len(episode_folders) >= max_episodes:
            break

    episode_folders = episode_folders[:max_episodes]
    logger.info(f"Preparing to ingest {len(episode_folders)} episodes.")

    total_chunks_created = 0
    episodes_ingested = 0

    for ep_folder in episode_folders:
        slug = ep_folder.name
        transcript_file = ep_folder / "transcript.md"

        # Check if already indexed
        if not force_reindex:
            existing = await db.execute(
                select(func.count(TranscriptChunkModel.id)).where(TranscriptChunkModel.episode_slug == slug)
            )
            count = existing.scalar() or 0
            if count > 0:
                logger.info(f"Episode '{slug}' already has {count} chunks. Skipping (force_reindex=False).")
                continue

        parsed = parse_transcript_file(transcript_file)
        if not parsed:
            continue

        # If reindexing, clear previous chunks for this episode
        if force_reindex:
            await db.execute(
                delete(TranscriptChunkModel).where(TranscriptChunkModel.episode_slug == slug)
            )

        chunks_data = chunk_transcript(parsed, episode_slug=slug)
        if not chunks_data:
            continue

        # Extract contents and compute embeddings in batch
        texts_to_embed = [c["content"] for c in chunks_data]
        vectors = embedder.embed_texts(texts_to_embed)

        db_chunk_models = []
        for i, c in enumerate(chunks_data):
            db_chunk_models.append(
                TranscriptChunkModel(
                    episode_slug=c["episode_slug"],
                    episode_title=c["episode_title"],
                    guest=c["guest"],
                    youtube_url=c["youtube_url"],
                    timestamp_str=c["timestamp_str"],
                    content=c["content"],
                    embedding=vectors[i]
                )
            )

        db.add_all(db_chunk_models)
        await db.commit()

        total_chunks_created += len(db_chunk_models)
        episodes_ingested += 1
        logger.info(f"Ingested '{slug}': created {len(db_chunk_models)} chunks.")

    # Get total chunk count
    total_res = await db.execute(select(func.count(TranscriptChunkModel.id)))
    total_in_db = total_res.scalar() or 0

    return {
        "status": "success",
        "episodes_ingested": episodes_ingested,
        "chunks_created": total_chunks_created,
        "total_chunks_in_db": total_in_db,
        "message": f"Successfully indexed {episodes_ingested} episodes ({total_chunks_created} chunks)."
    }
