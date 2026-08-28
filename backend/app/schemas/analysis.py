"""
SatyaSetu Backend — Analysis & Rule Engine API Schemas
"""

from uuid import UUID
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AnalyzeBidRequest(BaseModel):
    bid_submission_id: UUID = Field(..., description="UUID of the bid submission to analyze")




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
