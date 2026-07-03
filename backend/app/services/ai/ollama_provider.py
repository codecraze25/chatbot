import json
from collections.abc import AsyncIterator

import httpx

from app.config import settings
from app.services.ai.base import AIProvider, ChatMessage


class OllamaProvider(AIProvider):
    def __init__(self) -> None:
        self.base_url = settings.ollama_base_url.rstrip("/")
        self.model = settings.ai_model

    async def stream(self, messages: list[ChatMessage]) -> AsyncIterator[str]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json={"model": self.model, "messages": messages, "stream": True},
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    data = json.loads(line)
                    content = data.get("message", {}).get("content")
                    if content:
                        yield content
