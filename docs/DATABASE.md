# Satyaseetu Database Plan

## Core Tables
- users
- tenders
- tender_documents
- requirements
- vendors
- bid_submissions
- vendor_documents
- evidence
- verification_results
- compliance_results
- review_decisions
- risk_flags
- audit_logs
- document_chunks
- embeddings

## Key Relationship
Every compliance result should connect:
Tender + Vendor + Requirement + Evidence + Verification + Rule + Review

## Phase 1
Only create the foundation needed for:
- users
- tenders
- tender_documents
- vendors
- bid_submissions
- vendor_documents

Do not over-engineer all later tables before their phase.
