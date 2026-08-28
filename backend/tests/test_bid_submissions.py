"""
SatyaSetu Backend — Bid Submissions & Upload Tests (Phase 6)
Validates bid creation, PDF document upload, storage persistence,
submission lifecycle (DRAFT -> SUBMITTED), edit restrictions, and error handling.
"""

import io
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.repositories import vendor_repo, tender_repo, bid_submission_repo
from app.core.database import get_supabase_client

client = TestClient(app)


def _cleanup_test_submission(tender_id: str, vendor_id: str):
    """Ensures test isolation by removing any existing submissions for (tender, vendor)."""
    db = get_supabase_client()
    try:
        db.table("bid_submissions").delete().eq("tender_id", tender_id).eq("vendor_id", vendor_id).execute()
    except Exception:
        pass


def test_create_and_get_draft_submission():
    """Verify creating a DRAFT submission for a valid tender and vendor."""
    t_res = client.get("/api/tenders?limit=5")
    assert t_res.status_code == 200
    tenders = t_res.json()["items"]
    assert len(tenders) >= 1
    tender = tenders[0]

    vendors, _ = vendor_repo.get_all_vendors(limit=5)
    assert len(vendors) >= 1
    vendor = vendors[0]

    _cleanup_test_submission(tender["id"], vendor["id"])

    # Create submission
    payload = {
        "tender_id": tender["id"],
        "vendor_id": vendor["id"],
    }
    create_res = client.post("/api/bid-submissions", json=payload)
    assert create_res.status_code in (200, 201)
    sub = create_res.json()
    assert sub["status"] == "DRAFT"
    assert sub["tender_id"] == tender["id"]
    assert sub["vendor_id"] == vendor["id"]

    # Get submission by ID
    get_res = client.get(f"/api/bid-submissions/{sub['id']}")
    assert get_res.status_code == 200
    fetched = get_res.json()
    assert fetched["id"] == sub["id"]
    assert "documents" in fetched


def test_submission_lifecycle_and_document_upload():
    """Verify uploading PDF, listing, downloading, submitting, and edit locking."""
    # Find tender 2 (ALIMCO)
    t_res = client.get("/api/tenders/GEM/2026/B/7364888")
    assert t_res.status_code == 200
    tender = t_res.json()

    vendors, _ = vendor_repo.get_all_vendors(limit=15)
    # Pick Vanguard
    vendor = next((v for v in vendors if "Vanguard" in v["legal_name"]), vendors[0])

    _cleanup_test_submission(tender["id"], vendor["id"])

    # 1. Start draft submission
    create_res = client.post("/api/bid-submissions", json={
        "tender_id": tender["id"],
        "vendor_id": vendor["id"],
    })
    assert create_res.status_code == 201
    sub = create_res.json()
    sub_id = sub["id"]
    assert sub["status"] == "DRAFT"

    # 2. Upload valid PDF document
    pdf_content = b"%PDF-1.4 Mock Synthetic Audited Financial Turnover Statement"
    files = {
        "file": ("Audited_Turnover_Statement.pdf", io.BytesIO(pdf_content), "application/pdf"),
    }
    data = {
        "document_type": "TURNOVER_CERTIFICATE",
    }
    upload_res = client.post(f"/api/bid-submissions/{sub_id}/documents", files=files, data=data)
    assert upload_res.status_code == 201
    doc = upload_res.json()
    assert doc["original_filename"] == "Audited_Turnover_Statement.pdf"
    assert doc["document_type"] == "TURNOVER_CERTIFICATE"
    assert doc["file_size"] == len(pdf_content)

    # 3. List documents
    list_docs_res = client.get(f"/api/bid-submissions/{sub_id}/documents")
    assert list_docs_res.status_code == 200
    docs_list = list_docs_res.json()
    assert len(docs_list) >= 1

    # 4. Download document content
    dl_res = client.get(f"/api/bid-submissions/{sub_id}/documents/{doc['id']}/download")
    assert dl_res.status_code == 200
    assert dl_res.content == pdf_content

    # 5. Upload second document (MAF)
    maf_content = b"%PDF-1.4 Mock Manufacturer Authorization Form"
    upload_res2 = client.post(
        f"/api/bid-submissions/{sub_id}/documents",
        files={"file": ("OEM_MAF.pdf", io.BytesIO(maf_content), "application/pdf")},
        data={"document_type": "MAF"},
    )
    assert upload_res2.status_code == 201

    # 6. Finalize submission
    submit_res = client.post(f"/api/bid-submissions/{sub_id}/submit")
    assert submit_res.status_code == 200
    submit_data = submit_res.json()
    assert submit_data["status"] == "SUBMITTED"
    assert submit_data["submitted_at"] is not None

    # 7. Verify modifications are now rejected
    post_submit_upload = client.post(
        f"/api/bid-submissions/{sub_id}/documents",
        files={"file": ("Extra.pdf", io.BytesIO(b"%PDF-1.4"), "application/pdf")},
    )
    assert post_submit_upload.status_code == 400

    # Verify delete is rejected
    del_res = client.delete(f"/api/bid-submissions/{sub_id}/documents/{doc['id']}")
    assert del_res.status_code == 400


def test_reject_invalid_file_type():
    """Verify non-PDF files are rejected."""
    t_res = client.get("/api/tenders/GEM/2026/B/7261466")
    tender = t_res.json()
    vendors, _ = vendor_repo.get_all_vendors(limit=10)
    vendor = vendors[0]

    _cleanup_test_submission(tender["id"], vendor["id"])

    create_res = client.post("/api/bid-submissions", json={
        "tender_id": tender["id"],
        "vendor_id": vendor["id"],
    })
    assert create_res.status_code in (200, 201)
    sub = create_res.json()
    
    # Attempt uploading .exe
    exe_file = {"file": ("malicious.exe", io.BytesIO(b"MZ\x90\x00"), "application/x-msdownload")}
    res = client.post(f"/api/bid-submissions/{sub['id']}/documents", files=exe_file)
    assert res.status_code == 400
    assert "Only PDF documents" in res.json()["detail"]


def test_reject_empty_bid_submit():
    """Verify cannot submit a bid without uploading any documents."""
    t_res = client.get("/api/tenders/GEM/2026/B/7676747")
    tender = t_res.json()
    vendors, _ = vendor_repo.get_all_vendors(limit=10)
    vendor = next((v for v in vendors if "National" in v["legal_name"] or "Reliable" in v["legal_name"]), vendors[-1])

    _cleanup_test_submission(tender["id"], vendor["id"])

    create_res = client.post("/api/bid-submissions", json={
        "tender_id": tender["id"],
        "vendor_id": vendor["id"],
    })
    assert create_res.status_code in (200, 201)
    sub = create_res.json()
    
    # Submit without documents should fail
    submit_res = client.post(f"/api/bid-submissions/{sub['id']}/submit")
    assert submit_res.status_code == 400
    assert "without uploading at least one" in submit_res.json()["detail"]


def test_canonical_tenders_and_vendors_association():
    """Verify the 5 canonical vendors can be resolved and queried."""
    canonical_bidders = [
        "Nexus Infotech",
        "Vanguard Seating",
        "Zenith Ergonomics",
        "Apex Electrical",
        "Voltech Power",
    ]
    vendors, _ = vendor_repo.get_all_vendors(limit=20)
    vendor_names = [v["legal_name"] for v in vendors]

    for bidder in canonical_bidders:
        matched = any(bidder in name for name in vendor_names)
        assert matched, f"Expected canonical vendor matching '{bidder}' in vendors table"
