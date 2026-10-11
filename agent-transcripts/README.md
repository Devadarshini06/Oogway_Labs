# Agent Execution Transcripts & Engineering Log
## The Lenny Growth Assistant

This directory contains execution records, diagnostic logs, and architectural decision transcripts generated during the development of **The Lenny Growth Assistant**.

---

## 1. Environment Discovery & Baseline Decisions

### Initial Inspection Log (Phase 1)
- **Host Platform:** macOS 27.0.1 (Apple M1)
- **Host RAM:** 8.0 GB RAM
- **Available Disk Space:** ~13 GiB available (94% disk capacity)
- **Runtimes:** Python 3.12.10, Node.js v24.12.0
- **Database:** PostgreSQL 15.18 installed and active via Homebrew (`postgresql@15`)
- **Docker:** Daemon not installed on local host machine.
- **Ollama:** Not initially installed.

### Decisions & Mitigations
1. **Ollama Model Selection:**  
   Given 8GB unified RAM and 13GB disk, standard 7B or 14B models would cause memory pressure or out-of-disk crashes. Selected `qwen2.5:0.5b` (~398MB download, ultra-fast latency) as the recommended local demonstration model.
2. **Database:**  
   Utilize the local Homebrew PostgreSQL 15 instance for real PostgreSQL persistence. Maintain Docker Compose files for portable evaluator testing on Docker-enabled hosts.
3. **Agent Integration:**  
   Implement a clean service boundary supporting the Anthropic Claude Agent SDK specifications and tool-calling pattern, with modular provider abstractions for Ollama, Anthropic, and OpenAI.
4. **Knowledge Ingestion:**  
   Cloned the official `ChatPRD/lennys-podcast-transcripts` repository (shallow `--depth 1`, ~8.5MB) containing all 269 episode transcripts in markdown with YAML frontmatter.

---

## 2. Iteration Log & Corrections

### Phase 2: Scaffolding & Dependencies
- **Action:** Created virtual environment `.venv` with Python 3.12.10.
- **Tooling:** Installed Ollama via Homebrew (`brew install ollama`). Verified version 0.40.2.
- **Model:** Pulled `qwen2.5:0.5b` (397 MB). Verified response via `curl http://localhost:11434/api/generate`.
- **Database:** Created database `lenny_assistant` in local PostgreSQL.

### Phase 3 & 4: RAG Pipeline & Ingestion
- **Embedder:** Integrated `sentence-transformers` with model `all-MiniLM-L6-v2` (384-dimensional dense vectors).
- **Ingestion Execution:** Ingested 10 representative episodes into `transcript_chunks` table, creating 158 chunks with timestamps and metadata.
- **Retrieval Test:** Tested semantic retrieval on `"How do you improve user retention?"`—verified top scores correctly returned Brian Balfour (0.42), Elena Verna (0.41), and Rahul Vohra (0.40) with exact timestamps.

### Phase 5 & 6: Frontend & Ship 30 for 30 Skill
- **Frontend Scaffolding:** Initialized Vite with React 19 and TypeScript. Installed Tailwind CSS, Lucide icons, React-Markdown, and Rehype-Sanitize.
- **Compiler Correction:** Encountered TypeScript errors for `verbatimModuleSyntax: true` and `noUnusedLocals: true`. Fixed by converting model/schema imports to `import type` and cleaning up unused Lucide icon imports.
- **Build Verification:** Verified `npm run build` completed cleanly in 531ms with 0 errors.

### Phase 7 & 8: Testing & Loop Isolation Corrections
- **Pytest Loop Issue:** Initial test run failed with `RuntimeError: Task ... got Future attached to a different loop` due to pytest-asyncio event loop recreation across async fixtures.
- **Correction:** Replaced default pooling with `poolclass=NullPool` and per-test session factories in `conftest.py`.
- **Schema Collision Issue:** `SessionModel` defined a column named `metadata`, which collided with SQLAlchemy's built-in `Base.metadata: MetaData()` property.
- **Correction:** Renamed column to `custom_metadata` with Pydantic `validation_alias="custom_metadata"`.
- **Final Test Run:** All 17 automated tests passed in 12.66s (100% pass rate).

---

## 3. Final Verification Matrix

| Test Suite | Tests Run | Result | Notes |
|---|---|---|---|
| `test_health.py` | 2 | **PASSED** | Liveness & Readiness endpoints return 200 OK |
| `test_sessions.py` | 2 | **PASSED** | Multi-session lifecycle and context isolation verified |
| `test_providers.py` | 4 | **PASSED** | Ollama routing, missing API key hints, 503 response |
| `test_rag.py` | 3 | **PASSED** | Real transcript parsing, citations, and unsupported queries |
| `test_ship30.py` | 3 | **PASSED** | Criteria validation, empty evidence honesty, execution |
| `test_artifacts.py` | 3 | **PASSED** | Security sanitization, REST API lifecycle, 404s |
| **Total** | **17** | **100% PASSED** | Zero regressions |
