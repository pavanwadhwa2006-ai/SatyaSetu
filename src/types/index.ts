// ============================================================
// BidSure AI — Core Type Definitions
// AI-Powered Bid Compliance Verification Platform
// ============================================================

// --- Tender Types ---

export type TenderStatus = 'OPEN' | 'EVALUATION' | 'CLOSED' | 'AWARDED';

export interface TenderRequirement {
  id: string;
  name: string;
  description: string;
  category: 'MANDATORY' | 'TECHNICAL' | 'FINANCIAL' | 'PREFERENTIAL';
  isMandatory: boolean;
}

export interface Tender {
  id: string;
  title: string;
  organization: string;
  department: string;
  category: string;
  estimatedValue: number;
  estimatedValueFormatted: string;
  publishDate: string;
  submissionDeadline: string;
  bidValidityDays: number;
  evaluationType: string;
  status: TenderStatus;
  description: string;
  requirements: TenderRequirement[];
  deliveryLocation: string;
  deliveryPeriodDays: number;
  warrantyMonths: number;
  emdAmount: number;
  emdAmountFormatted: string;
}

// --- Bidder Types ---

export interface Bidder {
  id: string;
  legalName: string;
  shortName: string;
  pan: string;
  gstin: string;
  udyamNumber: string;
  registrationNumber: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  authorizedRepresentative: string;
  email: string;
  phone: string;
  incorporationYear: number;
  turnover: number;
  turnoverFormatted: string;
  employeeCount: number;
  msmeCategory: string | null;
}

// --- Bid Types ---

export type BidStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_EVALUATION' | 'QUALIFIED' | 'DISQUALIFIED' | 'CLARIFICATION_REQUESTED';

export interface BidCommercial {
  quotedAmount: number;
  quotedAmountFormatted: string;
  taxPercentage: number;
  taxAmount: number;
  totalAmount: number;
  totalAmountFormatted: string;
}

export interface BidTechnical {
  productModel: string;
  specifications: string;
  deliveryPeriodDays: number;
  warrantyMonths: number;
  experienceYears: number;
  experienceDetails: string;
  miiPercentage: number;
}

export interface Bid {
  id: string;
  tenderId: string;
  bidderId: string;
  bidder: Bidder;
  status: BidStatus;
  submittedAt: string;
  commercial: BidCommercial;
  technical: BidTechnical;
  documentIds: string[];
}

// --- Document Types ---

export type DocumentType =
  | 'PAN_CERTIFICATE'
  | 'GST_CERTIFICATE'
  | 'UDYAM_CERTIFICATE'
  | 'COMPANY_REGISTRATION'
  | 'TURNOVER_CERTIFICATE'
  | 'EXPERIENCE_CERTIFICATE'
  | 'OEM_AUTHORIZATION'
  | 'TECHNICAL_COMPLIANCE'
  | 'PRODUCT_DATASHEET'
  | 'WARRANTY_DECLARATION'
  | 'DELIVERY_UNDERTAKING'
  | 'MII_DECLARATION'
  | 'MSE_CERTIFICATE';

export type ExtractionStatus = 'PENDING' | 'EXTRACTED' | 'FAILED';
export type VerificationStatus = 'PENDING' | 'PASS' | 'FAIL' | 'REVIEW';

export interface ExtractedField {
  fieldName: string;
  extractedValue: string;
  confidence: number;
}

export interface BidDocument {
  id: string;
  bidId: string;
  bidderId: string;
  type: DocumentType;
  typeName: string;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  pageCount: number;
  extractionStatus: ExtractionStatus;
  verificationStatus: VerificationStatus;
  confidence: number;
  extractedFields: ExtractedField[];
}

// --- Compliance Types ---

export type ComplianceStatus = 'PASS' | 'FAIL' | 'REVIEW';

export interface ComplianceItem {
  requirementId: string;
  requirementName: string;
  status: ComplianceStatus;
  evidenceDocument: string | null;
  evidencePage: number | null;
  extractedValue: string | null;
  expectedValue: string | null;
  reason: string;
  confidence: number;
}

export interface ComplianceResult {
  bidderId: string;
  bidId: string;
  tenderId: string;
  overallStatus: ComplianceStatus;
  complianceScore: number;
  totalRequirements: number;
  passedRequirements: number;
  failedRequirements: number;
  reviewRequirements: number;
  items: ComplianceItem[];
}

// --- Verification Types ---

export interface VerificationRecord {
  id: string;
  bidderId: string;
  verificationType: 'GST' | 'PAN' | 'UDYAM' | 'COMPANY';
  verificationSource: string;
  sourceLabel: string;
  submittedData: Record<string, string>;
  verificationData: Record<string, string>;
  status: VerificationStatus;
  discrepancies: string[];
  verifiedAt: string;
}

// --- Risk Types ---

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskFlag {
  id: string;
  description: string;
  severity: RiskLevel;
  category: string;
  relatedRequirement: string | null;
  relatedDocument: string | null;
}

export interface RiskAssessment {
  bidderId: string;
  bidId: string;
  riskLevel: RiskLevel;
  riskScore: number;
  maxScore: number;
  flags: RiskFlag[];
  recommendedAction: string;
}

// --- AI Recommendation Types ---

export interface AIRecommendation {
  bidderId: string;
  bidId: string;
  tenderId: string;
  recommendation: 'QUALIFY' | 'DISQUALIFY' | 'REVIEW_BEFORE_DECISION';
  recommendationLabel: string;
  reasonSummary: string[];
  evidenceReferences: {
    document: string;
    page: number;
    detail: string;
  }[];
  disclaimer: string;
  generatedAt: string;
}

// --- Verification Reasoning Types ---

export interface VerificationReasoning {
  requirementId: string;
  requirementText: string;
  evidenceDocument: string | null;
  evidencePage: number | null;
  extractedValue: string | null;
  rule: string;
  result: ComplianceStatus;
  confidence: number;
  reasoning: string;
}

// --- Officer Decision Types ---

export type DecisionType = 'APPROVE' | 'REJECT' | 'CLARIFICATION';

export interface OfficerDecision {
  bidderId: string;
  bidId: string;
  tenderId: string;
  decision: DecisionType;
  decisionLabel: string;
  remarks: string;
  decidedBy: string;
  decidedAt: string;
}

// --- Audit Types ---

export type AuditEventType =
  | 'BID_SUBMITTED'
  | 'DOCUMENTS_UPLOADED'
  | 'EXTRACTION_COMPLETED'
  | 'VERIFICATION_COMPLETED'
  | 'MISMATCH_DETECTED'
  | 'COMPLIANCE_ANALYZED'
  | 'RECOMMENDATION_GENERATED'
  | 'OFFICER_REVIEWED'
  | 'DECISION_RECORDED';

export interface AuditEvent {
  id: string;
  timestamp: string;
  timeFormatted: string;
  eventType: AuditEventType;
  description: string;
  actor: string;
  details: string | null;
}

// --- Auth Types ---

export type UserRole = 'bidder' | 'officer';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  organization: string;
  designation: string;
}
