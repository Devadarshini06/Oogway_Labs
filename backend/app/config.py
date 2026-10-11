from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List, Optional
import os

class Settings(BaseSettings):
    # LLM Provider Configuration
    LLM_PROVIDER: str = Field(default="ollama", description="Active provider: ollama, anthropic, openai")
    OLLAMA_BASE_URL: str = Field(default="http://localhost:11434", description="Ollama API base URL")
    OLLAMA_MODEL: str = Field(default="qwen2.5:0.5b", description="Ollama model name")
    
    ANTHROPIC_API_KEY: Optional[str] = Field(default=None, description="Anthropic API key")
    ANTHROPIC_MODEL: str = Field(default="claude-3-5-sonnet-20241022", description="Anthropic model name")
    
    OPENAI_API_KEY: Optional[str] = Field(default=None, description="OpenAI API key")
    OPENAI_MODEL: str = Field(default="gpt-4o-mini", description="OpenAI model name")
    
    LLM_TIMEOUT_SECONDS: int = Field(default=60, description="Timeout for LLM generation requests")
    
    # Database Configuration
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://devadarshinink@localhost:5432/lenny_assistant",
        description="Async PostgreSQL connection URI"
    )
    DATABASE_SYNC_URL: str = Field(
        default="postgresql+psycopg2://devadarshinink@localhost:5432/lenny_assistant",
        description="Sync PostgreSQL connection URI for migrations"
    )
    
    # Knowledge & RAG Configuration
    EMBEDDING_PROVIDER: str = Field(default="local", description="Embedding provider: local or ollama")
    EMBEDDING_MODEL: str = Field(default="all-MiniLM-L6-v2", description="Embedding model identifier")
    RAG_TOP_K: int = Field(default=5, description="Number of chunks to retrieve per query")
    RAG_SIMILARITY_THRESHOLD: float = Field(default=0.35, description="Minimum cosine similarity score")
    
    # Server & CORS
    BACKEND_HOST: str = Field(default="0.0.0.0", description="Backend host bind address")
    BACKEND_PORT: int = Field(default=8000, description="Backend port")
    FRONTEND_PORT: int = Field(default=5173, description="Frontend port")
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173",
        description="Comma-separated CORS origins"
    )
    
    ENVIRONMENT: str = Field(default="development", description="Environment mode")
    LOG_LEVEL: str = Field(default="INFO", description="Log level")
    
    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
