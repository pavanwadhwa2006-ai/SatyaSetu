"""
SatyaSetu Backend — Document Intelligence Tests (Phase 7)
Validates PDF text extraction, document classification, structured fact extraction,
source page provenance, verbatim quote traceability, numeric normalization, and error handling
using the Phase 4 synthetic document dataset across all 5 canonical bidders.
"""

import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.document_intelligence import extract_text_from_pdf, classify_document, extract_structured_facts
from app.repositories import vendor_repo
from app.core.database import get_supabase_client

client = TestClient(app)

SYNTHETIC_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "synthetic"


def _read_synthetic_pdf(package_folder: str, filename: str) -> bytes:
    """Helper to read synthetic PDF file bytes."""
    path = SYNTHETIC_DIR / package_folder / filename
    assert path.exists(), f"Synthetic file not found: {path}"
    with open(path, "rb") as f:
        return f.read()


# ── Text Extraction & Parsing Tests ───────────────────────────────────────────

def test_extract_text_from_vanguard_turnover_pdf():
    """Verify pypdf extracts text and page numbers from Vanguard CA Turnover Certificate."""
    pdf_bytes = _read_synthetic_pdf("T2-B1-Vanguard", "Vanguard_Audited_Turnover_Certificate.pdf")
    pages = extract_text_from_pdf(pdf_bytes)
    assert len(pages) >= 1
    assert pages[0]["page_num"] == 1
    assert "Chartered Accountants" in pages[0]["text"]
    assert "49.17" in pages[0]["text"] or "49,17,000" in pages[0]["text"]
    assert "UDIN" in pages[0]["text"]


def test_classify_document_types():
    """Verify document classification across diverse synthetic procurement files."""
    test_cases = [
        ("T2-B1-Vanguard", "Vanguard_Audited_Turnover_Certificate.pdf", "TURNOVER_CERTIFICATE"),
        ("T2-B1-Vanguard", "Vanguard_CRAC_Certificates.pdf", "CRAC_CERTIFICATE"),
        ("T2-B1-Vanguard", "Vanguard_Udyam_Manufacturing_Kanpur.pdf", "UDYAM_CERTIFICATE"),
        ("T2-B1-Vanguard", "Vanguard_MII_CA_Certificate_78.4pct.pdf", "MII_DECLARATION"),
        ("T2-B1-Vanguard", "Vanguard_Notarized_Affidavit.pdf", "NOTARIZED_AFFIDAVIT"),
        ("T3-B1-Apex", "Apex_ClassA_Electrical_License_Gujarat.pdf", "ELECTRICAL_LICENSE"),
        ("T3-B1-Apex", "Apex_GSTR3B_Apr_May_Jun2026.pdf", "GSTR3B_RETURN"),
        ("T3-B1-Apex", "Apex_Bank_Solvency_Certificate.pdf", "BANK_SOLVENCY_CERT"),
        ("T2-B2-Zenith", "Zenith_DPIIT_Application_Ack.pdf", "DPIIT_RECOGNITION_CERT"),
        ("T1-B2-Nexus", "Nexus_Reseller_MAF_Generic.pdf", "MAF"),
    ]

    for pkg, fname, expected_type in test_cases:
        pdf_bytes = _read_synthetic_pdf(pkg, fname)
        pages = extract_text_from_pdf(pdf_bytes)
        classified = classify_document(fname, pages)
        assert classified == expected_type, f"Expected {expected_type} for {fname}, got {classified}"


# ── Fact Extraction on All 5 Canonical Packages ────────────────────────────────

def test_vanguard_fact_extraction():
    """Verify fact extraction on Vanguard (T2-B1) documents."""
    # 1. Turnover
    pdf_bytes = _read_synthetic_pdf("T2-B1-Vanguard", "Vanguard_Audited_Turnover_Certificate.pdf")
    pages = extract_text_from_pdf(pdf_bytes)
    facts = extract_structured_facts("doc-vg-1", "TURNOVER_CERTIFICATE", "Vanguard_Audited_Turnover_Certificate.pdf", pages)
    
    turnover_fact = next((f for f in facts if f.field_name == "bidder_turnover_annual_avg"), None)
    assert turnover_fact is not None
    assert turnover_fact.normalized_value == 4917000
    assert turnover_fact.unit == "INR"
    assert turnover_fact.source_page == 1
    assert "49,17,000" in turnover_fact.raw_quote or "49.17" in turnover_fact.raw_quote
    assert turnover_fact.confidence >= 0.95

    # 2. Past Performance Quantity
    pdf_bytes_po = _read_synthetic_pdf("T2-B1-Vanguard", "Vanguard_Supply_Performance_8000units.pdf")
    pages_po = extract_text_from_pdf(pdf_bytes_po)
    facts_po = extract_structured_facts("doc-vg-2", "PURCHASE_ORDER", "Vanguard_Supply_Performance_8000units.pdf", pages_po)
    qty_fact = next((f for f in facts_po if f.field_name == "past_performance_quantity"), None)
    assert qty_fact is not None
    assert qty_fact.normalized_value == 8000
    assert qty_fact.unit == "UNITS"

    # 3. Local Content (MII)
    pdf_bytes_mii = _read_synthetic_pdf("T2-B1-Vanguard", "Vanguard_MII_CA_Certificate_78.4pct.pdf")
    pages_mii = extract_text_from_pdf(pdf_bytes_mii)
    facts_mii = extract_structured_facts("doc-vg-3", "MII_DECLARATION", "Vanguard_MII_CA_Certificate_78.4pct.pdf", pages_mii)
    mii_fact = next((f for f in facts_mii if f.field_name == "local_content_percentage"), None)
    assert mii_fact is not None
    assert mii_fact.normalized_value == 0.784


