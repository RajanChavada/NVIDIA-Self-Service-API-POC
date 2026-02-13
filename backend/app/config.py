"""
Application configuration via pydantic-settings.
All values have sensible POC defaults and can be overridden with env vars.
"""

import json

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

    # ── CORS ──────────────────────────────────────────────────────────────
    # Stored as a plain *string* so pydantic-settings does NOT try to
    # json.loads() the env var (which fails for simple values like "*").
    # Use the `cors_origins_list` property to get the parsed list.
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,*"

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS into a list.

        Accepts:
          - a JSON array string:  '["http://...", "*"]'
          - a comma-separated string:  'http://..., *'
        """
        v = self.CORS_ORIGINS.strip()
        if v.startswith("["):
            try:
                return json.loads(v)
            except json.JSONDecodeError:
                pass
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
