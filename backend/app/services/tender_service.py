"""
SatyaSetu Backend — Tender Service
Business logic for tender operations.
Sits between API routes and the repository layer.
"""

import logging
from typing import Optional
from fastapi import HTTPException, status

from app.repositories import tender_repo
from app.schemas.tender import TenderCreate, TenderResponse, TenderListResponse

logger = logging.getLogger(__name__)


def list_tenders(
    status_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> TenderListResponse:
    """
    Retrieve paginated list of tenders, optionally filtered by status.
    Public — no role restriction.
    """
    try:
        tenders, total = tender_repo.get_all_tenders(
            status_filter=status_filter,
            limit=limit,
            offset=offset,
        )
        return TenderListResponse(
            items=[TenderResponse(**t) for t in tenders],
            total=total,
        )
    except Exception as exc:
        logger.error("Service error listing tenders: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please try again later.",
        )


def get_tender(tender_id: str) -> TenderResponse:
    """
    Retrieve a single tender by ID.
    Public — no role restriction.
    Raises 404 if not found.
    """
    try:
        tender = tender_repo.get_tender_by_id(tender_id)
    except Exception as exc:
        logger.error("Service error fetching tender %s: %s", tender_id, exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please try again later.",
        )

    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender '{tender_id}' not found.",
        )

    return TenderResponse(**tender)


def create_tender(data: TenderCreate, created_by: str) -> TenderResponse:
    """
    Create a new tender record.
    Restricted to PROCUREMENT_OFFICER — caller must enforce this.

    Args:
        data: Validated TenderCreate request body
        created_by: UUID of the officer creating the tender
    """
    try:
        tender = tender_repo.create_tender(data, created_by=created_by)
        return TenderResponse(**tender)
    except Exception as exc:
        error_str = str(exc)
        # Detect unique constraint violation on tender_number
        if "uq" in error_str.lower() or "unique" in error_str.lower() or "23505" in error_str:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A tender with number '{data.tender_number}' already exists.",
            )
        logger.error("Service error creating tender: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not create tender. Please try again.",
        )
