# Comprehensive Test Plan
## The Lenny Growth Assistant

**Author:** Forward Deployed Engineer  
**Date:** October 11, 2026  
**Version:** 1.0.0  

---

## 1. Overview & Strategy

This test plan ensures that all core functionalities of **The Lenny Growth Assistant** operate deterministically, resist regressions, and handle failure states gracefully.

The test strategy combines:
1. **Automated Unit & Integration Tests (`pytest` + `httpx`):** Fast, mocked, and reproducible tests verifying API contracts, database persistence, session isolation, retrieval accuracy, and artifact security without requiring live paid API credits.
2. **Provider Integration Tests:** Isolated live-check suites for local Ollama and Cloud APIs.
3. **Manual UI Acceptance Suite:** Step-by-step verification of user workflows in the browser.

---

## 2. Automated Test Matrix

| Test Suite | File | Coverage Areas |
|---|---|---|
| **Health & Readiness** | `backend/tests/test_health.py` | `GET /api/v1/health`, `GET /api/v1/ready` when DB/Ollama is up or down |
| **Sessions & Messages** | `backend/tests/test_sessions.py` | Session creation, listing, persistence, message storage, multi-session context isolation |
| **Provider Routing** | `backend/tests/test_providers.py` | Dynamic provider switching (Ollama, Anthropic, OpenAI), missing API key handling, provider timeout simulation |
| **RAG & Attribution** | `backend/tests/test_rag.py` | Ingestion parsing, text chunking, semantic retrieval, exact citation extraction, unsupported query honesty |
| **Ship 30 for 30 Skill** | `backend/tests/test_ship30.py` | Prompt composition, ~1,250-word length validation, hook structure, takeaway formatting |
| **Artifact Security** | `backend/tests/test_artifacts.py` | Artifact creation, sanitization, HTML payload security boundaries |

---

## 3. Detailed Automated Test Specifications

### 3.1 Health & Readiness (`test_health.py`)
- **TH-01:** `GET /api/v1/health` returns `200 OK` with JSON `{ "status": "ok", "version": "1.0.0" }`.
- **TH-02:** `GET /api/v1/ready` checks database connectivity and active model provider, returning `200 OK` when ready, or `503 Service Unavailable` with diagnostic message if DB is disconnected.

### 3.2 Sessions & Isolation (`test_sessions.py`)
- **TS-01:** `POST /api/v1/sessions` creates a session with unique UUID and returns `201 Created`.
- **TS-02:** `GET /api/v1/sessions` lists existing sessions sorted by `updated_at` descending.
- **TS-03:** `POST /api/v1/chat` in Session A records messages only in Session A; Session B cannot see Session A's messages.
- **TS-04:** Sending an invalid session ID returns `404 Not Found`.
- **TS-05:** Sending an empty prompt returns `422 Unprocessable Entity`.

### 3.3 Provider Routing & Error Handling (`test_providers.py`)
- **TP-01:** When `LLM_PROVIDER=ollama`, routing selects `OllamaProvider`.
- **TP-02:** When Ollama connection fails (connection refused), backend returns structured JSON error explaining that Ollama is unreachable, without leaking internal tracebacks.
- **TP-03:** When `LLM_PROVIDER=anthropic` but `ANTHROPIC_API_KEY` is empty, system returns structured error advising user to configure key or switch to Ollama.
- **TP-04:** Evaluator can dynamically pass `provider: "ollama"` in the chat request payload to override system default without code changes.

### 3.4 RAG Retrieval & Source Attribution (`test_rag.py`)
- **TR-01:** Querying *"retention"* returns chunks with valid metadata (`episode_title`, `guest`, `youtube_url`).
- **TR-02:** When query has no matching concepts (e.g. quantum physics equations), RAG returns empty chunks and assistant explicitly states the topic is not covered in Lenny's podcast.
- **TR-03:** Retrieved chunk quotes are accurately attributed without hallucinations.

### 3.5 Ship 30 for 30 Skill (`test_ship30.py`)
- **TE-01:** Prompt containing *"Turn into a Ship 30 for 30 essay"* triggers the essay generator.
- **TE-02:** Output validates against Ship 30 criteria: strong opening hook, scannable subheadings, bullet points, tactical takeaway, and word count target (~1,250 words).

### 3.6 Artifact Creation & Security (`test_artifacts.py`)
- **TA-01:** `POST /api/v1/artifacts` stores markdown and html artifacts linked to a session.
- **TA-02:** Malicious script injection (`<script>alert(1)</script>`) in Markdown is sanitized.
- **TA-03:** HTML artifacts are tagged with sandboxed iframe headers (`sandbox="allow-scripts"` without same-origin privileges).

---

## 4. Manual UI Acceptance Test Plan

| Step | User Action | Expected Result |
|---|---|---|
| **1. Initial Load** | Open `http://localhost:5173` | UI loads cleanly in dark mode. Sidebar shows "New Chat" and provider status. Empty state displays 5 suggested prompt cards. |
| **2. Provider Switch** | Select model from header dropdown | Active model badge updates smoothly (e.g. switches from Ollama to Anthropic). |
| **3. Grounded Chat** | Click *"How can a startup improve user retention?"* | Assistant streams response citing Lenny's guests (e.g. Casey Winters, Elena Verna) with clickable YouTube source pills. |
| **4. Citation Inspection** | Click a source citation pill | Transcript metadata modal/popover opens with episode title, guest name, and timestamp. |
| **5. Ship 30 Essay** | Click *"Turn podcast insights into a Ship 30 for 30 essay"* | Long-form essay (~1,250 words) generates with hook, bold rhythm, bullets, and takeaway. Artifact Viewer auto-opens. |
| **6. Artifact Viewer** | Toggle between "Preview" and "Source" | Preview displays rendered iframe. Source displays raw code with copy button. |
| **7. Multi-Session** | Click "+ New Chat", send a new question, then click previous session in sidebar | Previous session restores exact message history and citations from PostgreSQL. |
| **8. Offline Ollama** | Stop Ollama and send message with Ollama selected | Clean banner informs user: *"Cannot connect to Ollama. Ensure daemon is running or switch to cloud."* No UI crash. |
