from pydantic import BaseModel, Field
from typing import List, Optional

class IngestRequest(BaseModel):
    source_dir: Optional[str] = Field(None, description="Local path or directory containing transcripts")
    max_episodes: Optional[int] = Field(20, description="Maximum episodes to ingest")
    force_reindex: bool = Field(False, description="Reindex existing episodes")

class IngestResponse(BaseModel):
    status: str
    episodes_ingested: int
    chunks_created: int
    total_chunks_in_db: int
    message: str

class ChunkItem(BaseModel):
    id: str
    episode_slug: str
    episode_title: str
    guest: str
    youtube_url: Optional[str]
    timestamp_str: Optional[str]
    content: str
    created_at: str
