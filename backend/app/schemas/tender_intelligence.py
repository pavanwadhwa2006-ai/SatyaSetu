"""
SatyaSetu Backend — Tender Intelligence Schemas (Phase 5)
Pydantic schemas for machine-readable procurement requirements, normalized fields,
operators, percentage bases, evidence requirements, and exemption metadata.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class ExemptionMetadataSchema(BaseModel):
    qualifiesFor: list[str] = Field(default_factory=list, description="Entity classifications qualifying for exemption")
    requiredEvidence: str = Field(..., description="Document type required to claim exemption")
    condition: str = Field(..., description="Specific conditions governing exemption applicability")


class StructuredRequirementSchema(BaseModel):
    id: str = Field(..., description="Unique requirement identifier")
    tenderId: str = Field(..., description="Tender identifier")
    requirementCode: str = Field(..., description="Canonical requirement code (e.g. REQ-T1-001)")
    category: str = Field(..., description="Category (FINANCIAL, TECHNICAL, STATUTORY, EXPERIENCE, etc.)")
    requirementText: str = Field(..., description="Original human-readable requirement text")
    normalizedField: str = Field(..., description="Machine-readable evaluation field name")
    requirementType: str = Field(..., description="Standardized requirement type")
    operator: str = Field(..., description="Standardized evaluation operator (>=, <=, ==, VALID, MATCH, PERCENT_OF, etc.)")
    thresholdValue: Optional[Any] = Field(None, description="Direct threshold value")
    thresholdUnit: Optional[str] = Field(None, description="Threshold unit of measure (INR, UNITS, DAYS, PERCENT, etc.)")
    thresholdPercentage: Optional[float] = Field(None, description="Percentage as decimal fraction (e.g. 0.10 for 10%)")
    baseValue: Optional[str] = Field(None, description="Base field reference for percentage calculation")
    originalValue: Optional[str] = Field(None, description="Original human-readable threshold representation")
    normalizedValue: Optional[Any] = Field(None, description="Normalized numeric or machine-readable value")
    mandatory: bool = Field(..., description="Whether requirement is strictly mandatory")
    exemptionRule: Optional[str] = Field(None, description="Human-readable exemption rule text")
    exemptionMetadata: Optional[ExemptionMetadataSchema] = Field(None, description="Structured exemption rules")
    evidenceRequired: Optional[list[str]] = Field(default_factory=list, description="Document/evidence types required")
    sourceDocument: str = Field(..., description="Source tender PDF filename")
    sourcePage: int = Field(..., description="Page number where clause appears")
    sourceClause: str = Field(..., description="Tender RFP clause citation")


class TenderIntelligenceResponse(BaseModel):
    tenderId: str
    bidNumber: str
    title: str
    buyer: str
    estimatedValue: int
    estimatedValueFormatted: str
    totalRequirementsCount: int
    mandatoryRequirementsCount: int
    financialRequirementsCount: int
    technicalRequirementsCount: int
    statutoryRequirementsCount: int
    experienceRequirementsCount: int
    requirements: list[StructuredRequirementSchema]
