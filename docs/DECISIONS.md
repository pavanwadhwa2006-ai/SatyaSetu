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
