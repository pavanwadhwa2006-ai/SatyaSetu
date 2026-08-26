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
