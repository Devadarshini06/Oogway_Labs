import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.rag.retriever import retriever
from backend.app.skills.ship30 import ship30_skill
from backend.app.skills.artifact_generator import artifact_skill
from backend.app.providers.base import BaseLLMProvider
from backend.app.agent.tools import TOOL_SCHEMAS

logger = logging.getLogger(__name__)

class ClaudeAgentBridge:
    """
    Bridge implementing the Claude Agent SDK tool-calling execution patterns.
    Orchestrates tool dispatch for podcast retrieval, Ship 30 essays, and visual artifacts.
    """

    def __init__(self):
        self.tool_definitions = TOOL_SCHEMAS

    async def execute_tool(
        self,
        tool_name: str,
        tool_input: Dict[str, Any],
        db: AsyncSession,
        provider: BaseLLMProvider
    ) -> Dict[str, Any]:
        """Dispatch tool invocation according to Claude Agent SDK specification."""
        logger.info(f"Agent executing tool: {tool_name} with params: {tool_input}")

        if tool_name == "retrieve_podcast_knowledge":
            query = tool_input.get("query", "")
            top_k = tool_input.get("top_k", 5)
            chunks = await retriever.retrieve(db=db, query=query, top_k=top_k)
            return {
                "success": True,
                "chunks_found": len(chunks),
                "chunks": chunks
            }

        elif tool_name == "generate_ship30_essay":
            topic = tool_input.get("topic", "")
            chunks = await retriever.retrieve(db=db, query=topic, top_k=6)
            essay, validation = await ship30_skill.execute(
                provider=provider,
                topic=topic,
                evidence_chunks=chunks
            )
            return {
                "success": True,
                "essay": essay,
                "validation": validation,
                "citations": retriever.format_citations(chunks)
            }

        elif tool_name == "generate_artifact":
            title = tool_input.get("title", "Generated Artifact")
            artifact_type = tool_input.get("artifact_type", "html")
            prompt = tool_input.get("prompt", "")
            title, content = await artifact_skill.generate_artifact(
                provider=provider,
                prompt=prompt,
                artifact_type=artifact_type,
                title=title
            )
            return {
                "success": True,
                "title": title,
                "artifact_type": artifact_type,
                "content": content
            }

        else:
            return {
                "success": False,
                "error": f"Unknown tool '{tool_name}'."
            }

claude_agent_bridge = ClaudeAgentBridge()
