"""
SatyaSetu Backend — Deterministic Seed Script
Seeds the 5 actual GeM tenders and associates tender documents in Supabase.
Idempotent and reproducible.

Run:
    python -m app.core.seed
    or
    python backend/db/seed.py
"""

import sys
import logging
from app.core.database import get_supabase_client

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
logger = logging.getLogger(__name__)

ACTUAL_TENDERS = [
    {
        "tender_number": "GEM/2026/B/7261466",
        "title": "Procurement of Structural Engineering Software (ETABS, SAFE, SAP2000)",
        "organization": "Central Public Works Department",
        "department": "Structural Engineering & Design Division",
        "category": "Engineering Software / Structural Analysis Software",
        "description": "Supply, installation, licensing, and 1-year comprehensive technical support for structural engineering and analysis software suite (ETABS, SAFE, and SAP2000) for civil and structural infrastructure design.",
        "source": "GEM_PUBLIC",
        "status": "OPEN",
        "estimated_value": 2450000,
        "submission_deadline": "2026-09-25T15:00:00+05:30",
        "publish_date": "2026-08-10",
        "bid_validity_days": 90,
        "evaluation_type": "Quality and Cost Based Selection (QCBS)",
        "delivery_location": "New Delhi, India",
        "delivery_period_days": 30,
        "warranty_months": 12,
        "emd_amount": 49000,
    },
    {
        "tender_number": "GEM/2026/B/7364888",
        "title": "Supply and Delivery of Manufacturing / Ergonomic Chair Components",
        "organization": "Department of Heavy Industry",
        "department": "Central Furniture & Manufacturing Division",
        "category": "Manufacturing / Office Furniture & Components",
        "description": "Supply, quality testing, and delivery of standardized ergonomic chair components, modular assemblies, heavy-duty gas lifts, and nylon bases for central production facilities.",
        "source": "GEM_PUBLIC",
        "status": "OPEN",
        "estimated_value": 3800000,
        "submission_deadline": "2026-09-28T17:00:00+05:30",
        "publish_date": "2026-08-12",
        "bid_validity_days": 90,
        "evaluation_type": "Least Cost Selection (LCS)",
        "delivery_location": "Chennai, Tamil Nadu",
        "delivery_period_days": 45,
        "warranty_months": 24,
        "emd_amount": 76000,
    },
    {
        "tender_number": "GEM/2026/B/7676747",
        "title": "Comprehensive Electrical Infrastructure Maintenance and Operation Services",
        "organization": "Public Works Department",
        "department": "Electrical & Mechanical Maintenance Wing",
        "category": "Electrical Services / Facility Maintenance",
        "description": "Comprehensive annual operations, preventive testing, transformer maintenance, and breakdown electrical services for institutional substation and electrical distribution network.",
        "source": "GEM_PUBLIC",
        "status": "OPEN",
        "estimated_value": 5200000,
        "submission_deadline": "2026-10-05T16:00:00+05:30",
        "publish_date": "2026-08-15",
        "bid_validity_days": 90,
        "evaluation_type": "Least Cost Selection (LCS)",
        "delivery_location": "Mumbai, Maharashtra",
        "delivery_period_days": 365,
        "warranty_months": 12,
        "emd_amount": 104000,
    },
    {
        "tender_number": "GEM/2026/B/7878577",
        "title": "IT Project Implementation and System Integration Services",
        "organization": "National Informatics Centre",
        "department": "e-Governance Project Implementation Division",
        "category": "IT Services / System Integration",
        "description": "Turnkey IT project services including systems architecture, software application development, cloud infrastructure deployment, data migration, and SLA-backed support under QCBS framework.",
        "source": "GEM_PUBLIC",
        "status": "OPEN",
        "estimated_value": 18500000,
        "submission_deadline": "2026-10-15T18:00:00+05:30",
        "publish_date": "2026-08-18",
        "bid_validity_days": 120,
        "evaluation_type": "Quality and Cost Based Selection (QCBS)",
        "delivery_location": "New Delhi, India",
        "delivery_period_days": 180,
        "warranty_months": 24,
        "emd_amount": 370000,
    },
    {
        "tender_number": "GEM/2026/B/7903799",
        "title": "Engagement of Specialized Multimedia Production and Technical Manpower Services",
        "organization": "Ministry of Information and Broadcasting",
        "department": "Media & Communication Services Wing",
        "category": "Manpower Services / Multimedia & Audio-Visual Services",
        "description": "Provision of creative multimedia production, audio-video post-production, digital campaign design, and certified technical manpower staffing for media outreach operations.",
        "source": "GEM_PUBLIC",
        "status": "OPEN",
        "estimated_value": 9500000,
        "submission_deadline": "2026-10-10T15:00:00+05:30",
        "publish_date": "2026-08-20",
        "bid_validity_days": 90,
        "evaluation_type": "Quality and Cost Based Selection (QCBS)",
        "delivery_location": "New Delhi / Regional Centers",
        "delivery_period_days": 365,
        "warranty_months": 0,
        "emd_amount": 190000,
    },
]

