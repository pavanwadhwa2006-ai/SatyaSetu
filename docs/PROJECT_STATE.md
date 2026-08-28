# Satyaseetu Project State

**Last Updated:** August 2026 (Phase 2 Completed)

---

## 1. Project Overview & Progress Summary

Satyaseetu is an AI-powered integrated bid compliance verification platform for GeM procurement.

| Phase | Title | Status | Notes |
|---|---|---|---|
| **Phase 1** | Foundation | **DONE** | FastAPI, Supabase, Auth, RBAC, RLS, Schema, Health & Core APIs verified |
| **Phase 2** | Tender Dataset | **DONE** | 5 actual GeM tenders loaded, deterministic seed, document metadata associated |
| **Phase 3** | Ground Truth | **NOT STARTED** | Hidden expected outcomes & evaluation ground truth |
| **Phase 4–19** | Future Phases | **NOT STARTED** | Synthetic doc gen, OCR, rules engine, compliance, risk, officer dashboard |

---

## 2. Actual Tender Dataset (Phase 2)

Supabase contains the 5 actual GeM government tenders used as the foundational dataset for all compliance and verification workflows:

| Tender Number | Domain / Category | Organization & Division | Eval Type | Est. Value (INR) |
|---|---|---|---|---|
| `GEM/2026/B/7261466` | Engineering Software (ETABS / SAFE / SAP2000) | Central Public Works Department (Structural Engineering Division) | QCBS | ₹24,50,000 |
| `GEM/2026/B/7364888` | Manufacturing / Ergonomic Chair Components | Department of Heavy Industry (Furniture & Manufacturing Division) | LCS | ₹38,00,000 |
| `GEM/2026/B/7676747` | Electrical Maintenance & Operations | Public Works Department (Electrical & Mechanical Maintenance Wing) | LCS | ₹52,00,000 |
| `GEM/2026/B/7878577` | IT Project & System Integration Services | National Informatics Centre (e-Governance Implementation) | QCBS | ₹1,85,00,000 |
| `GEM/2026/B/7903799` | Multimedia Production & Manpower Services | Ministry of Information and Broadcasting (Media Services Wing) | QCBS | ₹95,00,000 |

Every tender record has `source = 'GEM_PUBLIC'` and is linked to its primary document metadata record in `tender_documents`.

---

## 3. Database State

Current active tables and record counts in Supabase:

- `tenders`: **5 rows** (The 5 actual GeM tenders; no placeholder synthetic tenders)
- `tender_documents`: **5 rows** (1 primary associated PDF document metadata record per tender)
- `vendors`: **4 rows** (Phase 1 synthetic vendor profiles preserved)
- `bid_submissions`: **0 rows** (Phase 6+)
- `vendor_documents`: **0 rows** (Phase 6+)
- `user_profiles`: **0 rows** (Populated on Auth signup)

---

## 4. How to Seed the Database

The seed mechanism is deterministic and idempotent. Running it multiple times updates existing records without creating duplicates.

### Option A — Using Python script (Recommended):
```bash
cd backend
python -m app.core.seed
# OR
python db/seed.py
```

### Option B — Using Supabase SQL Editor:
Copy and execute [`backend/db/seed.sql`](file:///d:/SatyaSetu/backend/db/seed.sql) in the Supabase SQL editor.

---

## 5. How to Run the Backend

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

---

## 6. How to Test the Backend

Automated test suite using `pytest`:

```bash
cd backend
python -m pytest -v
```

Verified Test Scenarios:
1. `GET /api/health` — Returns status `ok`, version `0.1.0`, environment `development`.
2. `GET /api/tenders` — Returns HTTP 200 and list of all 5 actual GeM tenders.
3. `GET /api/tenders/{id}` — Returns tender by UUID with associated `documents` metadata array.
4. `GET /api/tenders/{tender_number}` — Returns tender by GeM tender number.
5. Unique constraint & non-duplication tests.

---

## 7. Known Limitations

- Original physical tender PDF files are not committed into the git repository to keep repository size lean. The `tender_documents` table stores the storage path, original filename, and mime type ready for Supabase Storage bucket ingestion.
- OCR / text extraction / requirement parsing is intentionally deferred to Phase 5 (Tender Intelligence).

---

## 8. Next Implementation Step

**Phase 3 — Ground Truth Dataset**
- Define expected bidder facts and compliance outcomes matrix for each of the 5 tenders.
