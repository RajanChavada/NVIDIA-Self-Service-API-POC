"""
Application configuration via pydantic-settings.
All values have sensible POC defaults and can be overridden with env vars.
"""

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    # SQLite for the POC; swap to "postgresql+asyncpg://..." for production
    DATABASE_URL: str = "sqlite+aiosqlite:///./poc.db"

    # ── Kafka ─────────────────────────────────────────────────────────────
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC: str = "provision-requests"

    # ── Quota ─────────────────────────────────────────────────────────────
    MAX_GPU_QUOTA: int = 8

    # ── CORS (allow everything for the POC) ───────────────────────────────
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str] | str:
        if isinstance(v, str) and not v.startswith("["):
            return [origin.strip() for origin in v.split(",")]
        return v

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
