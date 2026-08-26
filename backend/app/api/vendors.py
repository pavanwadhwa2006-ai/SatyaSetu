"""
SatyaSetu Backend — Vendor Endpoints

GET  /api/vendors     — list all vendors (PROCUREMENT_OFFICER only)
POST /api/vendors     — register a vendor profile (any authenticated user)
"""

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import require_officer, require_any_authenticated
from app.schemas.auth import CurrentUser
from app.schemas.vendor import VendorCreate, VendorResponse, VendorListResponse
from app.services import vendor_service

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get(
    "",
    response_model=VendorListResponse,
    summary="List all vendors",
    description=(
        "Returns all registered vendor profiles. "
        "Restricted to PROCUREMENT_OFFICER role."
    ),
    responses={
        401: {"description": "Not authenticated"},
        403: {"description": "Not a Procurement Officer"},
    },
)
def list_vendors(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: CurrentUser = Depends(require_officer),
) -> VendorListResponse:
    return vendor_service.list_vendors(limit=limit, offset=offset)


@router.post(
    "",
    response_model=VendorResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a vendor profile",
    description=(
        "Create a vendor profile. "
        "Bidders: creates a profile linked to their user account (one per user). "
        "Officers: can create unlinked vendor profiles. "
        "Requires authentication."
    ),
    responses={
        201: {"description": "Vendor profile created"},
        401: {"description": "Not authenticated"},
        409: {"description": "Bidder already has a vendor profile"},
    },
)
def create_vendor(
    body: VendorCreate,
    current_user: CurrentUser = Depends(require_any_authenticated),
) -> VendorResponse:
    return vendor_service.create_vendor(data=body, current_user=current_user)
