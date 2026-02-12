"""
Pydantic schemas for request/response validation.
Matches the API spec in .context/api_spec.md.
"""

from __future__ import annotations

from datetime import datetime
from pydantic import BaseModel, Field


# ── Request body for POST /api/v1/requests ────────────────────────────────

class CreateRequestSchema(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=50, examples=["alice"])
    gpu_count: int = Field(..., ge=1, le=8, examples=[4])
    duration_hours: int = Field(..., ge=1, examples=[2])


# ── Response for POST /api/v1/requests ────────────────────────────────────

class CreateRequestResponse(BaseModel):
    request_id: str
    status: str  # "pending"

    model_config = {"from_attributes": True}


# ── Response for GET /api/v1/requests/{request_id} ────────────────────────

class RequestStatusResponse(BaseModel):
    request_id: str
    status: str  # pending | provisioning | completed | failed
    user_id: str
    gpu_count: int
    duration_hours: int
    kubeconfig: str | None = None
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}
