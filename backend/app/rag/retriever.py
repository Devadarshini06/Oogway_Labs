import logging
from typing import List, Dict, Any, Optional
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.chunk import TranscriptChunkModel
from backend.app.rag.embedder import embedder
from backend.app.schemas.chat import Citation
from backend.app.config import settings

logger = logging.getLogger(__name__)

def cosine_similarity(v1: List[float], v2: List[float]) -> float:
    a = np.array(v1)
    b = np.array(v2)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))

class TranscriptRetriever:
    """Retrieves relevant transcript chunks using hybrid vector similarity and keyword weighting."""

    async def retrieve(
        self,
        db: AsyncSession,
        query: str,
        top_k: Optional[int] = None,
        min_similarity: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        k = top_k or settings.RAG_TOP_K
        threshold = min_similarity if min_similarity is not None else settings.RAG_SIMILARITY_THRESHOLD

        # 1. Embed query
        query_vector = embedder.embed_query(query)
        query_lower = query.lower()

        # 2. Fetch chunks from DB
        stmt = select(TranscriptChunkModel)
        result = await db.execute(stmt)
        chunks: List[TranscriptChunkModel] = result.scalars().all()

        if not chunks:
            logger.warning("No transcript chunks found in database.")
            return []

        scored_chunks = []
        for chunk in chunks:
            sim = 0.0
            if chunk.embedding and isinstance(chunk.embedding, list):
                sim = cosine_similarity(query_vector, chunk.embedding)

            # Keyword boost for guest name or exact matches
            keyword_boost = 0.0
            if chunk.guest and chunk.guest.lower() in query_lower:
                keyword_boost += 0.20
            if chunk.episode_title and any(word in chunk.episode_title.lower() for word in query_lower.split() if len(word) > 4):
                keyword_boost += 0.10

            final_score = sim + keyword_boost

            if final_score >= threshold or sim >= threshold:
                scored_chunks.append({
                    "chunk": chunk,
                    "score": final_score,
                    "cosine_sim": sim
                })

        # Sort descending by score
        scored_chunks.sort(key=lambda x: x["score"], reverse=True)
        top_results = scored_chunks[:k]

        formatted = []
        for item in top_results:
            c: TranscriptChunkModel = item["chunk"]
            formatted.append({
                "episode_slug": c.episode_slug,
                "episode_title": c.episode_title,
                "guest": c.guest,
                "youtube_url": c.youtube_url,
                "timestamp_str": c.timestamp_str,
                "content": c.content,
                "score": round(item["score"], 4)
            })

        return formatted

    def format_citations(self, retrieved: List[Dict[str, Any]]) -> List[Citation]:
        citations = []
        for r in retrieved:
            # First 180 chars as representative quote excerpt
            quote_snippet = r["content"].strip().split("\n")[0][:220]
            citations.append(Citation(
                episode_slug=r["episode_slug"],
                episode_title=r["episode_title"],
                guest=r["guest"],
                youtube_url=r["youtube_url"],
                timestamp_str=r["timestamp_str"],
                quote=quote_snippet,
                similarity_score=r.get("score")
            ))
        return citations

retriever = TranscriptRetriever()
