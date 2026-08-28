"""
SatyaSetu Backend — Tender Intelligence Tests (Phase 5)
Validates machine-readable requirement transformation, normalization, percentage bases,
exemption metadata, and backward compatibility with Phase 3 Ground Truth.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_all_structured_requirements_count():
    """Verify GET /api/tender-intelligence/requirements returns all 34 canonical requirements."""
    response = client.get("/api/tender-intelligence/requirements")
    assert response.status_code == 200
    reqs = response.json()
    assert len(reqs) == 34


def test_three_active_tenders_requirements():
    """Verify each of the 3 active tenders returns its exact canonical requirements."""
    # Tender 1: MNIT Software
    r1 = client.get("/api/tender-intelligence/tender-t1/requirements")
    assert r1.status_code == 200
    reqs_t1 = r1.json()
    assert len(reqs_t1) == 10
    assert all(r["tenderId"] == "tender-t1" for r in reqs_t1)

    # Tender 2: ALIMCO Seats
    r2 = client.get("/api/tender-intelligence/tender-t2/requirements")
    assert r2.status_code == 200
    reqs_t2 = r2.json()
    assert len(reqs_t2) == 14
    assert all(r["tenderId"] == "tender-t2" for r in reqs_t2)

    # Tender 3: Trade Marks Registry Electrical
    r3 = client.get("/api/tender-intelligence/tender-t3/requirements")
    assert r3.status_code == 200
    reqs_t3 = r3.json()
    assert len(reqs_t3) == 10
    assert all(r["tenderId"] == "tender-t3" for r in reqs_t3)


def test_lookup_by_gem_bid_number():
    """Verify endpoint supports lookup by GeM bid number with slashes."""
    response = client.get("/api/tender-intelligence/GEM/2026/B/7261466/requirements")
    assert response.status_code == 200
    reqs = response.json()
    assert len(reqs) == 10


def test_numeric_normalization_accuracy():
    """Verify financial and numeric fields are accurately normalized to integers/floats."""
    response = client.get("/api/tender-intelligence/requirements")
    assert response.status_code == 200
    reqs = {r["requirementCode"]: r for r in response.json()}

    # REQ-T1-001: ₹5.00 Lakh -> 500000
    assert reqs["REQ-T1-001"]["normalizedField"] == "bidder_turnover_annual_avg"
    assert reqs["REQ-T1-001"]["normalizedValue"] == 500000
    assert reqs["REQ-T1-001"]["thresholdUnit"] == "INR"

    # REQ-T1-002: ₹42.00 Lakh -> 4200000
    assert reqs["REQ-T1-002"]["normalizedField"] == "oem_turnover_annual_avg"
    assert reqs["REQ-T1-002"]["normalizedValue"] == 4200000

    # REQ-T2-001: ₹34.00 Lakh -> 3400000
    assert reqs["REQ-T2-001"]["normalizedValue"] == 3400000

    # REQ-T3-001: ₹3.00 Lakh -> 300000
    assert reqs["REQ-T3-001"]["normalizedValue"] == 300000


def test_percentage_based_requirements_and_bases():
    """Verify percentage-based requirements preserve their decimal percentage and base value."""
    response = client.get("/api/tender-intelligence/requirements")
    assert response.status_code == 200
    reqs = {r["requirementCode"]: r for r in response.json()}

    # REQ-T1-004: Past order value = 15% of estimated tender value
    assert reqs["REQ-T1-004"]["operator"] == "PERCENT_OF"
    assert reqs["REQ-T1-004"]["thresholdPercentage"] == 0.15
    assert reqs["REQ-T1-004"]["baseValue"] == "tender.estimatedValue"
    assert reqs["REQ-T1-004"]["normalizedValue"] == 367500

    # REQ-T2-002: Past performance = 10% of total quantity
    assert reqs["REQ-T2-002"]["operator"] == "PERCENT_OF"
    assert reqs["REQ-T2-002"]["thresholdPercentage"] == 0.10
    assert reqs["REQ-T2-002"]["baseValue"] == "tender.totalQuantity"
    assert reqs["REQ-T2-002"]["normalizedValue"] == 6000

    # REQ-T2-005: Local content >= 50%
    assert reqs["REQ-T2-005"]["operator"] == ">="
    assert reqs["REQ-T2-005"]["thresholdPercentage"] == 0.50
    assert reqs["REQ-T2-005"]["normalizedValue"] == 0.50


def test_exemption_metadata_structure():
    """Verify exemptions are represented as structured metadata."""
    response = client.get("/api/tender-intelligence/tender-t1/requirements")
    assert response.status_code == 200
    reqs = {r["requirementCode"]: r for r in response.json()}

    emd_req = reqs["REQ-T1-006"]
    assert emd_req["exemptionMetadata"] is not None
    assert "MSE_MANUFACTURER" in emd_req["exemptionMetadata"]["qualifiesFor"]
    assert emd_req["exemptionMetadata"]["requiredEvidence"] == "UDYAM_CERTIFICATE"


def test_evidence_requirements_presence():
    """Verify evidenceRequired arrays are populated for key requirements."""
    response = client.get("/api/tender-intelligence/requirements")
    assert response.status_code == 200
    for req in response.json():
        assert "evidenceRequired" in req
        assert isinstance(req["evidenceRequired"], list)
        assert len(req["evidenceRequired"]) >= 1


def test_source_traceability_preserved():
    """Verify source document, page number, and clause are populated for every requirement."""
    response = client.get("/api/tender-intelligence/requirements")
    assert response.status_code == 200
    for req in response.json():
        assert req["sourceDocument"].endswith(".pdf")
        assert req["sourcePage"] >= 1
        assert "Clause" in req["sourceClause"]


def test_tender_summary_endpoint():
    """Verify GET /api/tender-intelligence/{tender_id}/summary returns aggregated intelligence."""
    response = client.get("/api/tender-intelligence/tender-t2/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["bidNumber"] == "GEM/2026/B/7364888"
    assert data["totalRequirementsCount"] == 14
    assert data["mandatoryRequirementsCount"] >= 10
    assert len(data["requirements"]) == 14


def test_phase3_endpoints_compatibility():
    """Verify Phase 3 Ground Truth endpoints continue to work without disruption."""
    t_res = client.get("/api/ground-truth/tenders")
    assert t_res.status_code == 200
    assert len(t_res.json()) == 3

    b_res = client.get("/api/ground-truth/bidders")
    assert b_res.status_code == 200
    assert len(b_res.json()) == 5

    # Verify Apex normalization
    apex = next(b for b in b_res.json() if "Apex" in b["legalName"])
    assert apex["bidderCode"] == "T3-B1"

    bm_res = client.get("/api/ground-truth/benchmarks")
    assert bm_res.status_code == 200
    assert len(bm_res.json()) == 5
