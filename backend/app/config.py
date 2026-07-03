from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
    )
    database_url: str = "sqlite:///./chatbot.db"
    cors_origins: list[str] = ["http://localhost:5173"]

    ai_provider: str = "openai"
    ai_model: str = "gpt-4o-mini"
    openai_api_key: str = ""
    ollama_base_url: str = "http://localhost:11434"
    system_prompt: str = "You are a helpful assistant."

    max_message_length: int = 8000
    max_context_messages: int = 50
    rate_limit_per_minute: int = 30


settings = Settings()
