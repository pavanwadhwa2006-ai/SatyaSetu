# Satyaseetu Master Architecture

## Product Definition
AI-powered bid compliance verification and decision-support layer around procurement workflows.

GeM remains the official procurement platform.

## Target Workflow
1. Tender import/upload
2. Tender document processing
3. OCR/text/table extraction
4. AI requirement extraction
5. Structured requirement matrix
6. Bidder submissions
7. Bidder document processing
8. Document classification
9. Evidence extraction
10. Government Verification Gateway
11. Cross-document consistency
12. Deterministic Rules Engine + AI semantic analysis
13. GREEN / RED / YELLOW
14. Human review
15. Risk engine
16. Compliance report
17. Audit trail
18. Procurement Officer final decision

## Three Core Differentiators
### 1. Evidence-backed compliance
Requirement + Evidence + Source document/page + Rule + Result + Confidence

### 2. Cross-document inconsistency detection
Compare names, identifiers, financial values, product models, dates, quantities and other shared entities across documents.

### 3. Human-in-the-loop review
Uncertain cases go to a review queue. Officers can approve, reject, override and add reasons. Actions are audited.

## AI Responsibilities
- Requirement extraction
- Requirement classification/normalization
- Document classification
- Evidence extraction
- Semantic evidence matching
- Complex experience/technical interpretation
- Ambiguity detection
- Explanation generation

## Deterministic Rule Responsibilities
- Arithmetic thresholds
- Date/expiry checks
- Required-document existence
- Exact identifier comparisons
- Numeric technical thresholds

Never allow an LLM alone to produce the final compliance verdict.

## Compliance States
- GREEN — clear evidence and rules pass
- RED — clear requirement failure
- YELLOW — uncertain/ambiguous/conflicting case requiring human review

## Verification
Use an adapter interface so mock connectors can later be replaced by authorized production connectors.

Prototype labels:
- Mock Verification
- Prototype Verification Source
- Pending External Verification
- Manual Verification Required

Never claim live government verification unless actually authorized and available.

## Data Strategy
- Real/public GeM tender documents
- Controlled synthetic bidder data
- Synthetic bidder PDFs/images
- Hidden ground-truth scenarios for objective benchmarking

## Internal MVP Target
- Several real/public tenders
- At least one deeply demonstrated tender
- 5–10 synthetic bidders for strong scenarios
- 6–10 synthetic documents per bidder depending on requirements
- OCR/text extraction
- AI requirement extraction
- Evidence extraction
- Deterministic rules
- GREEN/RED/YELLOW
- Human review
- Cross-document mismatch detection
- Compliance dashboard
- Audit trail
- Final report
- Mock verification connector
