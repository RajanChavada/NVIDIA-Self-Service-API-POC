"""
AIOKafka producer wrapper.
Gracefully degrades when Kafka is unavailable (logs a warning instead of crashing).
"""

from __future__ import annotations

import json
import logging

from aiokafka import AIOKafkaProducer

from app.config import settings

logger = logging.getLogger(__name__)


class KafkaProducerService:
    """Thin wrapper around AIOKafkaProducer with lifecycle management."""

    def __init__(self) -> None:
        self._producer: AIOKafkaProducer | None = None

    async def start(self) -> None:
        """Start the Kafka producer.  Logs a warning if Kafka is unreachable."""
        try:
            self._producer = AIOKafkaProducer(
                bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
                value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            )
            await self._producer.start()
            logger.info("Kafka producer started — connected to %s", settings.KAFKA_BOOTSTRAP_SERVERS)
        except Exception as exc:
            logger.warning(
                "Could not connect to Kafka (%s). Events will NOT be published. Error: %s",
                settings.KAFKA_BOOTSTRAP_SERVERS,
                exc,
            )
            self._producer = None

    async def stop(self) -> None:
        """Stop the Kafka producer (if running)."""
        if self._producer:
            await self._producer.stop()
            logger.info("Kafka producer stopped.")

    async def send_provision_event(
        self,
        request_id: str,
        user_id: str,
        gpu_count: int,
        duration_hours: int,
    ) -> None:
        """Publish a provision-request event to Kafka."""
        message = {
            "request_id": request_id,
            "user_id": user_id,
            "gpu_count": gpu_count,
            "duration_hours": duration_hours,
        }

        if self._producer is None:
            logger.warning("Kafka producer is not available — skipping event: %s", message)
            return

        await self._producer.send_and_wait(settings.KAFKA_TOPIC, value=message)
        logger.info("Published provision event to '%s': %s", settings.KAFKA_TOPIC, message)


# Module-level singleton used across the app
kafka_service = KafkaProducerService()
