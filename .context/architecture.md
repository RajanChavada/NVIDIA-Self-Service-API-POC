## Architecture description 

## Flow of request provisioning 
1. **User (FE)** submits form -> `POST /api/v1/requests`
2. **API (BE)**:
   - Validates JWT (Mock for POC).
   - Checks Quota (Mock: max 8 GPUs).
   - Inserts into `provision_requests` table (Status: 'pending').
   - Publishes event to Kafka topic `provision-requests`.
   - Returns `{ request_id: "...", status: "pending" }`.
3. **Worker**:
   - Consumes from `provision-requests`.
   - Updates DB -> Status: 'provisioning'.
   - Simulates work (sleep 5s).
   - Updates DB -> Status: 'completed', `kubeconfig`: "mock-yaml".

## Flow: Status Check
1. **User (FE)** polls `GET /api/v1/requests/{request_id}` every 3s.
2. **API (BE)** returns current DB status.