from typing import Dict, Any, List

TOOL_SCHEMAS: List[Dict[str, Any]] = [
    {
        "name": "retrieve_podcast_knowledge",
        "description": "Searches Lenny's Podcast transcripts for tactical product management and growth advice, operator case studies, and frameworks.",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "Search query focusing on product, growth, retention, PLG, PMF, etc."
                },
                "top_k": {
                    "type": "integer",
                    "description": "Number of transcript chunks to retrieve (default 5)",
                    "default": 5
                }
            },
            "required": ["query"]
        }
    },
    {
        "name": "generate_ship30_essay",
        "description": "Transforms retrieved podcast insights into a structured Ship 30 for 30 style long-form essay (~1,250 words) with hook, subheadings, bullets, and tactical takeaways.",
        "input_schema": {
            "type": "object",
            "properties": {
                "topic": {
                    "type": "string",
                    "description": "Core theme or problem statement for the essay."
                }
            },
            "required": ["topic"]
        }
    },
    {
        "name": "generate_artifact",
        "description": "Generates a standalone, sandboxed Markdown document or HTML/CSS visual dashboard/framework diagram.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Descriptive title for the artifact."
                },
                "artifact_type": {
                    "type": "string",
                    "enum": ["html", "markdown"],
                    "description": "Type of artifact to generate."
                },
                "prompt": {
                    "type": "string",
                    "description": "Detailed prompt describing the visual component or document."
                }
            },
            "required": ["title", "artifact_type", "prompt"]
        }
    }
]
