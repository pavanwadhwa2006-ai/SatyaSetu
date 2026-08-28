"""
SatyaSetu Backend — Ground Truth Dataset & Benchmark Tests (Phase 3)
Validates the canonical Ground Truth layer, 5 normalized bidders, and expected benchmarks.
"""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_ground_truth_tenders():
    """Verify GET /api/ground-truth/tenders returns the 3 canonical tenders."""
    response = client.get("/api/ground-truth/tenders")
    assert response.status_code == 200
    tenders = response.json()
    assert len(tenders) == 3
    
    bid_numbers = {t["bidNumber"] for t in tenders}
    assert "GEM/2026/B/7261466" in bid_numbers
    assert "GEM/2026/B/7364888" in bid_numbers
    assert "GEM/2026/B/7676747" in bid_numbers


def test_get_ground_truth_bidders():
    """Verify GET /api/ground-truth/bidders returns the 5 normalized bidders."""
    response = client.get("/api/ground-truth/bidders")
    assert response.status_code == 200
    bidders = response.json()
    assert len(bidders) == 5
    
    bidder_codes = {b["bidderCode"] for b in bidders}
    assert bidder_codes == {"T1-B2", "T2-B1", "T2-B2", "T3-B1", "T3-B2"}


def test_apex_normalization():
    """Verify Apex Electrical is normalized to T3-B1 under tender-t3, NOT T5-B1."""
    response = client.get("/api/ground-truth/bidders")
    assert response.status_code == 200
    bidders = response.json()
    
    apex = next((b for b in bidders if "Apex Electrical" in b["legalName"]), None)
    assert apex is not None
    assert apex["bidderCode"] == "T3-B1"
    assert apex["tenderId"] == "tender-t3"


def test_all_five_bidder_benchmarks():
    """Verify master benchmark results for all 5 bidders."""
    response = client.get("/api/ground-truth/benchmarks")
    assert response.status_code == 200
    benchmarks = response.json()
    assert len(benchmarks) == 5
    
    bm_map = {bm["bidderCode"]: bm for bm in benchmarks}
    
    # Nexus T1-B2 -> NON_COMPLIANT
    assert bm_map["T1-B2"]["benchmarkStatus"] == "NON_COMPLIANT"
    assert bm_map["T1-B2"]["failingRequirementsCount"] >= 1
    
    # Vanguard T2-B1 -> COMPLIANT
    assert bm_map["T2-B1"]["benchmarkStatus"] == "COMPLIANT"
    assert bm_map["T2-B1"]["failingRequirementsCount"] == 0
    
    # Zenith T2-B2 -> REVIEW
    assert bm_map["T2-B2"]["benchmarkStatus"] == "REVIEW"
    assert bm_map["T2-B2"]["reviewRequirementsCount"] >= 1
    
    # Apex T3-B1 -> COMPLIANT
    assert bm_map["T3-B1"]["benchmarkStatus"] == "COMPLIANT"
    assert bm_map["T3-B1"]["failingRequirementsCount"] == 0
    
    # Voltech T3-B2 -> NON_COMPLIANT
    assert bm_map["T3-B2"]["benchmarkStatus"] == "NON_COMPLIANT"
    assert bm_map["T3-B2"]["failingRequirementsCount"] >= 1
