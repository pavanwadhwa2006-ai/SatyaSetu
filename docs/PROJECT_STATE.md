# Satyaseetu Project State

**Last Updated:** August 2026 (Phase 7 Completed)

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
| **Phase 7** | Document Intelligence | **DONE** | PDF parsing, classification, fact extraction, numeric normalization, page & quote provenance |
| **Phase 7.1** | Frontend Integration | **DONE** | Complete removal of static frontend mock data; 100% connected to live FastAPI & Supabase |
| **Phase 8** | Evidence Layer | **NOT STARTED** | Page/source traceability linking facts to evaluation criteria |
| **Phase 9–19** | Future Phases | **NOT STARTED** | Mock verification, cross-document, rules engine, compliance, risk, officer dashboard |

---

## 2. Phase 7 Document Intelligence Layer

Phase 7 builds the Document Intelligence engine that ingests uploaded bidder PDFs from Supabase Storage and transforms them into structured domain facts with verifiable page numbers and verbatim quotations.

### Architecture & Extraction Flow

```
Uploaded Bidder PDF (Supabase Storage / Local Mirror)
  │
  ▼
pypdf Text Extraction (Page-by-page tokenization & text layout)
  │
  ▼
Document Classifier (Taxonomy mapping: TURNOVER_CERTIFICATE, MAF, CRAC, PO, UDYAM, DPIIT, ELECTRICAL_LICENSE, GSTR-3B, MII, AFFIDAVIT, SOLVENCY, TECHNICAL_PROPOSAL)
  │
  ▼
Deterministic Fact Extractor (Structured regex & table parsing)
  ├── Canonical Field Name (e.g. bidder_turnover_annual_avg, electrical_contractor_license, local_content_percentage)
  ├── Raw Display Value (e.g. "₹49,17,000", "Class-A (CLASS_A_ACTIVE)", "8,000 Units", "78.4% Local Content")
  ├── Normalized Value (e.g. 4917000, "CLASS_A_ACTIVE", 8000, 0.784)
  ├── Measurement Unit (INR, UNITS, PERCENT, DAYS, YEARS)
  ├── 1-Indexed Source Page Number
  ├── Verbatim Text Quotation (Sentence/Line from PDF)
  └── Confidence Score (Transparent 0.95 - 0.99 for deterministic extraction)
  │
  ▼
Processing Status Transition (vendor_documents.processing_status = 'PROCESSED')
```

### Strict Phase Boundaries Enforced

1. **Information Extraction Only:** Document Intelligence solely extracts facts present in the text. It does NOT decide whether a bidder PASSES or FAILS or is COMPLIANT/NON-COMPLIANT.
2. **Zero Benchmark Leakage:** Benchmark verdicts from Ground Truth are never emitted or leaked into extracted facts.
3. **Traceability:** Every extracted fact maintains source page provenance and verbatim quotation for future evidence verification.

---

## 3. API Endpoints

- `POST /api/documents/{document_id}/process` — Processes a single uploaded PDF document and returns extracted facts.
- `GET /api/documents/{document_id}/facts` — Retrieves all extracted structured facts for a document.
- `POST /api/bid-submissions/{submission_id}/process` — Batch processes all documents attached to a bid submission.
- `GET /api/bid-submissions/{submission_id}/facts` — Aggregates all extracted facts across all documents in a submission.

---

## 4. Frontend Routes & Components

- `/bidder/tenders/[id]/bid` — Interactive Bid Submission Workspace with inline Document Intelligence:
  - Document status badge (`PROCESSED` vs `UPLOADED`)
  - "Run Document Intelligence" batch extraction action
  - Per-document expandable facts card displaying canonical field names, values, normalized values, page provenance, verbatim quotes, and confidence scores.

---

## 5. How to Run and Test

### Backend Test Suite:
```bash
cd backend
python -m pytest -v
```

Verified Test Suites:
- `tests/test_document_intelligence.py` (10 test scenarios) — **100% PASS**
- `tests/test_bid_submissions.py` (5 test scenarios) — **100% PASS**
- `tests/test_tender_intelligence.py` (10 test scenarios) — **100% PASS**
- `tests/test_synthetic_docs.py` (5 test scenarios) — **100% PASS**
- `tests/test_ground_truth.py` (4 test scenarios) — **100% PASS**
- `tests/test_tenders.py` & `tests/test_health.py` (7 test scenarios) — **100% PASS**
- **Total: 41 / 41 backend tests passing (100%).**

### Frontend Build:
```bash
npm run build
```
- Next.js static build verified with complete pre-rendering and 0 TypeScript errors.

---

## 6. Next Implementation Step

**Phase 8 — Evidence Layer**
- Page and source traceability linking extracted facts to evaluation criteria.
