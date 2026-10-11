# The Lenny Growth Assistant

A full-stack, transcript-grounded conversational assistant, executive Ship 30 for 30 essay engine, and sandboxed Artifact workstation powered by **Lenny's Podcast** transcripts.

Built for the **Forward Deployed Engineer** technical assessment.

---

## 1. Project Overview

**The Lenny Growth Assistant** bridges high-signal product management wisdom from 260+ episodes of *Lenny’s Podcast* with a production-minded conversational interface:
- **Verified Grounding & Attribution:** Semantic search over transcript passages with exact guest names, episode titles, timestamps, and clickable YouTube links.
- **Ship 30 for 30 Writing Skill:** Dedicated module turning grounded insights into structured long-form essays (~1,250 words) with hooks, frameworks, and tactical takeaways.
- **Beside-the-Chat Artifact Viewer:** Renders generated Markdown and interactive HTML/CSS dashboards in a securely sandboxed iframe (`sandbox="allow-scripts"` with isolated null origin).
- **Multi-Provider Architecture:** 100% functional local inference via **Ollama (`qwen2.5:0.5b`)** with dynamic zero-code switching to Cloud LLMs (**Anthropic Claude 3.5 Sonnet / OpenAI GPT-4o**).
- **PostgreSQL Persistence:** Persistent multi-session history with complete context isolation across conversations.

---

## 2. Architecture & Tech Stack

```
                          ┌──────────────────────────────────────┐
                          │         React 19 + TypeScript        │
                          │   Vite + Tailwind CSS + Lucide Icons │
                          └──────────────────┬───────────────────┘
                                             │ HTTP/JSON
                                             ▼
                          ┌──────────────────────────────────────┐
                          │           FastAPI Backend            │
                          │   Pydantic V2 + SQLAlchemy Async     │
                          └──────────────┬────────────────┬──────┘
                                         │                │
                      ┌──────────────────▼───┐       ┌────▼─────────────────┐
                      │  Agent Orchestrator  │       │      PostgreSQL      │
                      │  Claude Agent Bridge │       │ Sessions, Messages,  │
                      └──────────┬───────────┘       │ Chunks, Artifacts    │
                                 │                   └──────────────────────┘
            ┌────────────────────┼────────────────────┐
            ▼                    ▼                    ▼
     ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
     │   Ollama    │      │  Anthropic  │      │   OpenAI    │
     │  (qwen2.5)  │      │  (Claude)   │      │  (GPT-4o)   │
     └─────────────┘      └─────────────┘      └─────────────┘
```

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React-Markdown, Rehype-Sanitize.
- **Backend:** Python 3.12, FastAPI, SQLAlchemy (Asyncio), asyncpg, Pydantic V2, Sentence-Transformers.
- **Database:** PostgreSQL 15 (Local Homebrew, Docker, or Supabase/Railway).
- **Inference:** Local Ollama daemon (`qwen2.5:0.5b` ~398MB) + Anthropic Claude / OpenAI adapters.

---

## 3. Prerequisites

- **macOS / Linux / Windows WSL2**
- **Python 3.11+** (Tested on Python 3.12.10)
- **Node.js 20+** (Tested on Node.js v24.12.0)
- **PostgreSQL 14+** (Or Docker)
- **Ollama** (For zero-cost local evaluation)

---

## 4. Quick Start (Native Host)

### Step 1: Clone & Configure Environment
```bash
git clone https://github.com/your-username/lenny-growth-assistant.git
cd lenny-growth-assistant

# Copy safe default configuration
cp .env.example .env
```

### Step 2: Start Local Database
If using local Homebrew PostgreSQL:
```bash
# Ensure PostgreSQL is active
brew services start postgresql@15

# Create database (if not existing)
createdb lenny_assistant
```

### Step 3: Start Ollama & Pull Local Model
```bash
# Ensure Ollama daemon is running
ollama serve &

# Pull lightweight 398MB model
ollama pull qwen2.5:0.5b
```

### Step 4: Run Application
Run the one-command launcher:
```bash
./run_local.sh
```

