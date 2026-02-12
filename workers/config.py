"""
Worker configuration via pydantic-settings.
All values have sensible POC defaults and can be overridden with env vars.
"""

from pydantic_settings import BaseSettings


class WorkerSettings(BaseSettings):
    # ── Database ──────────────────────────────────────────────────────────
    # SQLite for the POC; swap to "postgresql+asyncpg://..." for production
    # IMPORTANT: Must point to the same database as the backend
    DATABASE_URL: str = "sqlite+aiosqlite:///./poc.db"

    # ── Kafka ─────────────────────────────────────────────────────────────
    KAFKA_BOOTSTRAP_SERVERS: str = "localhost:9092"
    KAFKA_TOPIC: str = "provision-requests"
    KAFKA_GROUP_ID: str = "provision-worker-group"

    # ── Worker Behavior ───────────────────────────────────────────────────
    MOCK_PROVISION_DELAY_SECONDS: int = 5

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = WorkerSettings()