VENDORS = [
    {"legal_name": "ABC Engineering Pvt. Ltd. [SYNTHETIC]", "display_name": "ABC Engineering", "status": "ACTIVE"},
    {"legal_name": "Bharat Industrial Systems Ltd. [SYNTHETIC]", "display_name": "Bharat Industrial", "status": "ACTIVE"},
    {"legal_name": "National Process Equipments Pvt. Ltd. [SYNTHETIC]", "display_name": "National Process Equipments", "status": "ACTIVE"},
    {"legal_name": "Reliable Instruments Pvt. Ltd. [SYNTHETIC]", "display_name": "Reliable Instruments", "status": "ACTIVE"},
]


def run_seed():
    """Execute the Phase 2 database seed."""
    client = get_supabase_client()
    logger.info("Starting Phase 2 seed operation...")

    # 1. Clean legacy Phase 1 placeholder synthetic tenders
    try:
        legacy_res = client.table("tenders").select("id, tender_number").like("tender_number", "SYNTHETIC-TENDER-%").execute()
        if legacy_res.data:
            logger.info(f"Removing {len(legacy_res.data)} legacy synthetic placeholder tenders...")
            for item in legacy_res.data:
                client.table("tenders").delete().eq("id", item["id"]).execute()
            logger.info("Legacy placeholder tenders removed.")
    except Exception as exc:
        logger.warning(f"Error checking/deleting legacy synthetic tenders: {exc}")

    # 2. Upsert actual 5 GeM tenders
    logger.info(f"Upserting {len(ACTUAL_TENDERS)} actual GeM tenders...")
    for tender in ACTUAL_TENDERS:
        try:
            res = client.table("tenders").upsert(tender, on_conflict="tender_number").execute()
            logger.info(f"  ✓ Upserted tender: {tender['tender_number']}")
        except Exception as exc:
            logger.error(f"  ✗ Error upserting tender {tender['tender_number']}: {exc}")
            raise

    # 3. Associate tender documents
    logger.info("Associating tender document records...")
    tenders_res = client.table("tenders").select("id, tender_number").execute()
    existing_tenders = {t["tender_number"]: t["id"] for t in tenders_res.data}

    for tender_number, tender_id in existing_tenders.items():
        doc_filename = f"GeM-Bidding-{tender_number.replace('/', '-').replace('GEM-', '')}.pdf"
        storage_path = f"tenders/{tender_number.replace('/', '_')}/bid_document.pdf"

        doc_check = client.table("tender_documents").select("id").eq("tender_id", tender_id).execute()
        if not doc_check.data:
            doc_payload = {
                "tender_id": tender_id,
                "original_filename": doc_filename,
                "storage_path": storage_path,
                "mime_type": "application/pdf",
                "file_size": 524288,
                "processing_status": "UPLOADED",
            }
            client.table("tender_documents").insert(doc_payload).execute()
            logger.info(f"  ✓ Associated document for tender {tender_number} -> {doc_filename}")
        else:
            logger.info(f"  • Document already associated for tender {tender_number}")

    # 4. Upsert vendors (preserve Phase 1 vendors)
    logger.info(f"Ensuring {len(VENDORS)} vendors exist...")
    for vendor in VENDORS:
        try:
            v_check = client.table("vendors").select("id").eq("legal_name", vendor["legal_name"]).execute()
            if not v_check.data:
                client.table("vendors").insert(vendor).execute()
                logger.info(f"  ✓ Inserted vendor: {vendor['legal_name']}")
            else:
                logger.info(f"  • Vendor already exists: {vendor['legal_name']}")
        except Exception as exc:
            logger.error(f"  ✗ Error with vendor {vendor['legal_name']}: {exc}")

    # 5. Verify counts
    t_count = len(client.table("tenders").select("id").execute().data)
    d_count = len(client.table("tender_documents").select("id").execute().data)
    v_count = len(client.table("vendors").select("id").execute().data)
    logger.info(f"Seed complete. Final counts -> Tenders: {t_count}, Documents: {d_count}, Vendors: {v_count}")
    return t_count, d_count, v_count


if __name__ == "__main__":
    t_count, d_count, v_count = run_seed()
    if t_count != 5:
        logger.error(f"Expected 5 tenders, got {t_count}!")
        sys.exit(1)
    logger.info("Phase 2 Seed Verified Successfully!")
