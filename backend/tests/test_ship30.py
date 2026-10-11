import pytest
from backend.app.skills.ship30 import ship30_skill
from backend.app.providers.base import BaseLLMProvider, LLMResponse

class MockProvider(BaseLLMProvider):
    def get_provider_name(self) -> str:
        return "mock"
    def get_model_name(self) -> str:
        return "mock-model"
    async def is_available(self) -> bool:
        return True
    async def generate(self, messages, system_prompt=None, temperature=0.3, max_tokens=4096):
        # Return structured mock essay
        body = (
            "# The Great Retention Lie\n\n"
            "Most startups obsess over acquisition. They pour millions into top-of-funnel ads, celebrating "
            "vanity signup numbers while their user base quietly evaporates through a leaky bucket.\n\n"
            "Elena Verna calls this the ultimate startup trap. If your product doesn't retain organically, "
            "acquisition only accelerates your demise.\n\n"
            "## 1. The Core Retention Loop\n\n"
            "As Elena Verna noted on Lenny's Podcast, **growth is not an outsourced function**. "
            "Retention is built on three core pillars:\n\n"
            "- **Activation speed**: Time to core value.\n"
            "- **Habit formation**: Frequency of repeated interaction.\n"
            "- **Value reinvestment**: Features that get better the more you use them.\n\n"
            "## 2. Monday Morning Tactical Checklist\n\n"
            "Here is your implementation takeaway:\n\n"
            "1. Audit your 30-day cohort retention curves.\n"
            "2. Identify your single most predictive activation event.\n"
            "3. Eliminate mandatory onboarding friction."
        )
        # Pad to simulate word count
        padded = body + ("\n\nThis principle applies across all modern SaaS companies." * 60)
        return LLMResponse(content=padded, provider="mock", model_name="mock-model")

@pytest.mark.asyncio
async def test_ship30_validation():
    """Verify Ship 30 for 30 essay validation criteria."""
    sample_text = (
        "## Why Growth Hacks Fail\n\n"
        "Elena Verna proves that growth is about systems.\n\n"
        "- **Pillar 1**: Retention first.\n"
        "- **Pillar 2**: Product-led loops.\n\n"
        "Your tactical takeaway checklist is here."
    )
    val = ship30_skill.validate_essay(sample_text)
    assert val["has_headings"] is True
    assert val["has_bullets"] is True
    assert val["has_bold"] is True
    assert val["has_takeaway"] is True

@pytest.mark.asyncio
async def test_ship30_empty_evidence_honesty():
    """Verify skill gracefully refuses to fabricate when evidence is missing."""
    mock = MockProvider()
    content, val = await ship30_skill.execute(
        provider=mock,
        topic="Secret quantum entanglement mechanisms",
        evidence_chunks=[]
    )
    assert "Insufficient Evidence" in content
    assert "does not fabricate" in content
    assert val["is_valid_length"] is False

@pytest.mark.asyncio
async def test_ship30_execution_with_evidence():
    """Verify essay generation with mocked provider and real chunks."""
    mock = MockProvider()
    fake_chunk = {
        "guest": "Elena Verna",
        "episode_title": "10 growth tactics that never work",
        "timestamp_str": "[00:00:26]",
        "content": "To figure out your product market fit and how to distribute it, it's not something you can outsource."
    }
    content, val = await ship30_skill.execute(
        provider=mock,
        topic="Startup growth and retention",
        evidence_chunks=[fake_chunk]
    )
    assert len(content) > 500
    assert val["has_headings"] is True
    assert val["has_takeaway"] is True
