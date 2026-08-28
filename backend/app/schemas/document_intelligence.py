"""
SatyaSetu Backend — Document Intelligence Schemas (Phase 7)
Pydantic models for document classification, text extraction, structured fact extraction,
source page provenance, verbatim quote traceability, and confidence scores.
"""

from typing import Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


class DocumentFactSchema(BaseModel):
    """Structured fact extracted from an uploaded bidder PDF document."""
    id: str = Field(..., description="Unique fact identifier")
    vendor_document_id: str = Field(..., description="Referenced vendor document UUID")
    field_name: str = Field(..., description="Canonical machine-readable field name")
    value: str = Field(..., description="Extracted raw value as presented in document text")
    normalized_value: Optional[Any] = Field(None, description="Normalized numeric or symbolic value")
    unit: Optional[str] = Field(None, description="Unit of measurement (INR, UNITS, PERCENT, DAYS, etc.)")
    source_page: int = Field(default=1, ge=1, description="Exact 1-indexed page number in the source PDF")
    source_section: Optional[str] = Field(None, description="Section or heading context within the document")
    raw_quote: str = Field(..., description="Exact verbatim text quotation containing the fact")
    confidence: float = Field(default=0.95, ge=0.0, le=1.0, description="Extraction confidence score (0.0 to 1.0)")
    extraction_method: str = Field(default="DETERMINISTIC_PDF_PARSER", description="Method used for extraction")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of fact extraction")

    model_config = {
        "from_attributes": True,
    }


class DocumentProcessResponse(BaseModel):
    """Response returned upon processing a vendor document."""
    document_id: str
    bid_submission_id: str
    vendor_id: str
    original_filename: str
    document_type: str
    processing_status: str = Field(..., description="PROCESSED or FAILED")
    extracted_pages_count: int
    extracted_facts_count: int
    facts: list[DocumentFactSchema] = []
    error_message: Optional[str] = None
    message: str


class SubmissionFactsResponse(BaseModel):
    """Aggregated facts across all documents in a bid submission."""
    submission_id: str
    documents_processed_count: int
    total_facts_count: int
    documents: list[DocumentProcessResponse]
