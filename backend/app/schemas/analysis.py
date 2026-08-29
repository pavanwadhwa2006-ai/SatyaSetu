"""
SatyaSetu Backend — Analysis & Rule Engine API Schemas
"""

from uuid import UUID
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalyzeBidRequest(BaseModel):
    bid_submission_id: UUID = Field(..., description="UUID of the bid submission to analyze")


class FormatCheckResult(BaseModel):
    valid: bool
    value: Optional[str] = None
    message: str


class TurnoverCheckResult(BaseModel):
    passed: bool
    extracted_turnover: Optional[float] = None
    required_turnover: float
    message: str


class NameMismatchResult(BaseModel):
    detected: bool
    unique_names: List[str] = Field(default_factory=list)
    message: str





class PanVerification(BaseModel):
    number: Optional[str] = None
    format_valid: bool
    status: str


class GstVerification(BaseModel):
    gstin: Optional[str] = None
    format_valid: bool
    status: str


class TurnoverVerification(BaseModel):
    required: float
    actual: float
    eligible: bool


class NameConsistencyVerification(BaseModel):
    passed: bool
    unique_names: Optional[List[str]] = None


class AnalyzeBidResponse(BaseModel):
    bid_submission_id: str
    documents_processed: int
    missing_documents: List[str]
    pan: PanVerification
    gst: GstVerification
    turnover: TurnoverVerification
    name_consistency: NameConsistencyVerification
    risk_score: int = Field(..., description="Risk score from 0 (lowest) to 100 (highest)")
    recommendation: str = Field(..., description="AUTO_APPROVE | HUMAN_REVIEW | REJECT")
