# Satyaseetu Project State

**Last Updated:** August 2026 (Phase 3 Completed)

---

## 1. Project Overview & Progress Summary

Satyaseetu is an AI-powered integrated bid compliance verification platform for GeM procurement.

| Phase | Title | Status | Notes |
|---|---|---|---|
| **Phase 1** | Foundation | **DONE** | FastAPI, Supabase, Auth, RBAC, RLS, Schema, Health & Core APIs verified |
| **Phase 2** | Tender Dataset | **DONE** | 5 actual GeM tenders loaded, deterministic seed, document metadata associated |
| **Phase 3** | Ground Truth | **DONE** | Canonical tender + bidder ground truth data layer, independent requirements & evidence |
| **Phase 4** | Synthetic Documents | **NOT STARTED** | Realistic fictional bidder PDFs generation |
| **Phase 5–19** | Future Phases | **NOT STARTED** | Tender intelligence, submission, OCR, rules engine, compliance, risk, officer dashboard |

---

## 2. Phase 3 Ground Truth Dataset

The Ground Truth layer defines the canonical evaluation standard across 3 tenders and 5 bidders:

### Tenders & Bidders Breakdown

1. **Tender 1: `GEM/2026/B/7261466`** (MNIT Jaipur — Structural Software)
   - **`T1-B2` — Nexus Infotech & Trading Pvt. Ltd.**
   - **Expected Benchmark:** `NON_COMPLIANT`
   - **Key Failures:** Bidder Turnover (₹3.80L < ₹5.00L), OEM Turnover (₹38L < ₹42L), Expired generic MAF, Past order value (₹2.40L < ₹3.675L), Private client domain, Ineligible trader EMD exemption, Missing Rajasthan service centre, Unnotarized letterhead affidavit.

2. **Tender 2: `GEM/2026/B/7364888`** (ALIMCO — Chair Assemblies)
   - **`T2-B1` — Vanguard Seating Systems Pvt. Ltd.**
     - **Expected Benchmark:** `COMPLIANT`
     - **Key Passes:** Turnover ₹49.17L (>= ₹34L), Past supply 8,000 units (>= 6,000), CRAC verified, In-house OEM manufacturer, 78.4% Make in India local content, MSE EMD exemption, Notarized affidavit.
   - **`T2-B2` — Zenith Ergonomics & Components Pvt. Ltd.**
     - **Expected Benchmark:** `REVIEW` (Non-Compliant with Human Review)
     - **Key Failures & Flags:** Turnover ₹20.15L (< ₹34L), 3,500 units (< 6,000), Private unlisted client, Missing CRAC/invoices, Expired OEM MAF, Sample timeline 20-25 days, Unnotarized affidavit; Review flags: Provisional DPIIT Startup acknowledgement, 52% self-declared MII, Address mismatch.

3. **Tender 3: `GEM/2026/B/7676747`** (Trade Marks Registry Ahmedabad — Electrical Services)
   - **`T3-B1` — Apex Electrical Solutions Pvt. Ltd.** *(Normalized from T5-B1)*
     - **Expected Benchmark:** `COMPLIANT`
     - **Key Passes:** Turnover ₹5.20L (>= ₹3.00L), Govt electrical contract ₹8.45L, Class-A Gujarat license valid to 2029, Ghatlodia Ahmedabad premises, GSTR-3B filings Apr-Jun 2026, Notarized ₹100 affidavit, Bank Solvency, ISI material compliance.
   - **`T3-B2` — Voltech Power & Infra Services Pvt. Ltd.**
     - **Expected Benchmark:** `NON_COMPLIANT`
     - **Key Failures:** Turnover ₹2.40L (< ₹3.00L), Delhi GSTIN without Gujarat registration, Retail LED bulb supply only, Zero Gujarat presence, Expired electrical license (Jan 2025), Delinquent May & Jun 2026 GST returns, Unnotarized affidavit, Non-ISI materials, Active NCLT/IBC Corporate Insolvency, Invalid EMD claim.

---

## 3. Database & Structured Data State

- `tenders`: **5 rows** in Supabase (3 featured in Ground Truth + 2 additional GeM tenders)
- `tender_documents`: **5 rows**
- `tender_requirements`: **34 independent structured requirements**
- `bidders`: **5 normalized bidders** (`T1-B2`, `T2-B1`, `T2-B2`, `T3-B1`, `T3-B2`)
- `bidder_documents`: **29 structured submitted documents**
- `bidder_evidence`: **49 structured extracted facts & field values**
- `compliance_results`: **49 calculated compliance result rows**
- `benchmarks`: **5 master bidder benchmark records**

---

## 4. Ground Truth UI Explorer

A dedicated Ground Truth Dataset Explorer is available at:
- Route: `/officer/ground-truth`
- Features:
  1. Interactive Tender Selector
  2. Tender Information Card & Requirement Metrics
  3. Evaluated Bidder Selector with Normalized Codes & Badges
  4. Requirements & Compliance Matrix with deterministic evaluation reasons
  5. Submitted Documents & Extracted Evidence Explorer
  6. Bidder Entity Profile & Metadata
  7. Live Benchmark Integrity Verification Suite (5/5 assertion checks)

---

## 5. How to Run and Test

### Frontend:
```bash
npm run dev
# Open http://localhost:3000/officer/ground-truth
```

### Backend:
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

### Automated Backend Tests:
```bash
cd backend
python -m pytest -v
```

Verified Test Scenarios:
- `tests/test_ground_truth.py::test_get_ground_truth_tenders` — PASS
- `tests/test_ground_truth.py::test_get_ground_truth_bidders` — PASS
- `tests/test_ground_truth.py::test_apex_normalization` — PASS
- `tests/test_ground_truth.py::test_all_five_bidder_benchmarks` — PASS
- `tests/test_health.py::test_health_check` — PASS
- `tests/test_tenders.py` (6 test cases) — PASS

---

## 6. Next Implementation Step

**Phase 4 — Synthetic Bidder Document Generator**
- Generate realistic synthetic PDF documents matching the ground truth specifications with clearly labeled hackathon-only watermarks.
