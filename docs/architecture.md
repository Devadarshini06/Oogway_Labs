# System Architecture Document
## The Lenny Growth Assistant

**Author:** Forward Deployed Engineer  
**Date:** October 11, 2026  
**Version:** 1.0.0  

---

## 1. High-Level Architecture Overview

The Lenny Growth Assistant is built with a clean separation of concerns:
1. **Frontend (Presentation Layer):** Single-page application built with React, Vite, TypeScript, and Tailwind CSS. Provides a dual-pane layout: Conversational Interface on the left/center, Sandboxed Artifact Viewer on the right.
2. **Backend (API & Orchestration Layer):** FastAPI service providing REST endpoints, Pydantic validation, structured logging, and unified model provider routing.
3. **Agent & Skill Layer:** Decoupled LLM abstraction supporting Ollama (local) and Anthropic/OpenAI (cloud), with dedicated tools:
   - `PodcastRetrievalTool`: Semantic and keyword retrieval from indexed transcripts.
   - `Ship30EssaySkill`: High-retention essay generator (~1,250 words).
   - `ArtifactGeneratorSkill`: Structured code/content generator.
4. **Persistence & Vector Storage:** PostgreSQL with SQLAlchemy ORM and Alembic migrations. Handles session management, conversation history, transcript metadata, text chunks with vector embeddings, and generated artifacts.

```
                      ┌─────────────────────────────────────────┐
                      │             React Frontend              │
                      │  (Chat UI + Sandboxed Artifact Viewer)  │
                      └────────────────────┬────────────────────┘
                                           │ HTTP/JSON
                                           ▼
                      ┌─────────────────────────────────────────┐
                      │              FastAPI API                │
                      │         (/api/v1/chat, sessions)        │
                      └──────────────┬───────────────────┬──────┘
                                     │                   │
                  ┌──────────────────▼────┐         ┌────▼─────────────────┐
                  │   Agent Orchestrator  │         │   PostgreSQL Engine  │
                  │   & Provider Router   │         │ (Sessions, Messages, │
                  └───────────┬───────────┘         │  Chunks, Artifacts)  │
                              │                     └──────────────────────┘
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
     │   Ollama    │   │  Anthropic  │   │   OpenAI    │
     │  (Local)    │   │   (Cloud)   │   │   (Cloud)   │
     └─────────────┘   └─────────────┘   └─────────────┘
```

---

## 2. Database Schema (PostgreSQL)

### 2.1 Table: `sessions`
Represents an independent conversation thread.
```sql
CREATE TABLE sessions (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);
```

### 2.2 Table: `messages`
Stores user and assistant turns with model metadata and citations.
```sql
CREATE TABLE messages (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) REFERENCES sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    provider VARCHAR(50),      -- 'ollama', 'anthropic', 'openai'
    model_name VARCHAR(100),   -- 'qwen2.5:0.5b', 'claude-3-5-sonnet'
    citations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_messages_session_id ON messages(session_id);
```

### 2.3 Table: `transcript_chunks`
Stores segmented transcript passages with source metadata and embeddings.
```sql
CREATE TABLE transcript_chunks (
    id VARCHAR(36) PRIMARY KEY,
    episode_slug VARCHAR(255) NOT NULL,
    episode_title VARCHAR(255) NOT NULL,
    guest VARCHAR(255) NOT NULL,
    youtube_url VARCHAR(500),
    timestamp_str VARCHAR(50),
    content TEXT NOT NULL,
    embedding JSONB, -- Stored as vector array / JSONB with fallback cosine similarity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_chunks_episode ON transcript_chunks(episode_slug);
```

### 2.4 Table: `artifacts`
Stores generated Markdown documents and HTML/CSS snippets linked to sessions.
```sql
CREATE TABLE artifacts (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) REFERENCES sessions(id) ON DELETE SET NULL,
    message_id VARCHAR(36) REFERENCES messages(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    artifact_type VARCHAR(50) NOT NULL, -- 'markdown', 'html'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. API Contracts (`/api/v1`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Service liveness probe returning `{ status: "ok", timestamp }` |
| `GET` | `/api/v1/ready` | Readiness probe verifying DB connectivity and active LLM provider |
| `POST` | `/api/v1/sessions` | Create a new session `{ title?: string }` |
| `GET` | `/api/v1/sessions` | List recent conversation sessions |
| `GET` | `/api/v1/sessions/{id}` | Retrieve specific session metadata |
| `GET` | `/api/v1/sessions/{id}/messages` | Retrieve chronological message history for a session |
| `POST` | `/api/v1/chat` | Send a chat message; executes RAG, agent routing, and persistence |
| `GET` | `/api/v1/models` | List available and currently selected model providers |
| `POST` | `/api/v1/knowledge/ingest` | Ingest transcripts from source files into chunk index |
| `POST` | `/api/v1/artifacts` | Save or update a standalone artifact |
| `GET` | `/api/v1/artifacts/{id}` | Fetch an artifact by ID for viewing |

---

## 4. Ingestion & Retrieval Pipeline

```
  Transcript Archive (.md) 
         │ (YAML Frontmatter: Guest, Title, YouTube URL, Duration)
         ▼
  Recursive Markdown Chunker (500 - 800 tokens, 100 token overlap)
         │ Preserves timestamps ([00:15:20]) and speaker tags
         ▼
  Semantic Embedder (all-MiniLM-L6-v2 / nomic-embed-text)
         │ Generates dense vectors
         ▼
  PostgreSQL Storage & Hybrid Index (Vector Cosine + Full-Text Search)
         │
         ▼
  Top-K Retrieval with Relevance Filtering & De-duplication
         │
         ▼
  System Prompt Context Injection with Strict Grounding Guardrails
```

---

## 5. Model Provider Abstraction

All LLM calls flow through an abstract base class:
```python
class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate(self, messages: list[dict], system_prompt: str, tools: list[dict] = None) -> LLMResponse:
        pass
    
    @abstractmethod
    async def is_available(self) -> bool:
        pass
```

- **OllamaProvider:** Communicates with Ollama's HTTP API at `http://localhost:11434/api/chat`.
- **AnthropicProvider:** Communicates with Anthropic's Messages API using `anthropic` client.
- **OpenAIProvider:** Communicates with OpenAI's Chat Completions API using `openai` client.
- **Provider Registry:** Instantiates providers dynamically based on `LLM_PROVIDER` environment variable or per-request override.

---

## 6. Artifact Security Architecture

To guarantee that model-generated HTML cannot compromise the host application:
1. **Isolated Iframe Sandbox:** Rendered inside `<iframe sandbox="allow-scripts" srcDoc={content} />`.
2. **Denial of Sensitive Privileges:**
   - NO `allow-same-origin`: The iframe executes in a unique, null origin, completely blocking access to parent `window`, `document.cookie`, `localStorage`, `sessionStorage`, and credentials.
   - NO `allow-top-navigation`: The iframe cannot redirect the parent application.
   - NO `allow-popups`: Prevents modal or tab spam.
3. **Markdown Sanitization:** Rendered with `react-markdown` and sanitized using `rehype-sanitize` to disallow malicious script injection.

---

## 7. Observability & Error Handling

- **Structured Logging:** Standard Python `logging` with JSON/structured formatter emitting timestamp, module, log level, request ID, session ID, and duration.
- **Graceful Error Recovery:**
  - `ProviderConnectionError`: Informs user that Ollama is not running with restart instructions.
  - `MissingAPIKeyError`: Suggests switching to local Ollama or setting the cloud key in `.env`.
  - `InsufficientEvidenceError`: Assistant explicitly reports when Lenny's transcripts do not contain the answer rather than hallucinating.
