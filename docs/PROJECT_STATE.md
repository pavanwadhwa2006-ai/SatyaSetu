# Satyaseetu Project State

**Last Updated:** August 2026 (Phase 6 Completed)

---

## 1. Project Overview & Progress Summary

Satyaseetu is an AI-powered integrated bid compliance verification platform for GeM procurement.

| Phase | Title | Status | Notes |
|---|---|---|---|
| **Phase 1** | Foundation | **DONE** | FastAPI, Supabase, Auth, RBAC, RLS, Schema, Health & Core APIs verified |
| **Phase 2** | Tender Dataset | **DONE** | 5 actual GeM tenders loaded, deterministic seed, document metadata associated |
| **Phase 3** | Ground Truth | **DONE** | Canonical tender + bidder ground truth data layer, independent requirements & evidence |
| **Phase 4** | Synthetic Documents | **DONE** | 36 realistic synthetic bidder PDFs generated across 5 packages with watermarks |
| **Phase 5** | Tender Intelligence | **DONE** | Machine-readable requirement model, field normalization, percentage bases, exemption rules |
| **Phase 6** | Bidder Submission | **DONE** | End-to-end frontend → FastAPI → Supabase workflow, multi-document PDF uploads & storage |
| **Phase 7** | Document Intelligence | **NOT STARTED** | OCR/document parsing/fact extraction pipeline |
| **Phase 8–19** | Future Phases | **NOT STARTED** | Evidence layer, rules engine, compliance, risk, officer dashboard |

---

## 2. Phase 6 Bidder Submission Layer

Phase 6 implements the complete, secure end-to-end Bidder Submission workflow linking the Next.js frontend with FastAPI backend APIs, Supabase `bid_submissions` & `vendor_documents` tables, and Supabase Storage.

### Workflow & Lifecycle Architecture

```
Frontend (Next.js)
  │
  ├─ 1. View Tenders (/bidder/tenders) ──► GET /api/tenders
  │
  ├─ 2. Start Bid (/bidder/tenders/[id]) ─► POST /api/bid-submissions (Creates DRAFT)
  │
  ├─ 3. Upload PDFs (Workspace) ─────────► POST /api/bid-submissions/{id}/documents
  │                                         ├─ Stores in Supabase Storage & local mirror
  │                                         └─ Inserts into vendor_documents table
  │
  ├─ 4. List Uploads & Previews ─────────► GET /api/bid-submissions/{id}/documents
  │
  └─ 5. Finalize Submission ─────────────► POST /api/bid-submissions/{id}/submit
                                            ├─ Transitions status: DRAFT -> SUBMITTED
                                            └─ Locks further uploads/deletions
```

### Key Security & Integrity Controls

1. **Zero Client-Side Privileges:** Frontend never communicates with privileged Supabase service keys. All storage and database calls are brokered through FastAPI backend endpoints.
2. **File Validation:** Strictly validates file type (`.pdf`), file header, and file size (max 25MB). Rejects executables or invalid formats.
3. **Storage Sanitization:** Sanitizes filenames against path traversal attacks. Storage paths follow a deterministic pattern: `vendor-documents/{tender_id}/{submission_id}/{document_id}_{safe_filename}`.
4. **Lifecycle Modification Locks:** Once a bid transitions to `SUBMITTED`, all modification endpoints (`POST /documents`, `DELETE /documents`) are strictly rejected.
5. **No Premature Evaluation:** Phase 6 solely ingests and tracks documents with status `UPLOADED`. Document presence is never interpreted as proof of compliance at this stage.

---

## 3. API Endpoints

- `POST /api/bid-submissions` — Creates or resumes a DRAFT bid submission for a tender and vendor.
- `GET /api/bid-submissions` — Lists bid submissions with optional `vendor_id`, `tender_id`, or `status` filtering.
- `GET /api/bid-submissions/{id}` — Returns full bid submission details with attached vendor documents and tender metadata.
- `POST /api/bid-submissions/{id}/documents` — Uploads and stores a PDF document with its classification tag.
- `GET /api/bid-submissions/{id}/documents` — Lists all uploaded documents for a bid.
- `GET /api/bid-submissions/{id}/documents/{doc_id}/download` — Streams/downloads stored PDF document.
- `DELETE /api/bid-submissions/{id}/documents/{doc_id}` — Deletes an uploaded document (DRAFT only).
- `POST /api/bid-submissions/{id}/submit` — Finalizes the bid submission and locks documents.

---

## 4. Frontend Routes & Components

- `/bidder/tenders` — Available GeM tenders list loaded live from FastAPI.
- `/bidder/tenders/[id]` — Tender specifications overview with "Start Bid Submission" action.
- `/bidder/tenders/[id]/bid` — Dedicated Bid Submission Workspace:
  - Vendor identity selection (supports canonical demo bidders)
  - Submission status banner (`DRAFT` vs `SUBMITTED`)
  - Document type dropdown and file uploader
  - Real-time uploaded documents table with view/download and delete actions
  - Submit / Finalize action with confirmation.
- `/bidder/bids` — "My Bid Submissions" dashboard with live status tracking.

---

## 5. How to Run and Test

### Backend Test Suite:
```bash
cd backend
python -m pytest -v
```

Verified Test Suites:
- `tests/test_bid_submissions.py` (5 test scenarios) — **100% PASS**
- `tests/test_tender_intelligence.py` (10 test scenarios) — **100% PASS**
- `tests/test_synthetic_docs.py` (5 test scenarios) — **100% PASS**
- `tests/test_ground_truth.py` (4 test scenarios) — **100% PASS**
- `tests/test_tenders.py` & `tests/test_health.py` (7 test scenarios) — **100% PASS**
- **Total: 31 / 31 backend tests passing.**

### Frontend Build:
```bash
npm run build
```
- Next.js static build verified with complete pre-rendering and 0 TypeScript errors.

---

## 6. Next Implementation Step

**Phase 7 — Document Intelligence**
- Build OCR, classification, and structured fact extraction pipeline for uploaded vendor PDFs.
