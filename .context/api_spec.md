# API Specification (OpenAPI Draft)

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: TBD

## Endpoints

### `POST /api/v1/requests`
Create a new GPU provisioning request.

- **Request Body:**
  ```json
  {
    "user_id": "alice",
    "gpu_count": 4,
    "duration_hours": 2
  }
  ```

- **Validation:**
  - `user_id`: string, 1-50 characters, required
  - `gpu_count`: integer, 1-8 (quota limit), required
  - `duration_hours`: integer, ≥1, required

- **Response (201 Created):**
  ```json
  {
    "request_id": "55e30814-64b2-44dc-99b3-fed980cd81b8",
    "status": "pending"
  }
  ```

- **Error Responses:**
  - `400 Bad Request`: GPU count exceeds quota or validation failed
  - `500 Internal Server Error`: Database or Kafka error

---

### `GET /api/v1/requests`
Get all provisioning requests (history), ordered by most recent first.

- **Query Parameters:**
  - `limit` (optional): integer, default 100, max number of results

- **Response (200 OK):**
  ```json
  [
    {
      "request_id": "55e30814-64b2-44dc-99b3-fed980cd81b8",
      "status": "completed",
      "user_id": "alice",
      "gpu_count": 4,
      "duration_hours": 2,
      "kubeconfig": "apiVersion: v1...",
      "created_at": "2026-02-12T15:31:50.043900Z",
      "completed_at": "2026-02-12T15:32:05.123456Z"
    },
    {
      "request_id": "abc123...",
      "status": "pending",
      "user_id": "bob",
      "gpu_count": 2,
      "duration_hours": 1,
      "kubeconfig": null,
      "created_at": "2026-02-12T15:30:00.000000Z",
      "completed_at": null
    }
  ]
  ```

---

### `GET /api/v1/requests/{request_id}`
Get the status of a specific provisioning request.

- **Path Parameters:**
  - `request_id`: UUID string

- **Response (200 OK):**
  ```json
  {
    "request_id": "55e30814-64b2-44dc-99b3-fed980cd81b8",
    "status": "completed",
    "user_id": "alice",
    "gpu_count": 4,
    "duration_hours": 2,
    "kubeconfig": "apiVersion: v1...",
    "created_at": "2026-02-12T15:31:50.043900Z",
    "completed_at": "2026-02-12T15:32:05.123456Z"
  }
  ```

- **Status Values:**
  - `pending`: Request created, waiting for worker
  - `provisioning`: Worker is provisioning resources
  - `completed`: Resources ready, kubeconfig available
  - `failed`: Provisioning failed, see error_msg

- **Error Responses:**
  - `404 Not Found`: Request ID does not exist

---

### `GET /health`
Health check endpoint.

- **Response (200 OK):**
  ```json
  {
    "status": "ok"
  }
  ```

## CORS Configuration
- **Allowed Origins**: `http://localhost:5173`, `http://127.0.0.1:5173`, `*`
- **Allowed Methods**: All
- **Allowed Headers**: All