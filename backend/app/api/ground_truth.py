"""
SatyaSetu Backend — Ground Truth API Endpoints (Phase 3)
Provides canonical benchmark data, requirements, bidders, evidence, and compliance results.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.ground_truth import (
    GroundTruthTenderSchema,
    TenderRequirementSchema,
    GroundTruthBidderSchema,
    BidderDocumentSchema,
    BidderEvidenceSchema,
    ComplianceResultSchema,
    BidderBenchmarkSchema,
    GroundTruthDatasetResponse,
)

router = APIRouter(prefix="/ground-truth", tags=["ground-truth"])

# Canonical structured dataset in Python backend matching the TypeScript layer exactly

GROUND_TRUTH_TENDERS = [
    {
        "id": "tender-t1",
        "bidNumber": "GEM/2026/B/7261466",
        "title": "Procurement of Structural Engineering Software (ETABS, SAFE, SAP2000)",
        "buyer": "Malaviya National Institute of Technology (MNIT) Jaipur",
        "category": "ETABS Ultimate V23, SAFE STD V23 and SAP2000 Ultimate V20 software",
        "estimatedValue": 2450000,
        "estimatedValueFormatted": "₹24.50 Lakh",
        "emdAmount": 49000,
        "emdAmountFormatted": "₹49,000",
        "submissionDeadline": "2026-09-25T15:00:00+05:30",
        "description": "Procurement of structural engineering and finite element analysis software suite.",
        "status": "OPEN",
    },
    {
        "id": "tender-t2",
        "bidNumber": "GEM/2026/B/7364888",
        "title": "Supply and Delivery of Ergonomic Seat Assembly and Back Rest Assembly",
        "buyer": "Artificial Limbs Manufacturing Corporation of India (ALIMCO)",
        "category": "Seat Assembly and Back Rest Assembly",
        "estimatedValue": 3800000,
        "estimatedValueFormatted": "₹38.00 Lakh",
        "emdAmount": 76000,
        "emdAmountFormatted": "₹76,000",
        "submissionDeadline": "2026-09-28T17:00:00+05:30",
        "description": "Supply of ergonomic seat assemblies and back rest assemblies.",
        "status": "OPEN",
    },
    {
        "id": "tender-t3",
        "bidNumber": "GEM/2026/B/7676747",
        "title": "Comprehensive Electrical Repair, Maintenance and Installation Services",
        "buyer": "Trade Marks Registry, IP Bhawan, Ghatlodia, Ahmedabad, Gujarat",
        "category": "Electrical Repair, Maintenance and Installation Services",
        "estimatedValue": 5200000,
        "estimatedValueFormatted": "₹52.00 Lakh",
        "emdAmount": 104000,
        "emdAmountFormatted": "₹1,04,000",
        "submissionDeadline": "2026-10-05T16:00:00+05:30",
        "description": "Comprehensive electrical repair and maintenance services for institutional campus.",
        "status": "OPEN",
    },
]

GROUND_TRUTH_BIDDERS = [
    {
        "id": "bidder-t1-b2",
        "tenderId": "tender-t1",
        "bidderCode": "T1-B2",
        "legalName": "Nexus Infotech & Trading Private Limited",
        "shortName": "Nexus Infotech",
        "cin": "U72900RJ2021PTC074521",
        "pan": "AABCN1234F",
        "gstin": "08AABCN1234F1Z5",
        "udyamNumber": "UDYAM-RJ-14-0012345",
        "enterpriseType": "MICRO",
        "businessType": "TRADER",
        "registeredAddress": "B-12, Malviya Industrial Area, Jaipur, Rajasthan",
        "state": "Rajasthan",
        "city": "Jaipur",
        "pincode": "302017",
        "authorizedSignatory": "Rajesh Sharma",
        "phone": "+91 98290 12345",
        "email": "tenders@nexusinfotech.co.in",
    },
    {
        "id": "bidder-t2-b1",
        "tenderId": "tender-t2",
        "bidderCode": "T2-B1",
        "legalName": "Vanguard Seating Systems Private Limited",
        "shortName": "Vanguard Seating",
        "cin": "U36100UP2016PTC081234",
        "pan": "AABCV5678G",
        "gstin": "09AABCV5678G1Z2",
        "udyamNumber": "UDYAM-UP-48-0056789",
        "enterpriseType": "SMALL",
        "businessType": "MANUFACTURER",
        "registeredAddress": "Plot 42, Panki Industrial Area, Kanpur, Uttar Pradesh",
        "state": "Uttar Pradesh",
        "city": "Kanpur",
        "pincode": "208022",
        "authorizedSignatory": "Vikram Singh",
        "phone": "+91 94150 56789",
        "email": "bids@vanguardseating.in",
    },
    {
        "id": "bidder-t2-b2",
        "tenderId": "tender-t2",
        "bidderCode": "T2-B2",
        "legalName": "Zenith Ergonomics & Components Private Limited",
        "shortName": "Zenith Ergonomics",
        "cin": "U36999DL2023PTC412345",
        "pan": "AABCZ9012H",
        "gstin": "07AABCZ9012H1Z8",
        "udyamNumber": "UDYAM-DL-08-0098765",
        "enterpriseType": "MICRO",
        "businessType": "TRADER",
        "registeredAddress": "104, Okhla Industrial Estate Phase-III, New Delhi",
        "state": "Delhi",
        "city": "New Delhi",
        "pincode": "110020",
        "authorizedSignatory": "Ananya Gupta",
        "phone": "+91 98110 90123",
        "email": "contact@zenithergonomics.com",
    },
    {
        "id": "bidder-t3-b1",
        "tenderId": "tender-t3",
        "bidderCode": "T3-B1",
        "legalName": "Apex Electrical Solutions Private Limited",
        "shortName": "Apex Electrical",
        "cin": "U40106GJ2018PTC102345",
        "pan": "AABCA3456K",
        "gstin": "24AABCA3456K1ZG",
        "udyamNumber": "UDYAM-GJ-01-0034567",
        "enterpriseType": "SMALL",
        "businessType": "SERVICE_PROVIDER",
        "registeredAddress": "302, Synergy Tower, Near IP Bhawan, Ghatlodia, Ahmedabad, Gujarat",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "pincode": "380061",
        "authorizedSignatory": "Harsh Patel",
        "phone": "+91 97270 34567",
        "email": "tenders@apexelectrical.in",
    },
    {
        "id": "bidder-t3-b2",
        "tenderId": "tender-t3",
        "bidderCode": "T3-B2",
        "legalName": "Voltech Power & Infra Services Private Limited",
        "shortName": "Voltech Power",
        "cin": "U40108DL2019PTC114567",
        "pan": "AABCV7890L",
        "gstin": "07AABCV7890L1ZE",
        "udyamNumber": "UDYAM-DL-03-0078901",
        "enterpriseType": "MICRO",
        "businessType": "SERVICE_PROVIDER",
        "registeredAddress": "12, Nehru Place Commercial Complex, New Delhi",
        "state": "Delhi",
        "city": "New Delhi",
        "pincode": "110019",
        "authorizedSignatory": "Deepak Verma",
        "phone": "+91 98100 78901",
        "email": "govtbids@voltechpower.in",
    },
]

BIDDER_BENCHMARKS = [
    {
        "bidderId": "bidder-t1-b2",
        "bidderCode": "T1-B2",
        "legalName": "Nexus Infotech & Trading Private Limited",
        "tenderId": "tender-t1",
        "bidNumber": "GEM/2026/B/7261466",
        "benchmarkStatus": "NON_COMPLIANT",
        "benchmarkLabel": "Non-Compliant (Disqualified)",
        "summaryReason": "Failed 8 mandatory criteria including Bidder Turnover, OEM Turnover, Expired MAF, Experience Value, Client Type, EMD, Service Centre, and Unnotarized Affidavit.",
        "failingRequirementsCount": 8,
        "reviewRequirementsCount": 2,
        "passingRequirementsCount": 0,
    },
    {
        "bidderId": "bidder-t2-b1",
        "bidderCode": "T2-B1",
        "legalName": "Vanguard Seating Systems Private Limited",
        "tenderId": "tender-t2",
        "bidNumber": "GEM/2026/B/7364888",
        "benchmarkStatus": "COMPLIANT",
        "benchmarkLabel": "Compliant (Qualified)",
        "summaryReason": "Passed all 10 evaluated requirements with full documentary proof: Turnover ₹49.17L, Past Performance 8,000 units, CRAC verified, In-house OEM, 78.4% MII, and MSE exemption.",
        "failingRequirementsCount": 0,
        "reviewRequirementsCount": 0,
        "passingRequirementsCount": 10,
    },
    {
        "bidderId": "bidder-t2-b2",
        "bidderCode": "T2-B2",
        "legalName": "Zenith Ergonomics & Components Private Limited",
        "tenderId": "tender-t2",
        "bidNumber": "GEM/2026/B/7364888",
        "benchmarkStatus": "REVIEW",
        "benchmarkLabel": "Review Required / Non-Compliant",
        "summaryReason": "Requires human officer review. Failed 7 mandatory criteria with 3 review flags (Provisional DPIIT Startup ack, Self-declared 52% MII, Address mismatch).",
        "failingRequirementsCount": 8,
        "reviewRequirementsCount": 3,
        "passingRequirementsCount": 0,
    },
    {
        "bidderId": "bidder-t3-b1",
        "bidderCode": "T3-B1",
        "legalName": "Apex Electrical Solutions Private Limited",
        "tenderId": "tender-t3",
        "bidNumber": "GEM/2026/B/7676747",
        "benchmarkStatus": "COMPLIANT",
        "benchmarkLabel": "Compliant (Qualified)",
        "summaryReason": "Passed all 8 mandatory requirements: Turnover ₹5.20L, Govt electrical contract experience, Class-A Gujarat license valid to 2029, Ahmedabad premises, filed GST returns, and Solvency.",
        "failingRequirementsCount": 0,
        "reviewRequirementsCount": 0,
        "passingRequirementsCount": 8,
    },
    {
        "bidderId": "bidder-t3-b2",
        "bidderCode": "T3-B2",
        "legalName": "Voltech Power & Infra Services Private Limited",
        "tenderId": "tender-t3",
        "bidNumber": "GEM/2026/B/7676747",
        "benchmarkStatus": "NON_COMPLIANT",
        "benchmarkLabel": "Non-Compliant (Disqualified)",
        "summaryReason": "Failed all 10 evaluated requirements: Turnover ₹2.40L, Delhi GSTIN without Gujarat registration, LED bulb supply only, Expired license, Pending GST returns, and Active NCLT Insolvency.",
        "failingRequirementsCount": 10,
        "reviewRequirementsCount": 0,
        "passingRequirementsCount": 0,
    },
]


@router.get(
    "/tenders",
    response_model=list[GroundTruthTenderSchema],
    summary="List Ground Truth Tenders",
    description="Returns the 3 canonical tenders in the Ground Truth dataset.",
)
def get_ground_truth_tenders() -> list[GroundTruthTenderSchema]:
    return [GroundTruthTenderSchema(**t) for t in GROUND_TRUTH_TENDERS]


@router.get(
    "/bidders",
    response_model=list[GroundTruthBidderSchema],
    summary="List Ground Truth Bidders",
    description="Returns the 5 normalized bidders (T1-B2, T2-B1, T2-B2, T3-B1, T3-B2).",
)
def get_ground_truth_bidders(
    tender_id: Optional[str] = Query(None, description="Filter bidders by tender ID")
) -> list[GroundTruthBidderSchema]:
    bidders = GROUND_TRUTH_BIDDERS
    if tender_id:
        bidders = [b for b in bidders if b["tenderId"] == tender_id]
    return [GroundTruthBidderSchema(**b) for b in bidders]


@router.get(
    "/benchmarks",
    response_model=list[BidderBenchmarkSchema],
    summary="List Master Bidder Benchmarks",
    description="Returns the expected master compliance benchmarks for all 5 bidders.",
)
def get_ground_truth_benchmarks(
    bidder_id: Optional[str] = Query(None, description="Filter benchmark by bidder ID or bidder code")
) -> list[BidderBenchmarkSchema]:
    benchmarks = BIDDER_BENCHMARKS
    if bidder_id:
        benchmarks = [bm for bm in benchmarks if bm["bidderId"] == bidder_id or bm["bidderCode"] == bidder_id]
    return [BidderBenchmarkSchema(**bm) for bm in benchmarks]
