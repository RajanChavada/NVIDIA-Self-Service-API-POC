"""
FastAPI application entrypoint for the NVIDIA Self-Service Portal API.

Lifespan:
  - startup: create DB tables, start Kafka producer
  - shutdown: stop Kafka producer
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.kafka_producer import kafka_service
from app.routes.requests import router as requests_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # ── Startup ───────────────────────────────────────────────────────────
    logger.info("Initializing database …")
    await init_db()

    logger.info("Starting Kafka producer …")
    await kafka_service.start()

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────
    logger.info("Stopping Kafka producer …")
    await kafka_service.stop()


app = FastAPI(
    title="NVIDIA Self-Service Portal API",
    description="POC backend for on-demand ephemeral GPU provisioning.",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(requests_router, prefix="/api/v1")


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok"}
