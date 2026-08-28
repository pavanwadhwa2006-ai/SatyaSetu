// ============================================================
// SatyaSetu — Ground Truth Data Layer Types (Phase 3)
// Canonical Tender Requirements, Bidder Submissions & Evidence
// ============================================================

export type RequirementCategory =
  | 'MANDATORY'
  | 'TECHNICAL'
  | 'FINANCIAL'
  | 'STATUTORY'
  | 'EXPERIENCE'
  | 'LOCATION'
  | 'PREFERENTIAL'
  | 'COMMERCIAL';

export type RequirementType =
  | 'NUMERIC'
  | 'BOOLEAN'
  | 'DOCUMENT'
  | 'VALIDITY'
  | 'EXPERIENCE'
  | 'LOCATION'
  | 'TECHNICAL'
  | 'FINANCIAL'
  | 'STATUTORY'
  | 'EXEMPTION'
  | 'DECLARATION';

export type RequirementOperator =
  | '>='
  | '<='
  | '=='
  | 'EXISTS'
  | 'VALID'
  | 'MATCH'
  | 'CONTAINS'
  | 'NOT_EXISTS';

export interface GroundTruthTender {
  id: string;
  bidNumber: string;
  title: string;
  buyer: string;
  category: string;
  estimatedValue: number;
  estimatedValueFormatted: string;
  emdAmount: number;
  emdAmountFormatted: string;
  submissionDeadline: string;
  publishDate: string;
  bidValidityDays: number;
  evaluationType: string;
  deliveryLocation: string;
  deliveryPeriodDays: number;
  warrantyMonths: number;
  description: string;
  status: 'OPEN' | 'EVALUATION' | 'CLOSED' | 'AWARDED';
}

export interface TenderRequirement {
  id: string;
  tenderId: string;
  requirementCode: string;
  category: RequirementCategory;
  requirementText: string;
  requirementType: RequirementType;
  operator: RequirementOperator;
  thresholdValue?: string | number | boolean;
  thresholdUnit?: string;
  mandatory: boolean;
  exemptionRule?: string;
  sourceDocument: string;
  sourcePage: number;
  sourceClause: string;
}

export type EnterpriseType = 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
export type BusinessType = 'MANUFACTURER' | 'SERVICE_PROVIDER' | 'TRADER' | 'RESELLER' | 'CONTRACTOR';

export interface GroundTruthBidder {
  id: string;
  tenderId: string;
  bidderCode: string; // e.g. T1-B2, T2-B1, T2-B2, T3-B1, T3-B2
  legalName: string;
  shortName: string;
  cin: string;
  pan: string;
  gstin: string;
  udyamNumber: string;
  enterpriseType: EnterpriseType;
  businessType: BusinessType;
  registeredAddress: string;
  state: string;
  city: string;
  pincode: string;
  authorizedSignatory: string;
  designation: string;
  phone: string;
  email: string;
  incorporationYear: number;
}

export type GroundTruthDocumentType =
  | 'PAN'
  | 'GST'
  | 'UDYAM'
  | 'TURNOVER_CERTIFICATE'
  | 'EXPERIENCE_CERTIFICATE'
  | 'PURCHASE_ORDER'
  | 'INVOICE'
  | 'MAF'
  | 'MII_DECLARATION'
  | 'ELECTRICAL_LICENSE'
  | 'GST_RETURN'
  | 'NON_BLACKLISTING'
  | 'SOLVENCY'
  | 'TECHNICAL_COMPLIANCE'
  | 'ADDRESS_PROOF'
  | 'EMD_EXEMPTION'
  | 'STARTUP_CERTIFICATE'
  | 'SAMPLE_UNDERTAKING'
  | 'OTHER';

export type DocumentStatus = 'VALID' | 'EXPIRED' | 'DEFICIENT' | 'PROVISIONAL' | 'UNNOTARIZED' | 'MISSING';

export interface BidderDocument {
  id: string;
  bidderId: string;
  documentCode: string;
  documentName: string;
  documentType: GroundTruthDocumentType;
  pageNumber: number;
  documentDate?: string;
  validFrom?: string;
  validUntil?: string;
  documentStatus: DocumentStatus;
  fileName: string;
}

export type EvidenceType =
  | 'TURNOVER'
  | 'EXPERIENCE'
  | 'AUTHORIZATION'
  | 'STATUTORY_ID'
  | 'LOCATION'
  | 'MII'
  | 'EMD'
  | 'LICENSE'
  | 'TAX_FILING'
  | 'DECLARATION'
  | 'TECHNICAL_SPEC'
  | 'FINANCIAL_STANDING';

export interface BidderEvidence {
  id: string;
  bidderId: string;
  documentId: string;
  evidenceType: EvidenceType;
  fieldName: string;
  extractedValue: string;
  normalizedValue: string | number | boolean | null;
  unit?: string;
  confidence: number;
  sourcePage: number;
  sourceText: string;
}

export type GroundTruthComplianceStatus =
  | 'PASS'
  | 'FAIL'
  | 'REVIEW'
  | 'NOT_APPLICABLE'
  | 'PENDING';

export interface GroundTruthComplianceResult {
  id: string;
  bidderId: string;
  requirementId: string;
  status: GroundTruthComplianceStatus;
  submittedValue: string;
  requiredValue: string;
  reason: string;
  evidenceId: string;
  confidence: number;
  reviewRequired: boolean;
}

export type BenchmarkStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'REVIEW';

export interface BidderBenchmark {
  bidderId: string;
  bidderCode: string;
  legalName: string;
  tenderId: string;
  bidNumber: string;
  benchmarkStatus: BenchmarkStatus;
  benchmarkLabel: string;
  summaryReason: string;
  failingRequirementsCount: number;
  reviewRequirementsCount: number;
  passingRequirementsCount: number;
}
