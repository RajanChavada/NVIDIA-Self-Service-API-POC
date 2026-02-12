#!/usr/bin/env python3
"""
Kafka Worker Agent for GPU Provisioning Requests

This worker:
1. Consumes messages from the 'provision-requests' Kafka topic
2. Updates database status: pending → provisioning → completed
3. Simulates provisioning work with a configurable delay
4. Generates mock kubeconfig data for completed requests
5. Handles errors gracefully and updates status to 'failed'
"""

import asyncio
import json
import logging
import signal
import sys
from datetime import datetime, timezone
from pathlib import Path

from aiokafka import AIOKafkaConsumer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

# Add parent directory to path to import backend models
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

from app.models import ProvisionRequest, Base
from config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class ProvisionWorker:
    """Worker that consumes Kafka messages and provisions GPU resources."""

    def __init__(self):
        self.consumer = None
        self.engine = None
        self.async_session = None
        self.running = False

    async def setup(self):
        """Initialize database connection and Kafka consumer."""
        # Setup database
        logger.info("Connecting to database: %s", settings.DATABASE_URL)
        self.engine = create_async_engine(settings.DATABASE_URL, echo=False)
        self.async_session = async_sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

        # Create tables if they don't exist
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database connection established")

        # Setup Kafka consumer
        logger.info(
            "Connecting to Kafka: %s, topic: %s, group: %s",
            settings.KAFKA_BOOTSTRAP_SERVERS,
            settings.KAFKA_TOPIC,
            settings.KAFKA_GROUP_ID,
        )
        self.consumer = AIOKafkaConsumer(
            settings.KAFKA_TOPIC,
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            group_id=settings.KAFKA_GROUP_ID,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            auto_offset_reset="earliest",  # Start from beginning if no offset
            enable_auto_commit=True,
        )
        # await self.consumer.start() -> Moved to run() to handle failure gracefully
        logger.info("Kafka consumer initialized (connection pending)")

    async def teardown(self):
        """Cleanup resources."""
        if self.consumer:
            await self.consumer.stop()
            logger.info("Kafka consumer stopped")

        if self.engine:
            await self.engine.dispose()
            logger.info("Database connection closed")

    async def update_request_status(
        self,
        request_id: str,
        status: str,
        kubeconfig: str | None = None,
        error_msg: str | None = None,
    ) -> bool:
        """Update the status of a provision request in the database."""
        async with self.async_session() as session:
            try:
                # Fetch the request
                result = await session.execute(
                    select(ProvisionRequest).where(ProvisionRequest.id == request_id)
                )
                request = result.scalar_one_or_none()

                if not request:
                    logger.error("Request %s not found in database", request_id)
                    return False

                # Update fields
                request.status = status
                request.updated_at = datetime.now(timezone.utc)

                if kubeconfig is not None:
                    request.kubeconfig = kubeconfig

                if error_msg is not None:
                    request.error_msg = error_msg

                await session.commit()
                logger.info("Updated request %s to status: %s", request_id, status)
                return True

            except Exception as exc:
                logger.error(
                    "Failed to update request %s: %s", request_id, exc, exc_info=True
                )
                await session.rollback()
                return False

    def generate_mock_kubeconfig(
        self, request_id: str, user_id: str, gpu_count: int, duration_hours: int
    ) -> str:
        """Generate a mock kubeconfig YAML for the provisioned resources."""
        return f"""apiVersion: v1
kind: Config
clusters:
- cluster:
    server: https://nvidia-gpu-cluster.example.com:6443
    certificate-authority-data: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUN5RENDQWJDZ0F3SUJBZ0lCQURBTkJna3Foa2lHOXcwQkFRc0ZBREFWTVJNd0VRWURWUVFERXdwcmRXSmwKY201bGRHVnpNQjRYRFRJME1ERXdNVEF3TURBd01Gb1hEVE0wTURFd01UQXdNREF3TUZvd0ZURVRNQkVHQTFVRQpBeE1LYTNWaVpYSnVaWFJsY3pDQ0FTSXdEUVlKS29aSWh2Y05BUUVCQlFBRGdnRVBBRENDQVFvQ2dnRUJBTEhOCg==
  name: nvidia-gpu-cluster
contexts:
- context:
    cluster: nvidia-gpu-cluster
    namespace: gpu-{user_id}
    user: {user_id}
  name: nvidia-gpu-context
current-context: nvidia-gpu-context
users:
- name: {user_id}
  user:
    token: mock-jwt-token-{request_id[:8]}

# Provisioned Resources:
# - Request ID: {request_id}
# - User: {user_id}
# - GPUs: {gpu_count}
# - Duration: {duration_hours} hours
# - Provisioned at: {datetime.now(timezone.utc).isoformat()}
"""

    async def process_message(self, message):
        """Process a single provision request message."""
        try:
            data = message.value
            request_id = data.get("request_id")
            user_id = data.get("user_id")
            gpu_count = data.get("gpu_count")
            duration_hours = data.get("duration_hours")

            logger.info(
                "Processing provision request: %s (user=%s, gpus=%d, duration=%dh)",
                request_id,
                user_id,
                gpu_count,
                duration_hours,
            )

            # Step 1: Update status to 'provisioning'
            success = await self.update_request_status(request_id, "provisioning")
            if not success:
                logger.error("Failed to update status to provisioning, skipping")
                return

            # Step 2: Simulate provisioning work
            logger.info(
                "Simulating provisioning work for %d seconds...",
                settings.MOCK_PROVISION_DELAY_SECONDS,
            )
            await asyncio.sleep(settings.MOCK_PROVISION_DELAY_SECONDS)

            # Step 3: Generate mock kubeconfig
            kubeconfig = self.generate_mock_kubeconfig(
                request_id, user_id, gpu_count, duration_hours
            )

            # Step 4: Update status to 'completed' with kubeconfig
            success = await self.update_request_status(
                request_id, "completed", kubeconfig=kubeconfig
            )

            if success:
                logger.info(
                    "✅ Successfully provisioned request %s for user %s",
                    request_id,
                    user_id,
                )
            else:
                logger.error("Failed to update status to completed")

        except Exception as exc:
            logger.error(
                "Error processing message: %s", exc, exc_info=True
            )
            # Try to update status to failed
            if "request_id" in data:
                await self.update_request_status(
                    data["request_id"],
                    "failed",
                    error_msg=f"Worker error: {str(exc)}",
                )

    async def run(self):
        """Main worker loop - consume and process messages."""
        self.running = True
        logger.info("🚀 Worker started...")

        try:
            # Try to start Kafka consumer
            await self.consumer.start()
            logger.info("Kafka consumer started successfully - waiting for messages...")
            
            async for message in self.consumer:
                if not self.running:
                    break
                await self.process_message(message)

        except Exception as exc:
            logger.warning(f"⚠️ Kafka unavailable: {exc}")
            logger.info("🔄 Switching to DB POLLING MODE (Mock Flow)")
            
            await self.run_mock_polling_loop()

        finally:
            logger.info("Worker loop exiting")

    async def run_mock_polling_loop(self):
        """Poll the database for pending requests (Fallback for when Kafka is down)."""
        logger.info("Started DB Polling Loop - checking every 2 seconds...")
        
        while self.running:
            try:
                # 1. Find pending requests
                async with self.async_session() as session:
                    result = await session.execute(
                        select(ProvisionRequest).where(ProvisionRequest.status == "pending")
                    )
                    pending_requests = result.scalars().all()

                # 2. Process them
                for req in pending_requests:
                    if not self.running:
                        break
                        
                    logger.info(f"📥 Found pending request via polling: {req.id}")
                    
                    # Construct pseudo-message
                    mock_message = type('obj', (object,), {
                        'value': {
                            "request_id": req.id,
                            "user_id": req.user_id,
                            "gpu_count": req.gpu_count,
                            "duration_hours": req.duration_hours
                        }
                    })
                    
                    await self.process_message(mock_message)

                # 3. Sleep
                await asyncio.sleep(2)

            except Exception as e:
                logger.error(f"Error in polling loop: {e}")
                await asyncio.sleep(5)

    async def shutdown(self, sig=None):
        """Graceful shutdown handler."""
        if sig:
            logger.info("Received signal %s - shutting down gracefully...", sig.name)
        else:
            logger.info("Shutting down gracefully...")

        self.running = False
        await self.teardown()


async def main():
    """Main entry point."""
    worker = ProvisionWorker()

    # Setup signal handlers for graceful shutdown
    loop = asyncio.get_running_loop()

    def signal_handler(sig):
        logger.info("Signal %s received", sig.name)
        asyncio.create_task(worker.shutdown(sig))

    for sig in (signal.SIGTERM, signal.SIGINT):
        loop.add_signal_handler(sig, lambda s=sig: signal_handler(s))

    try:
        await worker.setup()
        await worker.run()
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as exc:
        logger.error("Fatal error: %s", exc, exc_info=True)
        sys.exit(1)
    finally:
        await worker.shutdown()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Worker stopped by user")
