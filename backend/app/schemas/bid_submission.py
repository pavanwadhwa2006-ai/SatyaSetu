"""
SatyaSetu Backend — Bid Submission & Vendor Document Schemas (Phase 6)
Pydantic schemas for bidder submission workflows, document uploads, and lifecycle management.
"""

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field, field_validator


# ── Vendor Document Schemas ───────────────────────────────────────────────────

class VendorDocumentResponse(BaseModel):
    """Metadata response for an uploaded vendor document."""
    id: str
    bid_submission_id: str
    vendor_id: str
    original_filename: str
    storage_path: Optional[str] = None
    mime_type: Optional[str] = None
    file_size: Optional[int] = None
    document_type: Optional[str] = Field(None, description="Document type tag (e.g. TURNOVER_CERTIFICATE, MAF, etc.)")
    processing_status: str = Field(default="UPLOADED", description="UPLOADED, PROCESSING, PROCESSED, FAILED")
    uploaded_by: Optional[str] = None
    created_at: datetime
    download_url: Optional[str] = None

    model_config = {
        "from_attributes": True,
    }


# ── Bid Submission Schemas ─────────────────────────────────────────────────────

class BidSubmissionCreate(BaseModel):
    """Request body for creating or initiating a bid submission."""
    tender_id: str = Field(..., description="Tender UUID or canonical tender number")
    vendor_id: Optional[str] = Field(None, description="Vendor UUID. Required if not automatically derived from auth.")


class BidSubmissionResponse(BaseModel):
    """Single bid submission response with associated documents and metadata."""
    id: str
    tender_id: str
    vendor_id: str
    status: str = Field(..., description="DRAFT, SUBMITTED, UNDER_EVALUATION, QUALIFIED, DISQUALIFIED")
    submitted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    tender: Optional[dict[str, Any]] = None
    vendor: Optional[dict[str, Any]] = None
    documents: list[VendorDocumentResponse] = []
    documents_count: int = 0

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {
            "DRAFT", "SUBMITTED", "UNDER_EVALUATION",
            "QUALIFIED", "DISQUALIFIED", "CLARIFICATION_REQUESTED", "WITHDRAWN"
        }
        if v not in allowed:
            raise ValueError(f"status must be one of: {', '.join(sorted(allowed))}")
        return v

    model_config = {
        "from_attributes": True,
    }


class BidSubmissionListResponse(BaseModel):
    """Response schema for listing bid submissions."""
    items: list[BidSubmissionResponse]
    total: int


class BidSubmitActionResponse(BaseModel):
    """Response returned upon submitting / finalizing a bid."""
    id: str
    status: str
    submitted_at: datetime
    message: str
