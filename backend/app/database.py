"""
Async SQLAlchemy engine, session factory, and Base declarative class.
"""

import logging

from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase

from app.config import settings

logger = logging.getLogger(__name__)

# Create the async engine — echo=True for development visibility
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Session factory used as a FastAPI dependency
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass


async def init_db() -> None:
    """Create all tables.  Tolerates concurrent attempts by multiple workers."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except OperationalError as exc:
        if "already exists" in str(exc):
            logger.info("Tables already exist — skipping creation.")
        else:
            raise


async def get_db() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency that yields an async DB session."""
    async with async_session() as session:
        yield session
