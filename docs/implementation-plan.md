# The Lenny Growth Assistant — Implementation Plan

**Role:** Forward Deployed Engineer  
**Project:** The Lenny Growth Assistant  
**Date:** October 11, 2026  
**Status:** In Progress — Phase 1 Complete / Phase 2 Commencing  

---

## 1. Executive Summary & Problem Framing

Growth and Product Management teams require tactical, battle-tested advice from industry leaders (as featured on *Lenny’s Podcast*). However, navigating hundreds of podcast episodes and transcripts is cumbersome. Generic chatbots hallucinate strategies, lack attribution to real operators, and cannot generate high-leverage deliverables like Ship 30 for 30 essays or live interactive UI artifacts.

**The Lenny Growth Assistant** is an enterprise-grade AI assistant that:
1. Groundedly answers growth and product questions using indexed transcripts from *Lenny’s Podcast*.
2. Quotes and cites exact episodes, guests, and YouTube timestamps.
3. Formats synthesis into structured Ship 30 for 30 long-form essays (~1,250 words).
4. Generates interactive Markdown and HTML/CSS artifacts rendered securely in a native beside-the-chat sandboxed viewer.
5. Runs locally on an Apple M1 8GB RAM machine with Ollama (`qwen2.5:0.5b`), with dynamic switching to cloud providers (Anthropic Claude / OpenAI).

---

## 2. Environment & Hardware Audit

A system inspection on the host machine revealed:
- **Operating System:** macOS (Apple Silicon M1)
- **Host Memory:** 8.0 GB RAM
- **Available Disk Space:** ~13 GiB free space (94% disk capacity)
- **Python Version:** 3.12.10 (`/Library/Frameworks/Python.framework/Versions/3.12/bin/python3`)
- **Node.js Version:** v24.12.0, npm 11.6.2
- **PostgreSQL:** PostgreSQL 15.18 running locally via Homebrew (`postgresql@15` active on standard port 5432)
- **Docker:** Not installed on host. Docker Compose and container setup files will be provided for containerized deployments, with native host execution scripts for local evaluation.
- **Ollama:** Not initially installed. Installable via `brew install ollama` or local binary. Due to 8GB RAM and 13GB free disk space, the local model selected is `qwen2.5:0.5b` (~398 MB) or `smollm2:135m` (~270 MB), avoiding high memory pressure while ensuring 100% functional local inference.

---

## 3. Knowledge Source & Data Licensing

