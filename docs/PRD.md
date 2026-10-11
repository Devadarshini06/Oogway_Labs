# Product Requirements Document (PRD)
## The Lenny Growth Assistant

**Status:** Approved for Implementation  
**Author:** Forward Deployed Engineer  
**Date:** October 11, 2026  
**Version:** 1.0.0  

---

## 1. Executive Brief & Problem Framing

### 1.1 Target Persona
- **Primary Users:** Early-stage Founders, Heads of Growth, VP of Product, and Growth Product Managers.
- **Secondary Users:** Technical Evaluators, Investors, and Content Marketers.

### 1.2 User Jobs to Be Done (JTBD)
1. **Strategic Discovery:** *"When I am planning a new product-led growth motion or retention loop, I want to query the exact battle-tested frameworks used by top operators on Lenny's Podcast, so that I avoid costly trial-and-error."*
2. **Executive Synthesis:** *"When I need to align my team around a strategic decision, I want to convert podcast insights into a structured Ship 30 for 30 long-form essay (~1,250 words), so that I can communicate clearly and persuasively."*
3. **Framework Visualization:** *"When I need to present a metric tree or onboarding funnel, I want interactive HTML dashboards or Markdown artifacts generated on the fly beside my conversation."*

### 1.3 Core Pain Points
- Generic LLMs hallucinate growth statistics, fabricate fake founders, and provide bland, non-actionable advice.
- Audio and raw video transcripts are locked in 1.5-hour long interviews without semantic search or cross-episode synthesis.
- Switching between AI chat tools, note-taking apps, and code previewers fractures workflow and wastes time.

---

## 2. Measurable Success Metrics

| Metric | Target | Verification Method |
|---|---|---|
| **Retrieval Attribution Rate** | 100% of grounded claims cite episode title, guest name, and URL | Automated RAG test suite |
| **Hallucination Rate on Unindexed Topics** | 0% fabricated claims; explicit admission when data is absent | Querying non-podcast topics |
| **Essay Quality & Word Count** | 1,100 – 1,400 words adhering to Ship 30 for 30 principles | Automated word-count test |
| **Artifact Render Latency & Security** | < 500ms render in sandboxed iframe with 0 cross-origin leak | DOM security test |
| **Local Inference Feasibility** | Runs locally on 8GB Apple M1 host using Ollama | Live local inference test |

---

## 3. Assumptions & Scope Choices

### 3.1 Assumptions
1. **Local Demo Priority:** Evaluators require an end-to-end working demo without mandatory paid API keys. Ollama local inference (`qwen2.5:0.5b`) is therefore supported as a zero-cost, out-of-the-box runtime.
2. **Data Availability:** Evaluators accept a representative, high-signal subset of Lenny's Podcast transcripts (curated from `ChatPRD/lennys-podcast-transcripts`) for immediate local indexing, with the architecture built to scale to all 269+ episodes.
3. **Single-Tenant Enterprise Context:** Multi-tenancy with complex OAuth2/SSO is out of scope for the initial deployment; session-isolated PostgreSQL persistence satisfies privacy and session management requirements.

### 3.2 Included Scope
- Fast, typed FastAPI backend with versioned `/api/v1` endpoints.
- PostgreSQL database persistence for chat sessions, messages, and generated artifacts.
- Multi-provider model layer: Local Ollama + Cloud (Anthropic Claude / OpenAI).
- Real-time provider switcher visible in the frontend header.
- Semantic & keyword retrieval engine with source citations (guest, title, YouTube link).
- Dedicated Ship 30 for 30 essay generation skill.
- Native sandboxed Artifact Viewer for Markdown and HTML/CSS snippets beside the chat.
- Structured logging, comprehensive Pytest suite, and Docker Compose configuration.

### 3.3 Explicitly Excluded Scope
- Full user registration/billing/OAuth system (MVP focuses on session-isolated persistence).
- Arbitrary server-side code execution (Python sandbox) for security containment.
- Heavyweight multi-gigabyte models that crash 8GB RAM host environments.

---

## 4. Main User Flows

### Flow 1: Grounded Growth Questioning
1. User lands on web application; system displays greeting and active model indicator (e.g., `Ollama (qwen2.5:0.5b)` or `Anthropic (Claude 3.5 Sonnet)`).
2. User selects a suggested prompt (e.g., *"How can a startup improve user retention?"*) or enters a custom query.
3. Assistant executes RAG query against PostgreSQL transcript embeddings/chunks.
4. Assistant generates a response with direct quotes and clickable source pills linking to the YouTube episodes and timestamps.

### Flow 2: Ship 30 for 30 Essay Generation
1. User requests: *"Turn relevant podcast insights into a long-form essay on product-market fit."*
2. Assistant activates the `Ship30Skill`, retrieving core insights and generating a ~1,250-word essay with a compelling hook, rhythm formatting, bulleted frameworks, and tactical takeaways.
3. Assistant automatically emits an Artifact event.

### Flow 3: Artifact Generation & Sandboxed Inspection
1. User requests: *"Create an HTML dashboard explaining the viral growth loop."*
2. Assistant produces an HTML/CSS artifact.
3. The Artifact Viewer slides open beside the chat:
   - Preview Tab: Renders the dashboard in a secure, sandboxed `<iframe>`.
   - Source Tab: Displays syntax-highlighted code with a "Copy to Clipboard" button.

---

## 5. Risks & Mitigation Matrix

| Risk | Impact | Likelihood | Mitigation Strategy |
|---|---|---|---|
| **Local Model Hallucination** | High | Medium | Strict system prompts instructing model to rely strictly on `<retrieved_transcripts>` and explicitly state if information is missing. |
| **Memory Pressure on 8GB Host** | High | High | Restrict local Ollama model to lightweight `< 1GB` weights (`qwen2.5:0.5b` ~398MB); use efficient in-process sentence embeddings. |
| **XSS via Model-Generated HTML** | Critical | Low | Restrictive `<iframe>` sandbox (`sandbox="allow-scripts"`, NO `allow-same-origin`, NO top navigation, isolated origin). |
| **Missing API Keys** | Medium | High | Backend verifies API key validity on startup and returns structured, human-friendly error messages guiding user to set `.env` or use Ollama. |

---

## 6. Acceptance Criteria

- [x] Backend responds to `GET /api/v1/health` and `GET /api/v1/ready`.
- [x] All sessions and messages persist across browser reloads in PostgreSQL.
- [x] RAG responses include genuine source metadata (guest, title, URL).
- [x] Ship 30 for 30 essays meet word-count and formatting structure.
- [x] Sandboxed artifact viewer displays HTML without giving it access to application tokens.
- [x] Automated test suite validates endpoints, persistence, and safety.
