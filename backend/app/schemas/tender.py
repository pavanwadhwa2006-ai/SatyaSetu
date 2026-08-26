"""
SatyaSetu Backend — Tender Schemas
Pydantic models for tender request/response validation.
"""

from typing import Optional
from datetime import datetime, date
from pydantic import BaseModel, Field, field_validator


# ── Shared base ────────────────────────────────────────────────────────────────

class TenderBase(BaseModel):
    tender_number: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=500)
    organization: str = Field(..., min_length=1, max_length=200)
    department: Optional[str] = Field(None, max_length=200)
    category: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    status: str = Field(default="OPEN")
    estimated_value: Optional[int] = Field(None, ge=0, description="Estimated value in INR")
    submission_deadline: Optional[datetime] = None
    publish_date: Optional[date] = None
    bid_validity_days: Optional[int] = Field(None, ge=1)
    evaluation_type: Optional[str] = Field(None, max_length=200)
    delivery_location: Optional[str] = Field(None, max_length=300)
    delivery_period_days: Optional[int] = Field(None, ge=1)
    warranty_months: Optional[int] = Field(None, ge=0)
    emd_amount: Optional[int] = Field(None, ge=0, description="EMD amount in INR")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"OPEN", "EVALUATION", "CLOSED", "AWARDED"}
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        return v


# ── Request schemas ────────────────────────────────────────────────────────────

class TenderCreate(TenderBase):
    """Request body for POST /api/tenders (officer only)."""
    source: str = Field(default="MANUAL", max_length=50)

    model_config = {
        "json_schema_extra": {
            "example": {
                "tender_number": "SYNTHETIC-TENDER-006",
                "title": "Procurement of Office Furniture",
                "organization": "Central Secretariat",
                "department": "Administrative Division",
                "category": "Furniture / Office Equipment",
                "description": "Supply and installation of ergonomic office furniture. [SYNTHETIC]",
                "status": "OPEN",
                "estimated_value": 5000000,
                "source": "MANUAL",
            }
        }
    }


class TenderUpdate(BaseModel):
    """Request body for PATCH /api/tenders/{id} (future use)."""
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    status: Optional[str] = None
    description: Optional[str] = None
    submission_deadline: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        allowed = {"OPEN", "EVALUATION", "CLOSED", "AWARDED"}
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        return v


# ── Response schemas ───────────────────────────────────────────────────────────

class TenderResponse(TenderBase):
    """Single tender response."""
    id: str
    source: str
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "uuid-here",
                "tender_number": "SYNTHETIC-TENDER-001",
                "title": "Supply and Installation of Industrial Temperature Monitoring Equipment",
                "organization": "Government Procurement Department",
                "status": "EVALUATION",
                "source": "SYNTHETIC",
                "estimated_value": 18500000,
                "created_at": "2026-08-01T00:00:00Z",
                "updated_at": "2026-08-01T00:00:00Z",
            }
        },
    }


class TenderListResponse(BaseModel):
    """Response for GET /api/tenders"""
    items: list[TenderResponse]
    total: int
