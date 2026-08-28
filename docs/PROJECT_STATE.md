# Satyaseetu Project State

**Last Updated:** August 2026 (Phase 5 Completed)

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
| **Phase 6** | Bidder Submission | **NOT STARTED** | Real bid submission, multi-document uploads, Supabase persistence |
| **Phase 7–19** | Future Phases | **NOT STARTED** | Document intelligence, OCR, rules engine, compliance, risk, officer dashboard |

---

## 2. Phase 5 Tender Intelligence Layer

Tender Intelligence transforms raw procurement RFP clauses into structured, machine-readable requirement specifications:

### Requirement Model Specification

Every requirement is mapped to:
- `id`: Unique requirement UUID
- `tenderId`: Associated tender identifier
- `requirementCode`: Stable identifier (`REQ-T1-001` through `REQ-T3-010`)
- `category`: `FINANCIAL`, `EXPERIENCE`, `TECHNICAL`, `STATUTORY`, `LOCATION`, `MANDATORY`, `PREFERENTIAL`
- `normalizedField`: Canonical evaluation field name (e.g. `bidder_turnover_annual_avg`, `past_performance_quantity`, `local_content_percentage`)
- `requirementType`: Standardized type (`FINANCIAL`, `EXPERIENCE`, `TECHNICAL`, `STATUTORY`, `DOCUMENT`, `VALIDITY`, `LOCATION`, `QUANTITY`, `OEM`, `MII`, `MSE`, `STARTUP`, `EMD`, `DELIVERY`, etc.)
- `operator`: Controlled evaluation operator (`>=`, `<=`, `==`, `VALID`, `MATCH`, `EXISTS`, `PERCENT_OF`, etc.)
- `thresholdValue`: Direct numerical or symbolic threshold
- `thresholdUnit`: `INR`, `UNITS`, `DAYS`, `PERCENT`
- `thresholdPercentage`: Decimal fraction for percentage-derived rules (e.g., `0.10` for 10%, `0.15` for 15%, `0.02` for 2%)
- `baseValue`: Referenced base field for derived rules (`tender.estimatedValue`, `tender.totalQuantity`)
- `originalValue`: Original human-readable requirement representation
- `normalizedValue`: Machine-usable numerical representation
- `mandatory`: Strict eligibility criteria flag
- `exemptionMetadata`: Structured qualifications, evidence requirements, and conditions (`MSE_MANUFACTURER`, `STARTUP`, `MSE_SERVICE_PROVIDER`)
- `evidenceRequired`: List of acceptable documentary proof types (`TURNOVER_CERTIFICATE`, `MAF`, `CRAC_CERTIFICATE`, `UDYAM_CERTIFICATE`, `NOTARIZED_AFFIDAVIT`, `ELECTRICAL_LICENSE`, etc.)
- `sourceDocument`, `sourcePage`, `sourceClause`: Exact RFP clause citation and page provenance

---

## 3. Active Tenders Covered (34 Requirements)

1. **Tender 1: `GEM/2026/B/7261466`** (MNIT Jaipur — Structural Software)
   - 10 Structured Requirements
   - Highlights: Bidder Turnover >= ₹5.00L (500000 INR), OEM Turnover >= ₹42.00L (4200000 INR), Past order >= 15% of tender value (₹3.675L / 367500 INR), EMD 2% (₹49,000) with MSE exemption, Delivery <= 15 Days, Rajasthan Service Centre.

2. **Tender 2: `GEM/2026/B/7364888`** (ALIMCO — Ergonomic Chairs & Assemblies)
   - 14 Structured Requirements
   - Highlights: Bidder Turnover >= ₹34.00L (3400000 INR) with Startup exemption, Past performance >= 10% of total quantity (6,000 Units), Local content >= 50% (0.50 MII), EMD 2% (₹76,000), OEM Turnover >= ₹34.00L, Sample timeline <= 10 Days.

3. **Tender 3: `GEM/2026/B/7676747`** (Trade Marks Registry Ahmedabad — Electrical Services)
   - 10 Structured Requirements
   - Highlights: Bidder Turnover >= ₹3.00L (300000 INR), Class-A Gujarat Electrical License, Gujarat commercial premises, GSTR-3B filings for 3 consecutive months (Apr, May, Jun 2026), Bank Solvency with zero IBC proceedings, 100% ISI/BIS materials, EMD 2% (₹1,04,000).

---

## 4. API Endpoints

- `GET /api/tender-intelligence/requirements` — Returns all 34 machine-readable requirements.
- `GET /api/tender-intelligence/{tender_id}/requirements` — Returns requirements for a specific tender by UUID or GeM bid number.
- `GET /api/tender-intelligence/{tender_id}/summary` — Returns aggregated category counts and metrics.

---

## 5. How to Run and Test

### Backend Test Suite:
```bash
cd backend
python -m pytest -v
```

Verified Test Suites:
- `tests/test_tender_intelligence.py` (10 test scenarios) — **100% PASS**
- `tests/test_synthetic_docs.py` (5 test scenarios) — **100% PASS**
- `tests/test_ground_truth.py` (4 test scenarios) — **100% PASS**
- `tests/test_tenders.py` & `tests/test_health.py` (7 test scenarios) — **100% PASS**
- **Total: 26 / 26 backend tests passing.**

### Frontend Build:
```bash
npm run build
```
- Next.js static build verified with complete pre-rendering and 0 TypeScript errors.

---

## 6. Next Implementation Step

**Phase 6 — Bidder Submission**
- Build real bid submission workflows, multi-document file uploads, and Supabase database persistence for incoming vendor bids.
