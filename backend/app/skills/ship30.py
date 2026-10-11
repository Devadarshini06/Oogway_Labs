import logging
import re
from typing import List, Dict, Any, Optional, Tuple
from backend.app.providers.base import BaseLLMProvider, LLMResponse

logger = logging.getLogger(__name__)

SHIP_30_SYSTEM_PROMPT = """You are a master digital writer and executive ghostwriter trained in the Ship 30 for 30 methodology (by Dickie Bush & Nicolas Cole) and an expert on Lenny's Podcast.

Your task is to write a comprehensive, high-retention long-form essay of approximately 1,250 words (target: 1,100 to 1,400 words) based STRICTLY on the provided podcast transcript excerpts.

FOLLOW THESE SHIP 30 FOR 30 PRINCIPLES TO THE LETTER:
1. THE HOOK: Open with a provocative, high-contrast 1-sentence statement that challenges conventional wisdom. Never open with "In today's fast-paced world" or generic pleasantries.
2. THE LEAD-IN: 2-3 short punchy sentences identifying the real pain founders and product leaders face.
3. RHYTHM & PACING: Write for skimmability.
   - Use short paragraphs (1-3 sentences maximum).
   - Use bold emphasis selectively on key principles.
   - Use numbered frameworks and bulleted lists.
4. NARRATIVE PROGRESSION: Structure the body into 3 to 4 distinct thematic pillars using clear H2 and H3 markdown headings.
5. STRICT TRANSCRIPT ATTRIBUTION:
   - Cite the exact guests (e.g. Elena Verna, Casey Winters, Brian Balfour) and their real frameworks.
   - Do NOT invent case studies, statistics, or quotes not present in the evidence.
6. TACTICAL TAKEAWAY: Conclude with a concrete, actionable implementation checklist that a founder or PM can execute on Monday morning.
7. TARGET WORD COUNT: Approximately 1,250 words of rich, substantive, tactical prose.
"""

class Ship30EssaySkill:
    """Dedicated skill for generating Ship 30 for 30 style long-form essays grounded in podcast transcripts."""

    def build_prompt(self, topic: str, evidence_chunks: List[Dict[str, Any]]) -> str:
        evidence_text = ""
        for i, chunk in enumerate(evidence_chunks, 1):
            guest = chunk.get("guest", "Operator")
            title = chunk.get("episode_title", "Lenny's Podcast")
            ts = chunk.get("timestamp_str", "")
            content = chunk.get("content", "").strip()
            evidence_text += f"\n--- EVIDENCE EXCERPT {i} [{guest} - {title} {ts}] ---\n{content}\n"

        prompt = f"""TOPIC: {topic}

RETRIEVED TRANSCRIPT EVIDENCE:
{evidence_text if evidence_text else "(No transcripts retrieved. Acknowledge that verified transcript evidence is unavailable.)"}

INSTRUCTIONS:
Write a full Ship 30 for 30 style essay of approximately 1,250 words explaining "{topic}" using the evidence above.
Include a compelling Hook, Lead-in, 3-4 structured Framework pillars, specific Guest citations, and a Tactical Takeaways checklist.
"""
        return prompt

    def validate_essay(self, content: str) -> Dict[str, Any]:
        """Validate output against Ship 30 for 30 criteria."""
        words = re.findall(r"\b\w+\b", content)
        word_count = len(words)
        has_headings = bool(re.search(r"^##\s+", content, re.MULTILINE))
        has_bullets = bool(re.search(r"^\s*[-*]\s+", content, re.MULTILINE))
        has_bold = bool(re.search(r"\*\*[^*]+\*\*", content))
        has_takeaway = "takeaway" in content.lower() or "checklist" in content.lower() or "action" in content.lower()

        is_valid_length = word_count >= 800  # Reasonable floor for local and cloud models

        return {
            "word_count": word_count,
            "is_valid_length": is_valid_length,
            "has_headings": has_headings,
            "has_bullets": has_bullets,
            "has_bold": has_bold,
            "has_takeaway": has_takeaway,
            "quality_score": sum([
                1 if is_valid_length else 0.5,
                1 if has_headings else 0,
                1 if has_bullets else 0,
                1 if has_bold else 0,
                1 if has_takeaway else 0
            ]) / 5.0
        }

    async def execute(
        self,
        provider: BaseLLMProvider,
        topic: str,
        evidence_chunks: List[Dict[str, Any]]
    ) -> Tuple[str, Dict[str, Any]]:
        """Generate and validate the Ship 30 for 30 essay."""
        if not evidence_chunks:
            msg = (
                f"# Insufficient Evidence for Essay\n\n"
                f"We could not find verified transcripts in Lenny's Podcast archive covering **{topic}**.\n\n"
                f"In accordance with our grounding principles, The Lenny Growth Assistant does not fabricate essays without source evidence. "
                f"Try asking about topics like **Retention**, **Product-Market Fit**, **Product-Led Growth**, or **Growth Tactics**."
            )
            return msg, {"word_count": len(msg.split()), "is_valid_length": False}

        prompt = self.build_prompt(topic, evidence_chunks)
        messages = [{"role": "user", "content": prompt}]

        response: LLMResponse = await provider.generate(
            messages=messages,
            system_prompt=SHIP_30_SYSTEM_PROMPT,
            temperature=0.4,
            max_tokens=4096
        )

        validation = self.validate_essay(response.content)
        return response.content, validation

ship30_skill = Ship30EssaySkill()
