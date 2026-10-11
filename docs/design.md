# Design Document
## The Lenny Growth Assistant

**Author:** Forward Deployed Engineer & Product Designer  
**Date:** October 11, 2026  
**Version:** 1.0.0  

---

## 1. Visual Principles & Design Philosophy

The Lenny Growth Assistant is designed as a calm, high-utility knowledge workstation for executive and product decision-makers. It deliberately rejects noisy, low-contrast "AI toy" aesthetics (such as psychedelic mesh gradients and floating sparkles) in favor of crisp typography, disciplined spacing, and clear information hierarchy.

### Core Visual Guidelines:
1. **Neutral Base Palette:**
   - Backgrounds: Neutral slate/zinc grays (`#09090b` dark background, `#18181b` card surface, `#27272a` borders in dark mode; `#ffffff` and `#f4f4f5` in light mode).
   - Text: High contrast `#f4f4f5` primary text, `#a1a1aa` secondary descriptive text.
2. **Restrained Accent Color:**
   - Electric Amber/Indigo (`#6366f1` / `#4f46e5`) used sparingly for active states, primary buttons, and verified citation tags.
3. **Typography:**
   - Inter / system UI font stack with strict optical scaling.
   - Generous line heights (`leading-relaxed`) for long-form answers and essays.
4. **Subtle Micro-Interactions:**
   - Smooth slide-in for the Artifact Viewer panel.
   - Shimmer pulse for LLM generation loading states.
   - Interactive source citation cards with preview metadata on hover.

---

## 2. Information Architecture & Layout

### 2.1 Three-Column Responsive Grid
- **Left Navigation Drawer (260px desktop, slide-over mobile):**
  - Application Identity & Logo (Lenny Growth Assistant)
  - "New Chat" primary action button
  - Model Provider selector badge (Ollama / Anthropic / OpenAI)
  - Chronological session list (grouped by "Today", "Previous 7 Days", "Older")
  - System status & database readiness badge
- **Center Chat Canvas (Flexible width, max 820px readability container):**
  - Header: Active session title, model toggle dropdown, Artifacts toggle button
  - Message Thread:
    - User message bubbles: Compact, right-aligned or subtle border container
    - Assistant responses: Full-width, typography-focused, markdown formatted
    - Grounding Citation Drawer: Interactive pill tags showing guest name, episode title, and clickable YouTube link
  - Composer: Multi-line text input with submit button, keyboard shortcuts (`Cmd+Enter` or `Enter`), and quick suggestion pills
- **Right Artifact Viewer Drawer (450px - 600px desktop, modal on mobile):**
  - Top Bar: Artifact Title, format badge (`HTML` / `Markdown`), "Copy Source", and "Close" button
  - View Switcher: "Rendered Preview" vs "Raw Source" tabs
  - Preview Container: Sandboxed iframe with strict permissions
  - Source Container: Monospace code block with line numbering

---

## 3. Key Interaction States

### 3.1 Empty / Welcome State
When a new session starts:
- Warm, professional greeting: *"Welcome to The Lenny Growth Assistant. What growth or product challenge can we solve today?"*
- Curated prompt chips:
  - *"How can an early-stage startup improve user retention?"*
  - *"What makes a product-led growth strategy effective?"*
  - *"What can founders learn about product-market fit?"*
  - *"Turn podcast insights on pricing into a Ship 30 for 30 essay."*
  - *"Create an HTML dashboard explaining the viral loop framework."*

### 3.2 Loading & Streaming State
- A pulsating indicator with an active status label (e.g., *"Retrieving episode transcripts...", "Synthesizing insights...", "Formatting Ship 30 for 30 essay..."*).
- Disables composer input during active generation to prevent race conditions.

### 3.3 Error & Graceful Degradation State
- Clear, empathetic banner alerts:
  - If Ollama is offline: *"Cannot connect to local Ollama daemon at http://localhost:11434. Please ensure Ollama is running (`ollama serve`) or switch to a cloud provider in settings."*
  - If question is out of scope: *"Lenny's indexed podcast archive does not contain sufficient verified discussion on this topic. Rather than speculating, I recommend checking..."*

---

## 4. Accessibility & Responsiveness

1. **Keyboard Navigation:** Full focus ring visibility, `Tab` cycling through interactive elements, `Escape` key closes the Artifact Viewer.
2. **Contrast Ratios:** All text elements exceed WCAG AA 4.5:1 contrast standards.
3. **Screen Readers:** ARIA labels on all icon-only buttons (`aria-label="Copy code"`, `aria-label="Close artifact viewer"`).
4. **Mobile Optimization:** On mobile viewports (< 768px), sidebar and artifact viewer become full-width bottom sheets or slide-over overlays with touch gestures.
