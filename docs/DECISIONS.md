# Satyaseetu Architecture Decisions

## Decision 001 — GeM is not replaced
Satyaseetu is a compliance verification and decision-support layer around procurement workflows.

## Decision 002 — Mock government verification
Production government APIs are not assumed to be available or authorized for the student prototype. Use adapter-based mock/sandbox verification and label it honestly.

## Decision 003 — AI does not make final compliance decisions
AI extracts/interprets information. Deterministic rules evaluate exact requirements. Human officers retain final authority.

## Decision 004 — Synthetic bidder documents
Because real bidder submissions may be confidential/unavailable, use realistic fictional documents with known ground truth.

## Decision 005 — Evidence-first
Every important extracted fact/compliance result must retain document and page provenance.

## Decision 006 — Existing prototype is preserved
The current UI is the product foundation. Backend functionality is built underneath it rather than rebuilding the interface unnecessarily.

## Decision 007 — Real GeM Tender Dataset & Document Association Strategy
In Phase 2, the placeholder synthetic tenders were replaced by five real GeM tenders representing distinct categories (Engineering Software, Chair Manufacturing, Electrical Maintenance, IT QCBS, and Multimedia/Manpower). Each tender maintains source provenance (`source = 'GEM_PUBLIC'`) and links directly to associated document metadata in `tender_documents`. The seed mechanism is strictly idempotent using `ON CONFLICT (tender_number)` upserts.

## Decision 008 — Canonical Ground Truth Data Layer & Independent Requirement Evaluation
In Phase 3, the ground truth evaluation standard was decoupled from raw document text. Compliance is calculated independently by comparing structured tender requirements (with explicit types, operators, and thresholds) against structured bidder evidence (with field names, normalized values, confidence, and page provenance). The 5 canonical bidder packages across 3 tenders are normalized (including normalising Apex Electrical to T3-B1) with reproducible master benchmark assertions (Nexus: NON_COMPLIANT, Vanguard: COMPLIANT, Zenith: REVIEW, Apex: COMPLIANT, Voltech: NON_COMPLIANT).

## Decision 009 — Synthetic Bidder Document Generation & Watermarking
In Phase 4, 36 realistic synthetic PDF documents were generated across 5 bidder packages matching the Phase 3 Ground Truth dataset. Each PDF features structured business context (CA turnover certificates, POs, CRAC forms, Udyam slips, licensing certificates, e-stamp affidavits) with an explicit watermark (`*** SYNTHETIC DATA — FOR HACKATHON DEMONSTRATION ONLY ***`). Direct answer leakage is strictly prohibited: filenames and body text contain realistic evidence from which future phases (OCR, extraction, rules) will independently derive compliance.

## Decision 010 — Tender Intelligence & Machine-Readable Requirement Specifications
In Phase 5, all 34 canonical requirements across the 3 active tenders were transformed into machine-readable specifications. Each requirement defines standardized fields (`normalizedField`), controlled types (`FINANCIAL`, `EXPERIENCE`, `TECHNICAL`, `STATUTORY`, `DOCUMENT`, `VALIDITY`, `LOCATION`, `QUANTITY`, `OEM`, `MII`, `MSE`, `STARTUP`, `EMD`, `DELIVERY`), controlled operators (`>=`, `<=`, `==`, `VALID`, `MATCH`, `PERCENT_OF`, `EXISTS`), numeric normalizations (e.g. ₹5.00L -> 500000 INR), percentage/base relationships (e.g. 15% of `tender.estimatedValue`, 10% of `tender.totalQuantity`), structured exemption metadata, and acceptable documentary evidence types.

## Decision 011 — Bidder Submission Workflow & Storage Persistence
In Phase 6, the end-to-end bidder submission workflow was built connecting Next.js frontend with FastAPI backend APIs, Supabase database tables (`bid_submissions`, `vendor_documents`), and Supabase Storage. Privileged credentials are strictly kept server-side. File uploads are validated (strictly PDF, max 25MB), sanitized against path traversal, and stored under `vendor-documents/{tender_id}/{submission_id}/{document_id}_{filename}`. Submissions follow a clear lifecycle (`DRAFT` -> `SUBMITTED`), with edit/upload locking enforced immediately upon submission. Document ingestion status is preserved as `UPLOADED` without premature compliance evaluation.