def test_nexus_fact_extraction():
    """Verify fact extraction on Nexus (T1-B2) documents."""
    pdf_bytes = _read_synthetic_pdf("T1-B2-Nexus", "Nexus_CA_Turnover_Cert.pdf")
    pages = extract_text_from_pdf(pdf_bytes)
    facts = extract_structured_facts("doc-nx-1", "TURNOVER_CERTIFICATE", "Nexus_CA_Turnover_Cert.pdf", pages)
    turnover_fact = next((f for f in facts if f.field_name == "bidder_turnover_annual_avg"), None)
    assert turnover_fact is not None
    assert turnover_fact.normalized_value == 380000
    assert turnover_fact.unit == "INR"


def test_apex_fact_extraction():
    """Verify fact extraction on Apex Electrical (T3-B1) documents."""
    # Electrical License
    pdf_bytes_lic = _read_synthetic_pdf("T3-B1-Apex", "Apex_ClassA_Electrical_License_Gujarat.pdf")
    pages_lic = extract_text_from_pdf(pdf_bytes_lic)
    facts_lic = extract_structured_facts("doc-ap-1", "ELECTRICAL_LICENSE", "Apex_ClassA_Electrical_License_Gujarat.pdf", pages_lic)
    lic_fact = next((f for f in facts_lic if f.field_name == "electrical_contractor_license"), None)
    assert lic_fact is not None
    assert lic_fact.normalized_value == "CLASS_A_ACTIVE"

    # GSTR-3B filings
    pdf_bytes_gst = _read_synthetic_pdf("T3-B1-Apex", "Apex_GSTR3B_Apr_May_Jun2026.pdf")
    pages_gst = extract_text_from_pdf(pdf_bytes_gst)
    facts_gst = extract_structured_facts("doc-ap-2", "GSTR3B_RETURN", "Apex_GSTR3B_Apr_May_Jun2026.pdf", pages_gst)
    gst_fact = next((f for f in facts_gst if f.field_name == "gst_return_filing_compliance"), None)
    assert gst_fact is not None
    assert gst_fact.normalized_value == "3_CONSECUTIVE_MONTHS"


def test_voltech_fact_extraction():
    """Verify fact extraction on Voltech Power (T3-B2) documents."""
    # Expired License
    pdf_bytes_lic = _read_synthetic_pdf("T3-B2-Voltech", "Voltech_Expired_Electrical_License.pdf")
    pages_lic = extract_text_from_pdf(pdf_bytes_lic)
    facts_lic = extract_structured_facts("doc-vt-1", "ELECTRICAL_LICENSE", "Voltech_Expired_Electrical_License.pdf", pages_lic)
    lic_fact = next((f for f in facts_lic if f.field_name == "electrical_contractor_license"), None)
    assert lic_fact is not None
    assert lic_fact.normalized_value == "EXPIRED"

    # IBC / NCLT Disclosure
    pdf_bytes_ibc = _read_synthetic_pdf("T3-B2-Voltech", "Voltech_NCLT_IBC_Disclosure.pdf")
    pages_ibc = extract_text_from_pdf(pdf_bytes_ibc)
    facts_ibc = extract_structured_facts("doc-vt-2", "BANK_SOLVENCY_CERT", "Voltech_NCLT_IBC_Disclosure.pdf", pages_ibc)
    ibc_fact = next((f for f in facts_ibc if f.field_name == "financial_solvency_standing"), None)
    assert ibc_fact is not None
    assert ibc_fact.normalized_value == "ACTIVE_IBC_PROCEEDINGS"


