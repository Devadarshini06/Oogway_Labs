# 2–3 Minute Video Demonstration Script
## The Lenny Growth Assistant

**Speaker:** Forward Deployed Engineer  
**Camera:** Enabled (Presenter in bottom corner or intro/outro)  
**Target Duration:** 2 minutes 45 seconds  

---

### [0:00 – 0:30] 1. The Problem & Target User

*(Camera on presenter)*

"Hi everyone. As a product and growth leader or early-stage founder, making high-stakes strategy decisions on retention, product-market fit, or pricing is hard. *Lenny's Podcast* is the definitive archive of tactical operator advice—with over 260 interviews featuring operators like Elena Verna, Casey Winters, and Brian Balfour. 

However, searching 300+ hours of video is nearly impossible, and generic chatbots hallucinate frameworks and cite fake statistics.

Today, I'm presenting **The Lenny Growth Assistant**—a production-grade, full-stack conversational application built to deliver verifiable, transcript-grounded answers, long-form Ship 30 for 30 essays, and native sandboxed UI artifacts."

---

### [0:30 – 1:15] 2. Transcript-Grounded Answering & Source Verification

*(Screen share: Web UI at http://localhost:5173 in dark mode)*

"Notice our calm, understated interface. The sidebar tracks our conversation sessions persisted in PostgreSQL. In the top right, our model provider badge confirms we are running **100% locally via Ollama with `qwen2.5:0.5b`**.

Let's click one of our suggested questions:
> *'How can a startup improve user retention?'*

Behind the scenes, our FastAPI backend converts this query into a semantic vector, queries our PostgreSQL transcript knowledge base, and retrieves the most relevant chunks with cosine similarity.

Look at the answer:
- It directly quotes **Elena Verna** on why growth teams can't fix retention if product-market fit isn't solved organically.
- It quotes **Casey Winters** on activation and habit loops.
- Notice the **Grounded Transcript Sources** pills below the answer. If I click 'Elena Verna [01:12:00]', an attribution modal opens showing the exact verbatim quote and a direct link to the timestamped YouTube episode."

---

### [1:15 – 1:55] 3. Ship 30 for 30 Long-Form Essay & Artifact Generation

*(Screen share: Clicking 'Generate Ship 30 Essay' or prompt)*

"Now, let's look at content synthesis. Growth leaders need to communicate frameworks to their teams. We encoded the official **Ship 30 for 30 writing methodology** into a dedicated backend skill.

Let's ask:
> *'Turn relevant podcast insights into a long-form essay on Product-Led Growth.'*

The skill executes:
1. It validates evidence grounding.
2. It generates an essay structured with a provocative opening Hook, an empathetic Lead-in, 3-4 thematic framework pillars, bold rhythm, and a tactical Monday-morning checklist.

Notice how the **Artifact Viewer** slides out seamlessly on the right!
It displays our rendered essay with Markdown formatting. If I switch to **'Source'**, I can inspect or copy the raw code with one click."

---

### [1:55 – 2:25] 4. Interactive HTML Artifact & Security Isolation

*(Screen share: Requesting 'Create an HTML dashboard explaining the user retention loop')*

"Now let's test artifact generation with code. I'll request:
> *'Create an HTML dashboard explaining the user retention loop.'*

The assistant generates a complete, responsive HTML/CSS dashboard. The Artifact Viewer renders it natively.

**Here is a critical engineering decision:**
Model-generated HTML is inherently untrusted. If rendered in the main DOM, a malicious payload could steal session tokens or cookies. 
We enforce a strict security boundary:
- The preview renders inside a sandboxed `<iframe>` with `sandbox="allow-scripts"`.
- It executes in an isolated **null origin** with **NO** `allow-same-origin` and **NO** `allow-top-navigation`.
- It cannot access `window.parent`, cookies, or localStorage.
- Furthermore, our backend sanitizes all artifact payloads to strip storage access attempts before storage."

---

### [2:25 – 2:45] 5. Key Engineering Trade-Off & Closing

*(Camera on presenter)*

"Finally, our biggest engineering trade-off: **Local Inference Latency vs. Model Footprint**.

Running on an 8GB Apple M1 machine, a 7B model causes heavy swap thrashing and latency spikes. We selected `qwen2.5:0.5b` (~398MB) alongside local `sentence-transformers` embeddings. This gave us sub-second vector search, near-instant local generation, and zero cloud API dependency for the demo—while preserving clean, configuration-based switching to Anthropic Claude 3.5 Sonnet or GPT-4o with a single click.

Thank you—The Lenny Growth Assistant is fully tested, open-source ready, and ready for deployment."
