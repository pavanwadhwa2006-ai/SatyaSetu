"""
SatyaSetu Backend — Ground Truth Schemas (Phase 3)
Pydantic schemas for canonical tenders, requirements, bidders, evidence, and compliance benchmarks.
"""

from typing import Optional, Any
from pydantic import BaseModel, Field


class GroundTruthTenderSchema(BaseModel):
    id: str
    bidNumber: str
    title: str
    buyer: str
    category: str
    estimatedValue: int
    estimatedValueFormatted: str
    emdAmount: int
    emdAmountFormatted: str
    submissionDeadline: str
    description: str
    status: str


class TenderRequirementSchema(BaseModel):
    id: str
    tenderId: str
    requirementCode: str
    category: str
    requirementText: str
    requirementType: str
    operator: str
    thresholdValue: Optional[Any] = None
    thresholdUnit: Optional[str] = None
    mandatory: bool
    exemptionRule: Optional[str] = None
    sourceDocument: str
    sourcePage: int
    sourceClause: str


class GroundTruthBidderSchema(BaseModel):
    id: str
    tenderId: str
    bidderCode: str
    legalName: str
    shortName: str
    cin: str
    pan: str
    gstin: str
    udyamNumber: str
    enterpriseType: str
    businessType: str
    registeredAddress: str
    state: str
    city: str
    pincode: str
    authorizedSignatory: str
    phone: str
    email: str


class BidderDocumentSchema(BaseModel):
    id: str
    bidderId: str
    documentCode: str
    documentName: str
    documentType: str
    pageNumber: int
    documentDate: Optional[str] = None
    validUntil: Optional[str] = None
    documentStatus: str
    fileName: str


class BidderEvidenceSchema(BaseModel):
    id: str
    bidderId: str
    documentId: str
    evidenceType: str
    fieldName: str
    extractedValue: str
    normalizedValue: Optional[Any] = None
    unit: Optional[str] = None
    confidence: float
    sourcePage: int
    sourceText: str


class ComplianceResultSchema(BaseModel):
    id: str
    bidderId: str
    requirementId: str
    status: str
    submittedValue: str
    requiredValue: str
    reason: str
    evidenceId: str
    confidence: float
    reviewRequired: bool


class BidderBenchmarkSchema(BaseModel):
    bidderId: str
    bidderCode: str
    legalName: str
    tenderId: str
    bidNumber: str
    benchmarkStatus: str
    benchmarkLabel: str
    summaryReason: str
    failingRequirementsCount: int
    reviewRequirementsCount: int
    passingRequirementsCount: int


class GroundTruthDatasetResponse(BaseModel):
    tenders: list[GroundTruthTenderSchema]
    requirements: list[TenderRequirementSchema]
    bidders: list[GroundTruthBidderSchema]
    documents: list[BidderDocumentSchema]
    evidence: list[BidderEvidenceSchema]
    complianceResults: list[ComplianceResultSchema]
    benchmarks: list[BidderBenchmarkSchema]
