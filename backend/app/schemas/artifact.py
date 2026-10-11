from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional

class ArtifactCreate(BaseModel):
    session_id: Optional[str] = Field(None, description="Optional associated session ID")
    message_id: Optional[str] = Field(None, description="Optional associated message ID")
    title: str = Field(..., max_length=255, description="Artifact title")
    artifact_type: str = Field(..., description="Artifact type: markdown or html")
    content: str = Field(..., description="Raw text/HTML/Markdown of the artifact")

class ArtifactResponse(BaseModel):
    id: str
    session_id: Optional[str] = None
    message_id: Optional[str] = None
    title: str
    artifact_type: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
