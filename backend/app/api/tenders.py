"""
SatyaSetu Backend — Tender Endpoints

GET  /api/tenders          — list all tenders (public)
POST /api/tenders          — create tender (PROCUREMENT_OFFICER only)
GET  /api/tenders/{id}     — get single tender (public)
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import require_officer
from app.schemas.auth import CurrentUser
from app.schemas.tender import TenderCreate, TenderResponse, TenderListResponse
from app.services import tender_service

router = APIRouter(prefix="/tenders", tags=["tenders"])


@router.get(
    "",
    response_model=TenderListResponse,
    summary="List all tenders",
    description=(
        "Returns a list of all tender records from the database. "
        "Public endpoint — no authentication required. "
        "Use ?status=OPEN to filter by status."
    ),
)
def list_tenders(
    status: Optional[str] = Query(
        default=None,
        description="Filter by status: OPEN, EVALUATION, CLOSED, AWARDED",
    ),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> TenderListResponse:
    return tender_service.list_tenders(
        status_filter=status,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=TenderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a tender",
    description=(
        "Create a new tender record. "
        "Restricted to PROCUREMENT_OFFICER role. "
        "tender_number must be unique."
    ),
    responses={
        201: {"description": "Tender created"},
        401: {"description": "Not authenticated"},
        403: {"description": "Not a Procurement Officer"},
        409: {"description": "Tender number already exists"},
    },
)
def create_tender(
    body: TenderCreate,
    current_user: CurrentUser = Depends(require_officer),
) -> TenderResponse:
    return tender_service.create_tender(data=body, created_by=current_user.id)


@router.get(
    "/{tender_id}",
    response_model=TenderResponse,
    summary="Get a single tender",
    description="Returns a tender by UUID. Public — no authentication required.",
    responses={
        404: {"description": "Tender not found"},
    },
)
def get_tender(tender_id: str) -> TenderResponse:
    return tender_service.get_tender(tender_id)
