import re
import yaml
from pathlib import Path
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

TIMESTAMP_PATTERN = re.compile(r"\((\d{2}:\d{2}:\d{2})\)")

def parse_transcript_file(file_path: Path) -> Optional[Dict[str, Any]]:
    """Parse a Lenny transcript markdown file into metadata and body."""
    try:
        content = file_path.read_text(encoding="utf-8")
        if not content.startswith("---"):
            return None

        parts = content.split("---", 2)
        if len(parts) < 3:
            return None

        raw_yaml = parts[1]
        body = parts[2]

        metadata = yaml.safe_load(raw_yaml) or {}
        return {
            "metadata": metadata,
            "body": body.strip()
        }
    except Exception as e:
        logger.error(f"Failed to parse {file_path}: {e}")
        return None

def chunk_transcript(
    parsed: Dict[str, Any],
    episode_slug: str,
    chunk_size: int = 1500,
    chunk_overlap: int = 250
) -> List[Dict[str, Any]]:
    """Split transcript body into overlapping chunks while preserving timestamp context."""
    metadata = parsed["metadata"]
    body = parsed["body"]

    # Filter out sponsor ad breaks where possible
    lines = body.split("\n")
    cleaned_lines = []
    skip_sponsor = False
    for line in lines:
        if "brought to you by" in line.lower() or "sponsor" in line.lower():
            skip_sponsor = True
            continue
        if skip_sponsor and line.strip().startswith("Lenny Rachitsky ("):
            skip_sponsor = False
        if not skip_sponsor:
            cleaned_lines.append(line)

    cleaned_text = "\n".join(cleaned_lines)

    # Paragraph-based chunking
    paragraphs = cleaned_text.split("\n\n")
    chunks: List[Dict[str, Any]] = []
    current_chunk = []
    current_length = 0
    current_timestamp = None

    guest = metadata.get("guest", "Lenny's Guest")
    title = metadata.get("title", episode_slug.replace("-", " ").title())
    youtube_url = metadata.get("youtube_url")

    for p in paragraphs:
        p_str = p.strip()
        if not p_str:
            continue

        # Look for timestamp in paragraph
        ts_match = TIMESTAMP_PATTERN.search(p_str)
        if ts_match:
            current_timestamp = f"[{ts_match.group(1)}]"

        current_chunk.append(p_str)
        current_length += len(p_str)

        if current_length >= chunk_size:
            chunk_content = "\n\n".join(current_chunk)
            chunks.append({
                "episode_slug": episode_slug,
                "episode_title": title,
                "guest": guest,
                "youtube_url": youtube_url,
                "timestamp_str": current_timestamp,
                "content": chunk_content
            })
            # Overlap: keep the last paragraph
            if len(current_chunk) > 1 and len(current_chunk[-1]) < chunk_overlap:
                current_chunk = [current_chunk[-1]]
                current_length = len(current_chunk[-1])
            else:
                current_chunk = []
                current_length = 0

    if current_chunk:
        chunk_content = "\n\n".join(current_chunk)
        chunks.append({
            "episode_slug": episode_slug,
            "episode_title": title,
            "guest": guest,
            "youtube_url": youtube_url,
            "timestamp_str": current_timestamp,
            "content": chunk_content
        })

    return chunks
