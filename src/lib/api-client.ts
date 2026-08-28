/**
 * SatyaSetu Frontend API Client
 * Centralized typed client for all FastAPI backend endpoints:
 * - Tenders (Listing, Details, Search)
 * - Vendors (Profile listing, Registration)
 * - Dashboard Analytics & Real Database Statistics
 * - Tender Intelligence (Structured Requirements, Summaries)
 * - Ground Truth Benchmarks & Canonical Data Layer
 * - Bid Submissions & Document Upload Persistence
 * - Document Intelligence & Extracted Facts
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Models ────────────────────────────────────────────────────────────────────

export interface BackendTenderDocument {
  id: string;
  tender_id: string;
  document_name: string;
  document_type: string;
  file_url?: string;
  is_mandatory: boolean;
  created_at: string;
}

export interface BackendTender {
  id: string;
  tender_number: string;
  title: string;
  organization: string;
  department?: string;
  category: string;
  description?: string;
  source: string;
  status: "OPEN" | "EVALUATION" | "CLOSED" | "AWARDED";
  estimated_value: number;
  submission_deadline: string;
  publish_date: string;
  bid_validity_days: number;
  evaluation_type: string;
  delivery_location?: string;
  delivery_period_days?: number;
  warranty_months?: number;
  emd_amount?: number;
  created_at: string;
  updated_at: string;
  documents?: BackendTenderDocument[];
}

export interface BackendVendor {
  id: string;
  legal_name: string;
  display_name?: string;
  business_type?: string;
  pan_number?: string;
  gstin?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
}

export interface DashboardStats {
  active_tenders: number;
  total_tenders: number;
  total_bids: number;
  submitted_bids: number;
  draft_bids: number;
  total_vendors: number;
}

export interface StructuredRequirement {
  id: string;
  tenderId: string;
  gemBidNumber: string;
  requirementCode: string;
  requirementName: string;
  category: string;
  clauseReference: string;
  rawText: string;
  isMandatory: boolean;
  evaluationStage: string;
  field: string;
  operator: string;
  threshold: any;
  unit?: string;
  percentageBasis?: string;
  percentageBasisField?: string;
  exemptionAllowed: boolean;
  exemptionCategories: string[];
  exemptionRequiresEvidence: boolean;
  acceptableEvidenceTypes: string[];
  targetEntity: string;
  sourcePageNumber: number;
  sourceDocumentRef: string;
}

export interface TenderIntelligenceSummary {
  tender_id: string;
  gem_bid_number: string;
  title: string;
  estimated_value?: number;
  total_requirements_count: number;
  mandatory_count: number;
  optional_count: number;
  financial_requirements_count: number;
  experience_requirements_count: number;
  technical_requirements_count: number;
  statutory_requirements_count: number;
  oem_requirements_count: number;
  exemption_eligible_count: number;
  categories: Record<string, number>;
}

export interface StoredVendorDocument {
  id: string;
  bid_submission_id: string;
  vendor_id: string;
  original_filename: string;
  storage_path: string;
  mime_type?: string;
  file_size?: number;
  document_type?: string;
  processing_status: "UPLOADED" | "PROCESSING" | "PROCESSED" | "FAILED";
  uploaded_by?: string;
  created_at: string;
  download_url?: string;
}

export interface StoredBidSubmission {
  id: string;
  tender_id: string;
  vendor_id: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_EVALUATION" | "QUALIFIED" | "DISQUALIFIED" | "CLARIFICATION_REQUESTED";
  submitted_at?: string;
  created_at: string;
  updated_at: string;
  tender?: BackendTender;
  vendor?: BackendVendor;
  documents: StoredVendorDocument[];
  documents_count?: number;
}

export interface DocumentFact {
  id: string;
  vendor_document_id: string;
  field_name: string;
  value: string;
  normalized_value?: any;
  unit?: string;
  source_page: number;
  source_section?: string;
  raw_quote: string;
  confidence: number;
  extraction_method: string;
  created_at: string;
}

export interface DocumentProcessResult {
  document_id: string;
  bid_submission_id: string;
  vendor_id: string;
  original_filename: string;
  document_type: string;
  processing_status: "PROCESSED" | "FAILED";
  extracted_pages_count: number;
  extracted_facts_count: number;
  facts: DocumentFact[];
  error_message?: string;
  message: string;
}

export interface SubmissionFactsResult {
  submission_id: string;
  documents_processed_count: number;
  total_facts_count: number;
  documents: DocumentProcessResult[];
}

export interface GroundTruthBenchmark {
  bidderId: string;
  bidderCode: string;
  bidderName: string;
  tenderId: string;
  expectedOverallStatus: "COMPLIANT" | "NON_COMPLIANT" | "REVIEW";
  expectedComplianceScore: number;
  expectedRiskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  expectedPassedCount: number;
  expectedFailedCount: number;
  expectedReviewCount: number;
  totalRequirementsCount: number;
  rationale: string;
}

// ── Tenders API ───────────────────────────────────────────────────────────────

export async function fetchBackendTenders(params?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: BackendTender[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.limit) query.set("limit", params.limit.toString());
  if (params?.offset) query.set("offset", params.offset.toString());

  const res = await fetch(`${API_BASE}/tenders?${query.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch tenders from backend: ${res.statusText}`);
  return res.json();
}

export async function fetchBackendTenderById(id: string): Promise<BackendTender> {
  const res = await fetch(`${API_BASE}/tenders/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch tender '${id}': ${res.statusText}`);
  return res.json();
}

// ── Vendors API ───────────────────────────────────────────────────────────────

export async function fetchBackendVendors(): Promise<{ items: BackendVendor[]; total: number }> {
  const res = await fetch(`${API_BASE}/vendors?limit=100`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch vendors: ${res.statusText}`);
  return res.json();
}

// ── Dashboard Statistics API ──────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/dashboard/stats`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    // Graceful fallback to real live count by querying tenders & submissions
    try {
      const [tendersRes, bidsRes, vendorsRes] = await Promise.all([
        fetchBackendTenders(),
        fetchBidSubmissions(),
        fetchBackendVendors(),
      ]);
      return {
        active_tenders: tendersRes.items.filter((t) => t.status === "OPEN").length,
        total_tenders: tendersRes.total || tendersRes.items.length,
        total_bids: bidsRes.total || bidsRes.items.length,
        submitted_bids: bidsRes.items.filter((b) => b.status === "SUBMITTED").length,
        draft_bids: bidsRes.items.filter((b) => b.status === "DRAFT").length,
        total_vendors: vendorsRes.total || vendorsRes.items.length,
      };
    } catch {
      throw new Error(`Failed to fetch dashboard statistics: ${res.statusText}`);
    }
  }
  return res.json();
}

// ── Tender Intelligence API (Phase 5) ─────────────────────────────────────────

export async function fetchTenderRequirements(tenderId: string): Promise<{ items: StructuredRequirement[]; total: number }> {
  const res = await fetch(`${API_BASE}/tender-intelligence/${encodeURIComponent(tenderId)}/requirements`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch structured requirements for tender '${tenderId}': ${res.statusText}`);
  return res.json();
}

export async function fetchTenderIntelligenceSummary(tenderId: string): Promise<TenderIntelligenceSummary> {
  const res = await fetch(`${API_BASE}/tender-intelligence/${encodeURIComponent(tenderId)}/summary`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch intelligence summary for tender '${tenderId}': ${res.statusText}`);
  return res.json();
}

// ── Bid Submissions API (Phase 6) ─────────────────────────────────────────────

export async function createOrResumeBidSubmission(
  tenderId: string,
  vendorNameOrId?: string
): Promise<StoredBidSubmission> {
  const res = await fetch(`${API_BASE}/bid-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      tender_id: tenderId,
      vendor_id: vendorNameOrId || undefined,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to start or resume bid submission");
  }
  return res.json();
}

export async function fetchBidSubmissions(params?: {
  vendor_id?: string;
  tender_id?: string;
  status?: string;
}): Promise<{ items: StoredBidSubmission[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.vendor_id) query.set("vendor_id", params.vendor_id);
  if (params?.tender_id) query.set("tender_id", params.tender_id);
  if (params?.status) query.set("status", params.status);

  const res = await fetch(`${API_BASE}/bid-submissions?${query.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch bid submissions: ${res.statusText}`);
  return res.json();
}

export async function fetchBidSubmissionById(id: string): Promise<StoredBidSubmission> {
  const res = await fetch(`${API_BASE}/bid-submissions/${encodeURIComponent(id)}`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Failed to fetch bid submission '${id}': ${res.statusText}`);
  return res.json();
}

export async function uploadBidDocument(
  submissionId: string,
  file: File,
  documentType: string = "OTHER"
): Promise<StoredVendorDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("document_type", documentType);

  const res = await fetch(`${API_BASE}/bid-submissions/${encodeURIComponent(submissionId)}/documents`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function deleteBidDocument(
  submissionId: string,
  documentId: string
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/bid-submissions/${encodeURIComponent(submissionId)}/documents/${encodeURIComponent(documentId)}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to delete document");
  }
  return res.json();
}

export async function finalizeBidSubmission(submissionId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/bid-submissions/${encodeURIComponent(submissionId)}/submit`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to finalize bid submission");
  }
  return res.json();
}

// ── Document Intelligence API (Phase 7) ───────────────────────────────────────

export async function processDocument(documentId: string): Promise<DocumentProcessResult> {
  const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(documentId)}/process`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to process document with Document Intelligence");
  }
  return res.json();
}

export async function fetchDocumentFacts(documentId: string): Promise<DocumentFact[]> {
  const res = await fetch(`${API_BASE}/documents/${encodeURIComponent(documentId)}/facts`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to fetch document facts");
  }
  return res.json();
}

export async function processSubmissionDocuments(submissionId: string): Promise<SubmissionFactsResult> {
  const res = await fetch(`${API_BASE}/bid-submissions/${encodeURIComponent(submissionId)}/process`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to process submission documents");
  }
  return res.json();
}

export async function fetchSubmissionFacts(submissionId: string): Promise<SubmissionFactsResult> {
  const res = await fetch(`${API_BASE}/bid-submissions/${encodeURIComponent(submissionId)}/facts`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to fetch submission facts");
  }
  return res.json();
}

// ── Ground Truth API (Phase 3) ────────────────────────────────────────────────

export async function fetchGroundTruthTenders(): Promise<{ items: any[]; total: number }> {
  const res = await fetch(`${API_BASE}/ground-truth/tenders`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth tenders: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthBidders(): Promise<{ items: any[]; total: number }> {
  const res = await fetch(`${API_BASE}/ground-truth/bidders`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth bidders: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthBenchmarks(): Promise<{ items: GroundTruthBenchmark[]; total: number }> {
  const res = await fetch(`${API_BASE}/ground-truth/benchmarks`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth benchmarks: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthRequirements(tenderId?: string): Promise<{ items: any[]; total: number }> {
  const query = tenderId ? `?tender_id=${encodeURIComponent(tenderId)}` : "";
  const res = await fetch(`${API_BASE}/ground-truth/requirements${query}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth requirements: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthDocuments(bidderId?: string): Promise<{ items: any[]; total: number }> {
  const query = bidderId ? `?bidder_id=${encodeURIComponent(bidderId)}` : "";
  const res = await fetch(`${API_BASE}/ground-truth/documents${query}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth documents: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthEvidence(bidderId?: string): Promise<{ items: any[]; total: number }> {
  const query = bidderId ? `?bidder_id=${encodeURIComponent(bidderId)}` : "";
  const res = await fetch(`${API_BASE}/ground-truth/evidence${query}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth evidence: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthCompliance(bidderId?: string): Promise<{ items: any[]; total: number }> {
  const query = bidderId ? `?bidder_id=${encodeURIComponent(bidderId)}` : "";
  const res = await fetch(`${API_BASE}/ground-truth/compliance${query}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to fetch ground truth compliance: ${res.statusText}`);
  const data = await res.json();
  if (Array.isArray(data)) return { items: data, total: data.length };
  return data;
}

export async function fetchGroundTruthValidation(): Promise<any> {
  const res = await fetch(`${API_BASE}/ground-truth/validate`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Failed to validate ground truth benchmarks: ${res.statusText}`);
  return res.json();
}