- **Repository:** `ChatPRD/lennys-podcast-transcripts` (official community archive of Lenny's Podcast)
- **Structure:** 269 episode folders, each containing `transcript.md` with YAML frontmatter:
  - `guest`: Operator/guest name
  - `title`: Full episode title
  - `youtube_url`: Canonical YouTube URL
  - `video_id`: YouTube video ID
  - `publish_date`: YYYY-MM-DD
  - `duration_seconds`: Integer runtime
  - Body: Timestamps (`[00:12:34]`), speaker names, and dialogue.
- **Ingestion Strategy:** Curated representative ingestion of high-signal episodes covering core growth themes: Product-Market Fit, Retention, Product-Led Growth, Pricing, and Growth Frameworks. Automated chunking with recursive text splitting, metadata preservation, and semantic embedding.
- **Attribution Contract:** Every retrieved chunk retains `episode_title`, `guest`, `youtube_url`, `timestamp_estimate`, and chunk text for verbatim citation.

---

## 4. Agent Architecture & Writing Principles

### 4.1 Agent Layer & Provider Abstraction
- **Model Router:** Unified `LLMProvider` interface with concrete implementations:
  - `OllamaProvider`: Local HTTP communication with Ollama daemon (`http://localhost:11434`), streaming and non-streaming.
  - `AnthropicProvider`: Cloud inference via Claude (`claude-3-5-sonnet-20241022` or `claude-3-haiku-20240307`).
  - `OpenAIProvider`: Cloud inference via OpenAI (`gpt-4o-mini` / `gpt-4o`).
- **Claude Agent SDK Integration:** A dedicated bridge and skill orchestration engine implementing tool-calling schemas for:
  - `retrieve_podcast_knowledge(query, topic_filter, max_results)`
  - `generate_ship30_essay(topic, core_insights, target_word_count)`
  - `generate_artifact(title, type, content)`
- **Graceful Degradation:** When cloud API keys are missing or Ollama is offline, the backend surfaces descriptive, actionable errors without crashing or leaking credentials.

### 4.2 Ship 30 for 30 Principles
- **Word Count:** ~1,250 words
- **The Hook:** High-contrast opening line challenging conventional wisdom.
- **The Lead-In:** Empathetic validation of the growth leader's dilemma.
- **Rhythm & Formatting:** Short paragraphs (1-3 sentences), bold key phrases, bulleted breakdowns.
- **Tactical Frameworks:** 3-5 core actionable takeaways, complete with implementation steps.
- **Transcript Grounding:** Real quotes and credited case studies from Lenny's guests.

### 4.3 Secure Artifact Viewer
- **Types:** Markdown documents and HTML/CSS visual frameworks/dashboards.
- **Security Sandboxing:**
  - Rendered in a strict sandboxed `<iframe>` with `sandbox="allow-scripts"` (NO `allow-same-origin`, NO `allow-top-navigation`, NO access to parent cookies, localStorage, or session tokens).
  - Content Security Policy (CSP) headers applied to prevent cross-origin leaks.
  - Markdown parsed with DOMPurify sanitization.

---

## 5. Implementation Phases

| Phase | Milestone | Deliverables | Verification Criteria |
|---|---|---|---|
| **Phase 1** | Inspection & Planning | `docs/implementation-plan.md`, PRD, architecture, design doc | System limits documented, plans aligned |
| **Phase 2** | Foundation Scaffolding | FastAPI backend, PostgreSQL schema, Alembic migrations, health & readiness APIs | Health check 200 OK, DB migrated |
| **Phase 3** | Provider & Agent Layer | Unified LLM abstraction, Ollama adapter, Claude/OpenAI adapters, Claude Agent SDK integration | Unit tests for provider routing & error handling |
| **Phase 4** | Knowledge Base & RAG | Ingestion pipeline, recursive chunker, vector/text retrieval, source attribution | Ingestion script runs, search returns accurate quotes |
| **Phase 5** | Conversation Engine & UI | Session isolation, message persistence, React + Vite + Tailwind frontend | Multi-session test passing, chat UI responsive |
| **Phase 6** | Ship 30 for 30 Skill | Essay generator tool, structured prompts, word-count validation | ~1,250-word essay generated with citations |
| **Phase 7** | Artifact System & Viewer | Artifact generation backend, iframe sandbox UI, copy/preview toggles | Secure rendering without parent DOM access |
| **Phase 8** | Reliability & Testing | Pytest suite, error handling, structured logging, UI test plan | >85% test pass rate on automated suite |
| **Phase 9** | Deployment & Operations | `.env.example`, Docker Compose, startup scripts, README.md | Fresh clone startup runs smoothly |
| **Phase 10** | Polish & Handoff | Demo script, transcript logs, final acceptance verification | All 17 requirements verified |

---

## 6. Acceptance Criteria & Known Constraints

### Acceptance Criteria
1. Backend boots with `GET /api/v1/health` and `GET /api/v1/ready`.
2. Conversations persist across browser refreshes in PostgreSQL.
3. RAG pipeline returns exact quotes with guest names, episode titles, and links.
4. Ship 30 for 30 skill creates ~1,250-word essays with strong hooks and formatted sections.
5. Artifact viewer renders Markdown and HTML inside a secure iframe beside the chat.
6. Evaluator can switch between local Ollama and cloud providers via config or frontend toggle.
7. Automated tests run cleanly with `pytest`.

### Known Constraints & Mitigations
- **RAM Constraint (8GB):** Ollama model must remain under 1GB (`qwen2.5:0.5b` or `smollm2:135m`).
- **Disk Constraint (13GB Free):** Ingestion prioritizes representative high-value episodes rather than downloading gigabytes of raw data.
- **Docker Absence:** Provide standard Docker Compose for containerized evaluators AND native scripts (`./run_local.sh`) for host-native execution.
