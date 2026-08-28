"""
SatyaSetu Backend — Tender API & Dataset Tests (Phase 2)
Tests that the 5 actual GeM tenders exist and match all requirements.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

EXPECTED_TENDER_NUMBERS = {
    "GEM/2026/B/7261466",
    "GEM/2026/B/7364888",
    "GEM/2026/B/7676747",
    "GEM/2026/B/7878577",
    "GEM/2026/B/7903799",
}


def test_list_tenders_status_and_count():
    """Verify GET /api/tenders returns HTTP 200 and exactly 5 tenders."""
    response = client.get("/api/tenders")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] == 5
    assert len(data["items"]) == 5


def test_actual_five_tenders_present():
    """Verify all 5 required GeM tender numbers are present with no duplicates."""
    response = client.get("/api/tenders")
    assert response.status_code == 200
    items = response.json()["items"]
    
    tender_numbers = [t["tender_number"] for t in items]
    
    # Verify uniqueness
    assert len(tender_numbers) == len(set(tender_numbers)), "Found duplicate tender numbers!"
    
    # Verify all expected tender numbers exist
    assert set(tender_numbers) == EXPECTED_TENDER_NUMBERS


def test_tender_metadata_structure():
    """Verify tender metadata structure and document association."""
    response = client.get("/api/tenders")
    assert response.status_code == 200
    items = response.json()["items"]
    
    for tender in items:
        assert tender["id"] is not None
        assert tender["tender_number"] in EXPECTED_TENDER_NUMBERS
        assert tender["title"] is not None and len(tender["title"]) > 0
        assert tender["organization"] is not None
        assert tender["source"] == "GEM_PUBLIC"
        assert tender["status"] in {"OPEN", "EVALUATION", "CLOSED", "AWARDED"}
        assert isinstance(tender.get("documents"), list)
        assert len(tender["documents"]) >= 1
        assert tender["documents"][0]["original_filename"].endswith(".pdf")


def test_get_single_tender_by_id():
    """Verify GET /api/tenders/{id} returns the specific tender by UUID."""
    list_res = client.get("/api/tenders")
    items = list_res.json()["items"]
    first_tender = items[0]
    
    single_res = client.get(f"/api/tenders/{first_tender['id']}")
    assert single_res.status_code == 200
    data = single_res.json()
    assert data["id"] == first_tender["id"]
    assert data["tender_number"] == first_tender["tender_number"]
    assert data["title"] == first_tender["title"]
    assert len(data["documents"]) >= 1


def test_get_single_tender_by_number():
    """Verify GET /api/tenders/{tender_number} also resolves."""
    target_num = "GEM/2026/B/7261466"
    # Using URL-encoded path for tender number with slashes
    import urllib.parse
    encoded_num = urllib.parse.quote(target_num, safe="")
    single_res = client.get(f"/api/tenders/{encoded_num}")
    assert single_res.status_code == 200
    data = single_res.json()
    assert data["tender_number"] == target_num


def test_get_tender_not_found():
    """Verify GET /api/tenders/{invalid_id} returns 404."""
    response = client.get("/api/tenders/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


def test_get_dashboard_stats():
    """Verify GET /api/dashboard/stats returns dynamic database-calculated metrics."""
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "active_tenders" in data
    assert "total_tenders" in data
    assert "total_bids" in data
    assert "submitted_bids" in data
    assert "draft_bids" in data
    assert "total_vendors" in data
    assert data["total_tenders"] >= 5
    assert data["active_tenders"] >= 3
