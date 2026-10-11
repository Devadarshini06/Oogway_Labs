from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

class Citation(BaseModel):
    episode_slug: str = Field(..., description="Episode directory slug")
    episode_title: str = Field(..., description="Full title of the podcast episode")
    guest: str = Field(..., description="Guest speaker name")
    youtube_url: Optional[str] = Field(None, description="Direct YouTube link")
    timestamp_str: Optional[str] = Field(None, description="Timestamp in episode e.g. [00:15:24]")
    quote: str = Field(..., description="Verbatim quote or relevant excerpt from transcript")
    similarity_score: Optional[float] = Field(None, description="Retrieval similarity score")

class ChatMessageRequest(BaseModel):
    session_id: Optional[str] = Field(None, description="Session UUID; creates new if omitted")
    message: str = Field(..., min_length=1, description="User question or prompt")
    provider: Optional[str] = Field(None, description="Override LLM provider: ollama, anthropic, openai")
    model: Optional[str] = Field(None, description="Override specific model name")
    enable_rag: bool = Field(True, description="Whether to ground response with transcript RAG")
    trigger_ship30: Optional[bool] = Field(False, description="Explicitly trigger Ship 30 for 30 essay generation")
    trigger_artifact: Optional[bool] = Field(False, description="Explicitly trigger Artifact generation")

class ArtifactRef(BaseModel):
    id: str
    title: str
    artifact_type: str
    content: str

class ChatMessageResponse(BaseModel):
    session_id: str
    message_id: str
    content: str
    provider: str
    model_name: str
    citations: List[Citation] = Field(default_factory=list)
    artifact: Optional[ArtifactRef] = None
    created_at: datetime

class MessageItem(BaseModel):
    id: str
    session_id: str
    role: str
    content: str
    provider: Optional[str] = None
    model_name: Optional[str] = None
    citations: List[Citation] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MessageListResponse(BaseModel):
    session_id: str
    messages: List[MessageItem]
