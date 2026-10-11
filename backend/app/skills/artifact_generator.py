import re
import logging
from typing import Dict, Any, Tuple, Optional
from backend.app.providers.base import BaseLLMProvider, LLMResponse

logger = logging.getLogger(__name__)

ARTIFACT_SYSTEM_PROMPT = """You are an expert full-stack UI engineer and technical writer.
When generating an HTML/CSS artifact:
- Create a complete, self-contained HTML document with embedded <style> tags.
- Use modern, clean aesthetics: responsive card layout, neutral dark-mode slate tones, clean typography, flexbox/grid.
- Never write malicious scripts, tracking pixels, or parent window access.
- Produce fully functional visual dashboards, metric trees, or growth loop diagrams.

When generating a Markdown artifact:
- Use clean Markdown with clear headings, tables, blockquotes, and code snippets.
"""

def sanitize_artifact_content(content: str, artifact_type: str) -> str:
    """
    Sanitize generated artifact content to uphold security boundaries:
    - Neutralize attempts to access window.parent, window.top, localStorage, cookies.
    """
    if artifact_type.lower() == "html":
        # Disallow access to parent window or cookies
        sanitized = re.sub(r"parent\.", "/*blocked*/.", content, flags=re.IGNORECASE)
        sanitized = re.sub(r"top\.", "/*blocked*/.", sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r"document\.cookie", "/*blocked_cookie*/", sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r"localStorage", "/*blocked_storage*/", sanitized, flags=re.IGNORECASE)
        sanitized = re.sub(r"sessionStorage", "/*blocked_storage*/", sanitized, flags=re.IGNORECASE)

        # Inject Content-Security-Policy meta tag to enforce defense-in-depth isolation
        csp_tag = '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\' https:; script-src \'unsafe-inline\'; font-src https: data:; img-src data: https:;">'
        if '<meta http-equiv="Content-Security-Policy"' not in sanitized:
            if "<head>" in sanitized.lower():
                sanitized = re.sub(r"(<head[^>]*>)", r"\1\n  " + csp_tag, sanitized, count=1, flags=re.IGNORECASE)
            elif "<html>" in sanitized.lower():
                sanitized = re.sub(r"(<html[^>]*>)", r"\1\n<head>\n  " + csp_tag + "\n</head>", sanitized, count=1, flags=re.IGNORECASE)
            else:
                sanitized = f"{csp_tag}\n{sanitized}"
        return sanitized
    return content

class ArtifactGeneratorSkill:
    """Skill to generate formatted Markdown and HTML/CSS visual artifacts."""

    async def generate_artifact(
        self,
        provider: BaseLLMProvider,
        prompt: str,
        artifact_type: str = "html",
        title: Optional[str] = None
    ) -> Tuple[str, str]:
        """
        Generates an artifact.
        Returns (title, sanitized_content).
        """
        req_type = "HTML" if artifact_type.lower() == "html" else "Markdown"
        user_prompt = f"""Generate a {req_type} artifact based on this request:
{prompt}

IMPORTANT REQUIREMENTS:
- If HTML: Return a complete, self-contained HTML document with embedded CSS. Do not include markdown code fences around it; return pure HTML or ```html block.
- If Markdown: Return a well-structured Markdown document.
"""

        response: LLMResponse = await provider.generate(
            messages=[{"role": "user", "content": user_prompt}],
            system_prompt=ARTIFACT_SYSTEM_PROMPT,
            temperature=0.3,
            max_tokens=4096
        )

        content = response.content.strip()

        # Clean code fence wrapping if present
        if content.startswith("```html"):
            content = content[7:]
        elif content.startswith("```markdown"):
            content = content[11:]
        elif content.startswith("```"):
            content = content[3:]

        if content.endswith("```"):
            content = content[:-3]

        content = content.strip()
        sanitized = sanitize_artifact_content(content, artifact_type)

        artifact_title = title or (
            prompt[:40] + "..." if len(prompt) > 40 else prompt
        )
        return artifact_title, sanitized

artifact_skill = ArtifactGeneratorSkill()
