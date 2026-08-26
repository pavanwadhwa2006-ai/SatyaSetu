"""
SatyaSetu Backend — Vendor Service
Business logic for vendor operations.
"""

import logging
from fastapi import HTTPException, status

from app.repositories import vendor_repo
from app.schemas.vendor import VendorCreate, VendorResponse, VendorListResponse
from app.schemas.auth import CurrentUser

logger = logging.getLogger(__name__)


def list_vendors(limit: int = 100, offset: int = 0) -> VendorListResponse:
    """
    Retrieve all vendor profiles.
    Restricted to PROCUREMENT_OFFICER — caller must enforce this.
    """
    try:
        vendors, total = vendor_repo.get_all_vendors(limit=limit, offset=offset)
        return VendorListResponse(
            items=[VendorResponse(**v) for v in vendors],
            total=total,
        )
    except Exception as exc:
        logger.error("Service error listing vendors: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database unavailable. Please try again later.",
        )


def create_vendor(data: VendorCreate, current_user: CurrentUser) -> VendorResponse:
    """
    Create a vendor profile for the current bidder.

    Business rules:
    - A bidder can only have one vendor profile (linked via user_id).
    - Officers can also create vendor profiles on behalf of vendors (user_id = None).

    Args:
        data: Validated VendorCreate request body
        current_user: Authenticated user (bidder or officer)
    """
    user_id_to_link = None

    if current_user.role == "BIDDER":
        # Check if bidder already has a vendor profile
        try:
            existing = vendor_repo.get_vendor_by_user_id(current_user.id)
        except Exception as exc:
            logger.error("Service error checking existing vendor for %s: %s", current_user.id, exc)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not verify vendor registration. Please try again.",
            )

        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="You already have a vendor profile registered. Contact support to update it.",
            )

        user_id_to_link = current_user.id

    try:
        vendor = vendor_repo.create_vendor(data, user_id=user_id_to_link)
        return VendorResponse(**vendor)
    except Exception as exc:
        logger.error("Service error creating vendor: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Could not create vendor profile. Please try again.",
        )