- **Web UI:** [http://localhost:5173](http://localhost:5173)
- **FastAPI Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

---

## 5. Docker Compose Deployment

If you prefer containerized deployment:
```bash
# Configure environment
cp .env.example .env

# Launch PostgreSQL, Backend, and Frontend containers
docker compose up --build
```
*Note for Ollama in Docker:* The backend connects to the host machine's Ollama instance via `host.docker.internal:11434`.

---

## 6. Model Provider Configuration

Switch between local and cloud providers dynamically via the **UI Model Selector** in the top navigation bar or via `.env`:

```env
# 1. Local Ollama (Default - No API Keys Needed)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:0.5b

# 2. Cloud Anthropic Claude
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# 3. Cloud OpenAI
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

---

## 7. Transcript Ingestion & Knowledge Base

Transcripts are sourced directly from the official community repository: [ChatPRD/lennys-podcast-transcripts](https://github.com/ChatPRD/lennys-podcast-transcripts).

To re-index or ingest additional episodes:
```bash
# Ingest 15 curated episodes into PostgreSQL
.venv/bin/python -c '
import asyncio
from backend.app.database import AsyncSessionLocal
from backend.app.rag.ingestion import ingest_transcripts

async def run():
    async with AsyncSessionLocal() as session:
        await ingest_transcripts(session, max_episodes=15, force_reindex=False)
asyncio.run(run())
'
```
Or trigger via API:
```bash
curl -X POST http://localhost:8000/api/v1/knowledge/ingest \
  -H "Content-Type: application/json" \
  -d '{"max_episodes": 15, "force_reindex": false}'
```

---

## 8. Running Automated Tests

The test suite validates API contracts, session context isolation, provider routing, retrieval attribution, and artifact security:

```bash
# Run complete test suite
PYTHONPATH=. .venv/bin/pytest backend/tests/ -v
```

### Test Coverage Highlights:
- `test_health.py`: Liveness and readiness endpoints with DB checks.
- `test_sessions.py`: Session persistence and multi-session context isolation.
- `test_providers.py`: Dynamic provider routing and graceful error handling on missing keys.
- `test_rag.py`: Verifies source citations, timestamps, and honesty on unsupported queries.
- `test_ship30.py`: Enforces Ship 30 for 30 criteria (hook, rhythm, bullets, takeaways, word count).
- `test_artifacts.py`: Validates HTML sanitization against XSS and DOM hijacking.

---

## 9. Security Boundary: Sandboxed Artifact Viewer

Generated HTML code is treated as untrusted:
1. **Isolated Iframe Execution:** Rendered with `<iframe sandbox="allow-scripts" srcDoc={content} />`.
2. **Null-Origin Sandbox:** The iframe has **NO** `allow-same-origin` or `allow-top-navigation` permissions. It is physically incapable of reading parent cookies, `localStorage`, `sessionStorage`, or making authenticated API calls.
3. **Backend Sanitization:** Payloads are passed through `sanitize_artifact_content()` to neutralize attempts to reference `parent.`, `top.`, or `document.cookie`.
4. **Markdown Sanitization:** Processed with `rehype-sanitize` to disallow embedded scripts.

---

## 10. Required Assessment Documentation

- [Product Requirements Document (PRD)](docs/PRD.md)
- [System Architecture Document](docs/architecture.md)
- [Design & UI/UX Guidelines](docs/design.md)
- [Comprehensive Test Plan](docs/test-plan.md)
- [Implementation Plan](docs/implementation-plan.md)
- [2–3 Minute Demo Video Script](docs/demo-script.md)
- [Agent Execution Transcripts](agent-transcripts/README.md)

---

## 11. Troubleshooting

| Symptom | Cause | Resolution |
|---|---|---|
| **Ollama connection refused** | Ollama daemon not started | Run `brew services start ollama` or `ollama serve`. |
| **Model not found in Ollama** | Model weights not downloaded | Run `ollama pull qwen2.5:0.5b`. |
| **Database connection error** | PostgreSQL service stopped | Run `brew services start postgresql@15` or check credentials in `.env`. |
| **Anthropic/OpenAI 503 error** | Missing API key | Set `ANTHROPIC_API_KEY` in `.env` or switch to local Ollama in UI dropdown. |
| **Frontend blank screen** | API proxy or node modules | Run `cd frontend && npm install && npm run dev`. |

---

## 12. Extending the Application

1. **Add More Transcripts:** Add additional markdown transcripts to `data/lennys-podcast-transcripts/episodes/` and trigger `/api/v1/knowledge/ingest`.
2. **Add Custom Agent Tools:** Add tools to `backend/app/agent/tools.py` and implement handlers in `claude_agent_bridge.py`.
3. **Add New Providers:** Subclass `BaseLLMProvider` in `backend/app/providers/` and register in `router.py`.
