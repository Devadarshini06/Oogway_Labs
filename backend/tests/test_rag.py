import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.rag.retriever import retriever
from backend.app.rag.chunker import parse_transcript_file, chunk_transcript
from pathlib import Path

@pytest.mark.asyncio
async def test_chunker_parses_real_transcript():
    """Verify chunker parses YAML frontmatter and splits text accurately."""
    sample_path = Path("data/lennys-podcast-transcripts/episodes/elena-verna/transcript.md")
    if sample_path.exists():
        parsed = parse_transcript_file(sample_path)
        assert parsed is not None
        assert parsed["metadata"]["guest"] == "Elena Verna"
        assert "youtube_url" in parsed["metadata"]

        chunks = chunk_transcript(parsed, episode_slug="elena-verna", chunk_size=1000)
        assert len(chunks) > 0
        first_chunk = chunks[0]
        assert first_chunk["guest"] == "Elena Verna"
        assert "content" in first_chunk
        assert len(first_chunk["content"]) > 50

@pytest.mark.asyncio
async def test_retriever_returns_citations(db_session: AsyncSession):
    """Verify retriever fetches chunks and formats citations with guest and metadata."""
    results = await retriever.retrieve(db=db_session, query="retention and growth loops", top_k=3)
    assert len(results) > 0

    citations = retriever.format_citations(results)
    assert len(citations) == len(results)
    for c in citations:
        assert c.guest is not None
        assert len(c.guest) > 0
        assert c.episode_title is not None
        assert c.quote is not None

@pytest.mark.asyncio
async def test_unsupported_query_empty_or_low_score(db_session: AsyncSession):
    """Verify that completely off-topic questions return minimal or empty relevant chunks."""
    # Quantum physics equation query that has no match in Lenny's podcast
    off_topic_query = "schrodinger wave equation relativistic quantum electrodynamics lagrangian"
    results = await retriever.retrieve(db=db_session, query=off_topic_query, top_k=3, min_similarity=0.85)
    # High threshold should filter out unrelated noise
    assert len(results) == 0
