import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, DateTime, JSON, Index
from backend.app.database import Base

class TranscriptChunkModel(Base):
    __tablename__ = "transcript_chunks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    episode_slug = Column(String(255), nullable=False, index=True)
    episode_title = Column(String(255), nullable=False)
    guest = Column(String(255), nullable=False, index=True)
    youtube_url = Column(String(500), nullable=True)
    timestamp_str = Column(String(50), nullable=True)
    content = Column(Text, nullable=False)
    embedding = Column(JSON, nullable=True)  # JSON-encoded float array for universal compatibility
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

Index("idx_chunks_guest", TranscriptChunkModel.guest)
Index("idx_chunks_episode", TranscriptChunkModel.episode_slug)
