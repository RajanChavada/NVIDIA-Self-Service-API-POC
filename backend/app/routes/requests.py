"""
Routes for GPU provisioning requests.
  POST /requests  — create a new request
  GET  /requests  — get all requests (history)
  GET  /requests/{request_id} — poll status
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.kafka_producer import kafka_service
from app.models import ProvisionRequest
from app.schemas import (
    CreateRequestResponse,
    CreateRequestSchema,
    RequestStatusResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/requests", tags=["requests"])


# ── GET /api/v1/requests ─────────────────────────────────────────────────

@router.get(
    "",
    response_model=list[RequestStatusResponse],
    summary="Get all provisioning requests (history)",
)
async def get_all_requests(
    db: AsyncSession = Depends(get_db),
    limit: int = 100,
) -> list[RequestStatusResponse]:
    """Return all requests ordered by most recent first."""
    result = await db.execute(
        select(ProvisionRequest)
        .order_by(ProvisionRequest.created_at.desc())
        .limit(limit)
    )
    rows = result.scalars().all()

    return [
        RequestStatusResponse(
            request_id=row.id,
            status=row.status,
            user_id=row.user_id,
            gpu_count=row.gpu_count,
            duration_hours=row.duration_hours,
            kubeconfig=row.kubeconfig,
            created_at=row.created_at,
            completed_at=row.updated_at if row.status == "completed" else None,
        )
        for row in rows
    ]


# ── POST /api/v1/requests ────────────────────────────────────────────────

@router.post(
    "",
    response_model=CreateRequestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new GPU provisioning request",
)
async def create_request(
    body: CreateRequestSchema,
    db: AsyncSession = Depends(get_db),
) -> CreateRequestResponse:
    # 1. Quota check (mock: max 8 GPUs per single request)
    if body.gpu_count > settings.MAX_GPU_QUOTA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GPU count exceeds max quota of {settings.MAX_GPU_QUOTA}",
        )

    # 2. Persist to DB
    new_request = ProvisionRequest(
        user_id=body.user_id,
        gpu_count=body.gpu_count,
        duration_hours=body.duration_hours,
        status="pending",
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)

    logger.info("Created provision request %s for user %s", new_request.id, body.user_id)

    # 3. Publish event to Kafka
    await kafka_service.send_provision_event(
        request_id=new_request.id,
        user_id=body.user_id,
        gpu_count=body.gpu_count,
        duration_hours=body.duration_hours,
    )

    return CreateRequestResponse(
        request_id=new_request.id,
        status=new_request.status,
    )


# ── GET /api/v1/requests/{request_id} ────────────────────────────────────

@router.get(
    "/{request_id}",
    response_model=RequestStatusResponse,
    summary="Get the status of a provisioning request",
)
async def get_request_status(
    request_id: str,
    db: AsyncSession = Depends(get_db),
) -> RequestStatusResponse:
    result = await db.execute(
        select(ProvisionRequest).where(ProvisionRequest.id == request_id)
    )
    row = result.scalar_one_or_none()

    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request {request_id} not found",
        )

    return RequestStatusResponse(
        request_id=row.id,
        status=row.status,
        user_id=row.user_id,
        gpu_count=row.gpu_count,
        duration_hours=row.duration_hours,
        kubeconfig=row.kubeconfig,
        created_at=row.created_at,
        completed_at=row.updated_at if row.status == "completed" else None,
    )
