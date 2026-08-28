/**
 * SatyaSetu Frontend — API Client
 * Connects frontend workflows to FastAPI backend endpoints.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface StoredVendorDocument {
  id: string;
  bid_submission_id: string;
  vendor_id: string;
  original_filename: string;
  storage_path?: string;
  mime_type?: string;
  file_size?: number;
  document_type?: string;
  processing_status: string;
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
  documents_count: number;
}

export async function fetchBackendTenders() {
  const res = await fetch(`${API_BASE}/tenders?limit=50`);
  if (!res.ok) throw new Error("Failed to fetch tenders from backend");
  return res.json();
}

export async function fetchBackendTenderById(tenderId: string) {
  const encoded = encodeURIComponent(tenderId);
  const res = await fetch(`${API_BASE}/tenders/${encoded}`);
  if (!res.ok) throw new Error(`Failed to fetch tender ${tenderId}`);
  return res.json();
}

export async function fetchTenderIntelligenceRequirements(tenderId: string) {
  const encoded = encodeURIComponent(tenderId);
  const res = await fetch(`${API_BASE}/tender-intelligence/${encoded}/requirements`);
  if (!res.ok) throw new Error(`Failed to fetch requirements for ${tenderId}`);
  return res.json();
}

export async function createOrResumeBidSubmission(tenderId: string, vendorId?: string): Promise<StoredBidSubmission> {
  const res = await fetch(`${API_BASE}/bid-submissions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tender_id: tenderId, vendor_id: vendorId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to start bid submission");
  }
  return res.json();
}

export async function fetchBidSubmissions(vendorId?: string, tenderId?: string): Promise<{ items: StoredBidSubmission[]; total: number }> {
  const params = new URLSearchParams();
  if (vendorId) params.set("vendor_id", vendorId);
  if (tenderId) params.set("tender_id", tenderId);
  const res = await fetch(`${API_BASE}/bid-submissions?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch bid submissions");
  return res.json();
}

export async function fetchBidSubmissionById(submissionId: string): Promise<StoredBidSubmission> {
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}`);
  if (!res.ok) throw new Error("Failed to fetch bid submission details");
  return res.json();
}

export async function uploadBidDocument(
  submissionId: string,
  file: File,
  documentType?: string
): Promise<StoredVendorDocument> {
  const formData = new FormData();
  formData.append("file", file);
  if (documentType) {
    formData.append("document_type", documentType);
  }

  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/documents`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to upload document");
  }
  return res.json();
}

export async function deleteBidDocument(submissionId: string, documentId: string): Promise<{ deleted: boolean }> {
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete document");
  }
  return res.json();
}

export async function finalizeBidSubmission(submissionId: string): Promise<{ id: string; status: string; submitted_at: string; message: string }> {
  const res = await fetch(`${API_BASE}/bid-submissions/${submissionId}/submit`, {
    method: "POST",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to finalize and submit bid");
  }
  return res.json();
}