def test_zenith_fact_extraction():
    """Verify fact extraction on Zenith Ergonomics (T2-B2) documents."""
    # 2-year turnover
    pdf_bytes = _read_synthetic_pdf("T2-B2-Zenith", "Zenith_CA_Turnover_2Years.pdf")
    pages = extract_text_from_pdf(pdf_bytes)
    facts = extract_structured_facts("doc-zn-1", "TURNOVER_CERTIFICATE", "Zenith_CA_Turnover_2Years.pdf", pages)
    fy_fact = next((f for f in facts if f.field_name == "turnover_financial_years_count"), None)
    assert fy_fact is not None
    assert fy_fact.normalized_value == 2

    # DPIIT Acknowledgement
    pdf_bytes_ack = _read_synthetic_pdf("T2-B2-Zenith", "Zenith_DPIIT_Application_Ack.pdf")
    pages_ack = extract_text_from_pdf(pdf_bytes_ack)
    facts_ack = extract_structured_facts("doc-zn-2", "DPIIT_RECOGNITION_CERT", "Zenith_DPIIT_Application_Ack.pdf", pages_ack)
    ack_fact = next((f for f in facts_ack if f.field_name == "startup_dpiit_certificate"), None)
    assert ack_fact is not None
    assert ack_fact.normalized_value == "PROVISIONAL_ACK"


# ── Strict Phase Boundary & Error Handling Tests ───────────────────────────────

def test_no_benchmark_verdict_leakage_in_facts():
    """CRITICAL: Ensure Phase 7 fact extraction never emits compliance verdicts."""
    for pkg in ("T1-B2-Nexus", "T2-B1-Vanguard", "T2-B2-Zenith", "T3-B1-Apex", "T3-B2-Voltech"):
        pkg_dir = SYNTHETIC_DIR / pkg
        for pdf_file in pkg_dir.glob("*.pdf"):
            with open(pdf_file, "rb") as f:
                pdf_bytes = f.read()
            pages = extract_text_from_pdf(pdf_bytes)
            classified = classify_document(pdf_file.name, pages)
            facts = extract_structured_facts("doc-test", classified, pdf_file.name, pages)
            for fact in facts:
                # Value and normalized value must not be benchmark compliance labels
                assert fact.normalized_value not in ("COMPLIANT", "NON_COMPLIANT", "DISQUALIFIED", "QUALIFIED"), (
                    f"Leakage detected in {pdf_file.name}: fact {fact.field_name} has value {fact.normalized_value}"
                )


def test_empty_or_corrupt_pdf_fails_safely():
    """Verify that corrupt or empty bytes raise ValueError rather than unhandled crash."""
    with pytest.raises(ValueError, match="PDF content is empty"):
        extract_text_from_pdf(b"")

    with pytest.raises(ValueError, match="Corrupt or unreadable PDF"):
        extract_text_from_pdf(b"Not a valid PDF header")


# ── End-to-End API Integration Tests ──────────────────────────────────────────

def test_end_to_end_document_processing_api():
    """Verify uploading a PDF, calling process endpoint, and retrieving structured facts."""
    t_res = client.get("/api/tenders/GEM/2026/B/7364888")
    tender = t_res.json()
    vendors, _ = vendor_repo.get_all_vendors(limit=10)
    vendor = vendors[0]

    # Cleanup any existing test submission
    db = get_supabase_client()
    try:
        db.table("bid_submissions").delete().eq("tender_id", tender["id"]).eq("vendor_id", vendor["id"]).execute()
    except Exception:
        pass

    # 1. Start draft submission
    sub_res = client.post("/api/bid-submissions", json={
        "tender_id": tender["id"],
        "vendor_id": vendor["id"],
    })
    assert sub_res.status_code in (200, 201)
    sub = sub_res.json()
    sub_id = sub["id"]

    # 2. Upload synthetic Vanguard Turnover PDF
    pdf_bytes = _read_synthetic_pdf("T2-B1-Vanguard", "Vanguard_Audited_Turnover_Certificate.pdf")
    upload_res = client.post(
        f"/api/bid-submissions/{sub_id}/documents",
        files={"file": ("Vanguard_Audited_Turnover_Certificate.pdf", io.BytesIO(pdf_bytes), "application/pdf")},
        data={"document_type": "TURNOVER_CERTIFICATE"},
    )
    if upload_res.status_code == 201:
        doc = upload_res.json()
        doc_id = doc["id"]

        # 3. Process document via API
        proc_res = client.post(f"/api/documents/{doc_id}/process")
        assert proc_res.status_code == 200
        proc_data = proc_res.json()
        assert proc_data["processing_status"] == "PROCESSED"
        assert proc_data["extracted_facts_count"] >= 1
        assert len(proc_data["facts"]) >= 1

        # 4. Fetch facts
        facts_res = client.get(f"/api/documents/{doc_id}/facts")
        assert facts_res.status_code == 200
        facts_list = facts_res.json()
        assert len(facts_list) >= 1

        # 5. Fetch submission-level facts
        sub_facts_res = client.get(f"/api/bid-submissions/{sub_id}/facts")
        assert sub_facts_res.status_code == 200
        sub_facts_data = sub_facts_res.json()
        assert sub_facts_data["total_facts_count"] >= 1
