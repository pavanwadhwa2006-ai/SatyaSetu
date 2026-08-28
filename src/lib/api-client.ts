/**
 * SatyaSetu Frontend API Client
 * Typed async client for FastAPI endpoints (Tenders, Submissions, Storage, and Document Intelligence).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

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
  tender?: any;
  vendor?: any;
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

export async function fetchBackendTenders(): Promise<{ items: any[]; total: number }> {
  const res = await fetch(`${API_BASE}/tenders?limit=50`);
  if (!res.ok) throw new Error(`Failed to fetch tenders: ${res.statusText}`);
  return res.json();
}

export async function fetchBackendTenderById(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/tenders/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`Failed to fetch tender: ${res.statusText}`);
  return res.json();
}

export async function createOrResumeBidSubmission(
  tenderId: string,
  vendorNameOrId?: string
): Promise<StoredBidSubmission> {
  const res = await fetch(`${API_BASE}/bid-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

  const res = await fetch(`${API_BASE}/bid-submissions?${query.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch bid submissions: ${res.statusText}`);
  return res.json();
}

export async function fetchBidSubmissionById(id: string): Promise<StoredBidSubmission> {
  const res = await fetch(`${API_BASE}/bid-submissions/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch bid submission: ${res.statusText}`);
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

  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/documents`, {
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
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to delete document");
  }
  return res.json();
}

export async function finalizeBidSubmission(submissionId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/submit`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to finalize bid submission");
  }
  return res.json();
}

// ── Document Intelligence Client Functions ────────────────────────────────────

export async function processDocument(documentId: string): Promise<DocumentProcessResult> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/process`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to process document with Document Intelligence");
  }
  return res.json();
}

export async function fetchDocumentFacts(documentId: string): Promise<DocumentFact[]> {
  const res = await fetch(`${API_BASE}/documents/${documentId}/facts`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to fetch document facts");
  }
  return res.json();
}

export async function processSubmissionDocuments(submissionId: string): Promise<SubmissionFactsResult> {
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/process`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to process submission documents");
  }
  return res.json();
}

export async function fetchSubmissionFacts(submissionId: string): Promise<SubmissionFactsResult> {
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/facts`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Failed to fetch submission facts");
  }
  return res.json();
}
