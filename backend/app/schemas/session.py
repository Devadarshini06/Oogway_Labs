from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any, List

class SessionCreate(BaseModel):
    title: Optional[str] = Field(default="New Conversation", max_length=255)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class SessionUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    metadata: Optional[Dict[str, Any]] = None

class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict, validation_alias="custom_metadata")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]
    total: int
