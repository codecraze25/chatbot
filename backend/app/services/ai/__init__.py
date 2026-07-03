from app.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.openai_provider import OpenAIProvider


def get_ai_provider() -> AIProvider:
    provider = settings.ai_provider.lower()
    if provider == "openai":
        return OpenAIProvider()
    raise ValueError(f"Unsupported AI provider: {settings.ai_provider}")
