# GPU Provisioning Worker

This worker consumes GPU provisioning requests from Kafka and updates the database with mock provisioning results.

## Architecture

The worker implements the following flow:

1. **Consume** messages from Kafka topic `provision-requests`
2. **Update** database status to `provisioning`
3. **Simulate** provisioning work (configurable delay, default 5 seconds)
4. **Generate** mock kubeconfig YAML
5. **Update** database status to `completed` with kubeconfig data

## Prerequisites

- Python 3.10+
- Access to the same database as the backend (default: `../backend/poc.db`)
- Kafka broker running (default: `localhost:9092`)

## Installation

```bash
cd workers
pip install -r requirements.txt
```

## Configuration

All settings can be configured via environment variables or a `.env` file:

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./poc.db` | Database connection string (must match backend) |
| `KAFKA_BOOTSTRAP_SERVERS` | `localhost:9092` | Kafka broker address |
| `KAFKA_TOPIC` | `provision-requests` | Kafka topic to consume from |
| `KAFKA_GROUP_ID` | `provision-worker-group` | Consumer group ID |
| `MOCK_PROVISION_DELAY_SECONDS` | `5` | Simulated provisioning delay |

## Running the Worker

```bash
cd workers
python provision_worker.py
```

The worker will:
- Connect to the database and create tables if needed
- Connect to Kafka and start consuming messages
- Process provision requests as they arrive
- Log all activities to stdout

## Graceful Shutdown

The worker handles `SIGTERM` and `SIGINT` signals for graceful shutdown:

```bash
# Press Ctrl+C or send SIGTERM
kill -TERM <worker_pid>
```

## Message Format

The worker expects JSON messages with the following structure:

```json
{
  "request_id": "uuid-string",
  "user_id": "username",
  "gpu_count": 4,
  "duration_hours": 2
}
```

## Database Updates

The worker updates the `provision_requests` table with the following status transitions:

1. **pending** → **provisioning** (when message is received)
2. **provisioning** → **completed** (after successful provisioning)
3. **provisioning** → **failed** (if an error occurs)

## Logging

The worker logs:
- Kafka connection status
- Database connection status
- Each message processed
- Status updates
- Errors and exceptions

Example output:
```
2026-02-12 12:00:00 - __main__ - INFO - Connecting to database: sqlite+aiosqlite:///./poc.db
2026-02-12 12:00:00 - __main__ - INFO - Database connection established
2026-02-12 12:00:00 - __main__ - INFO - Connecting to Kafka: localhost:9092, topic: provision-requests
2026-02-12 12:00:01 - __main__ - INFO - Kafka consumer started successfully
2026-02-12 12:00:01 - __main__ - INFO - 🚀 Worker started - waiting for provision requests...
2026-02-12 12:00:05 - __main__ - INFO - Processing provision request: abc-123 (user=alice, gpus=4, duration=2h)
2026-02-12 12:00:05 - __main__ - INFO - Updated request abc-123 to status: provisioning
2026-02-12 12:00:05 - __main__ - INFO - Simulating provisioning work for 5 seconds...
2026-02-12 12:00:10 - __main__ - INFO - Updated request abc-123 to status: completed
2026-02-12 12:00:10 - __main__ - INFO - ✅ Successfully provisioned request abc-123 for user alice
```

## Troubleshooting

### Kafka Connection Issues

If Kafka is not available, the worker will fail to start. Ensure:
- Kafka broker is running at the configured address
- Network connectivity to Kafka broker
- Correct `KAFKA_BOOTSTRAP_SERVERS` configuration

### Database Issues

If database connection fails:
- Ensure the database file path is correct
- Check file permissions
- Verify SQLAlchemy connection string format

### No Messages Being Processed

If the worker starts but doesn't process messages:
- Verify the backend is publishing to the correct topic
- Check Kafka consumer group offset (may need to reset)
- Ensure the topic exists in Kafka
