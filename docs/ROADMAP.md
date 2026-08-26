# Satyaseetu Development Roadmap

## Phase 1 — Foundation
Database, authentication, RBAC, backend/API contracts, storage foundation, environment configuration, project integration.

## Phase 2 — Real Tender Dataset
Collect and normalize several real/public GeM tender records. Select one primary demo tender.

## Phase 3 — Ground Truth Dataset
Create controlled expected bidder facts and expected compliance outcomes.

## Phase 4 — Synthetic Bidder Document Generator
Generate realistic synthetic PDFs/images containing fictional data and clearly marked hackathon-only labels.

## Phase 5 — Tender Intelligence
Tender PDF → text/OCR → AI requirement extraction → classification → normalization → editable requirement matrix.

## Phase 6 — Bidder Submission
Bidder → tender selection → bid submission → document upload → persistent storage/database.

## Phase 7 — Document Intelligence
OCR/text extraction → document classification → field/entity extraction → page-level evidence.

## Phase 8 — Evidence Layer
Persist document/page/source mapping for every extracted fact and compliance result.

## Phase 9 — Mock Verification Gateway
Adapter-based mock GST/PAN/Udyam/company verification.

## Phase 10 — Cross-Document Consistency
Detect identity, model, date, financial, quantity and other contradictions.

## Phase 11 — Deterministic Rules Engine
Evaluate structured facts against tender requirements.

## Phase 12 — Compliance
Generate GREEN/RED/YELLOW results with evidence.

## Phase 13 — Risk Engine
Aggregate failed mandatory requirements, missing evidence, conflicts, expiry, mismatch and uncertainty into explainable risk flags.

## Phase 14 — Human Review
Review queue for YELLOW cases with approve/reject/override/comment and audit trail.

## Phase 15 — Officer Dashboard
Connect existing UI to real API/database responses and support multi-bidder comparison.

## Phase 16 — Report + Audit
Generate evidence-backed compliance report and complete audit history.

## Phase 17 — RAG/Semantic Analysis
Add only where useful for semantic experience/technical interpretation.

## Phase 18 — Security + Benchmark
Authentication, RBAC, secure uploads, file validation, benchmark against ground truth, measured metrics.

## Phase 19 — Demo Polish
Fresh-data end-to-end run, error handling, loading states, performance, presentation and 2–3 minute demo rehearsal.

## Rule
Do not develop everything simultaneously. Finish and test each phase before expanding scope.
