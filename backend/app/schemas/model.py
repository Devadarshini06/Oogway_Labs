from pydantic import BaseModel, Field
from typing import List, Optional

class ModelInfo(BaseModel):
    id: str = Field(..., description="Provider or model identifier")
    name: str = Field(..., description="Display name")
    provider: str = Field(..., description="Provider: ollama, anthropic, openai")
    is_local: bool = Field(..., description="True if running locally on machine")
    is_available: bool = Field(..., description="True if reachable and configured")
    status_message: Optional[str] = Field(None, description="Diagnostic status or error message")

class ModelListResponse(BaseModel):
    active_provider: str
    active_model: str
    models: List[ModelInfo]
