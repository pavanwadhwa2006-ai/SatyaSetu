"""
SatyaSetu Backend — Tender Schemas
Pydantic models for tender request/response validation.
"""

from typing import Optional
from datetime import datetime, date
import uuid
from pydantic import BaseModel, Field, field_validator


# ── Document Schemas ──────────────────────────────────────────────────────────

class TenderDocumentResponse(BaseModel):
    """Metadata response for an associated tender document."""
    id: str
    tender_id: str
    original_filename: str
    storage_path: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    processing_status: str = "UPLOADED"
    uploaded_by: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True,
    }


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
    source: str = Field(default="GEM_PUBLIC", max_length=50)

    model_config = {
        "json_schema_extra": {
            "example": {
                "tender_number": "GEM/2026/B/7261466",
                "title": "Procurement of Structural Engineering Software (ETABS, SAFE, SAP2000)",
                "organization": "Central Public Works Department",
                "department": "Structural Engineering & Design Division",
                "category": "Engineering Software / Structural Analysis Software",
                "description": "Supply, installation, licensing, and technical support for engineering software suite.",
                "status": "OPEN",
                "estimated_value": 2450000,
                "source": "GEM_PUBLIC",
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
    documents: list[TenderDocumentResponse] = []

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": "0d1664c9-a97f-4451-a0fd-02ac047fb955",
                "tender_number": "GEM/2026/B/7261466",
                "title": "Procurement of Structural Engineering Software (ETABS, SAFE, SAP2000)",
                "organization": "Central Public Works Department",
                "status": "OPEN",
                "source": "GEM_PUBLIC",
                "estimated_value": 2450000,
                "created_at": "2026-08-10T00:00:00Z",
                "updated_at": "2026-08-10T00:00:00Z",
                "documents": [],
            }
        },
    }


class TenderListResponse(BaseModel):
    """Response for GET /api/tenders"""
    items: list[TenderResponse]
    total: int
