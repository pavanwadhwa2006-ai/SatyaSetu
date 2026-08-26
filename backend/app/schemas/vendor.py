"""
SatyaSetu Backend — Vendor Schemas
Pydantic models for vendor request/response validation.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field


# ── Request schemas ────────────────────────────────────────────────────────────

class VendorCreate(BaseModel):
    """Request body for POST /api/vendors."""
    legal_name: str = Field(..., min_length=1, max_length=300)
    display_name: Optional[str] = Field(None, max_length=200)

    model_config = {
        "json_schema_extra": {
            "example": {
                "legal_name": "XYZ Technologies Pvt. Ltd. [SYNTHETIC]",
                "display_name": "XYZ Technologies",
            }
        }
    }


class VendorUpdate(BaseModel):
    """Request body for PATCH /api/vendors/{id} (future use)."""
    display_name: Optional[str] = Field(None, max_length=200)
    status: Optional[str] = None


# ── Response schemas ───────────────────────────────────────────────────────────

class VendorResponse(BaseModel):
    """Single vendor response."""
    id: str
    user_id: Optional[str] = None
    legal_name: str
    display_name: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "uuid-here",
                "user_id": None,
                "legal_name": "ABC Engineering Pvt. Ltd. [SYNTHETIC]",
                "display_name": "ABC Engineering",
                "status": "ACTIVE",
                "created_at": "2026-08-01T00:00:00Z",
                "updated_at": "2026-08-01T00:00:00Z",
            }
        },
    }


class VendorListResponse(BaseModel):
    """Response for GET /api/vendors"""
    items: list[VendorResponse]
    total: int
