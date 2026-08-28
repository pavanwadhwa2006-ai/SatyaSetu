"""
SatyaSetu Backend — Dashboard Analytics & Metrics Endpoints
Calculates real metrics dynamically from database tables.
"""

import logging
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardStatsResponse(BaseModel):
    active_tenders: int
    total_tenders: int
    total_bids: int
    submitted_bids: int
    draft_bids: int
    total_vendors: int


@router.get("/stats", response_model=DashboardStatsResponse, summary="Get dynamic dashboard statistics")
def get_dashboard_stats() -> DashboardStatsResponse:
    client = get_supabase_client()
    try:
        # 1. Tenders count
        tenders_res = client.table("tenders").select("id, status", count="exact").execute()
        tenders = tenders_res.data or []
        total_tenders = len(tenders)
        active_tenders = sum(1 for t in tenders if t.get("status") == "OPEN")

        # 2. Submissions count
        bids_res = client.table("bid_submissions").select("id, status", count="exact").execute()
        bids = bids_res.data or []
        total_bids = len(bids)
        submitted_bids = sum(1 for b in bids if b.get("status") == "SUBMITTED")
        draft_bids = sum(1 for b in bids if b.get("status") == "DRAFT")

        # 3. Vendors count
        vendors_res = client.table("vendors").select("id", count="exact").execute()
        total_vendors = (vendors_res.count if vendors_res else 0) or len(vendors_res.data or [])

        return DashboardStatsResponse(
            active_tenders=active_tenders,
            total_tenders=total_tenders,
            total_bids=total_bids,
            submitted_bids=submitted_bids,
            draft_bids=draft_bids,
            total_vendors=total_vendors,
        )
    except Exception as exc:
        logger.error("Failed to compute dashboard stats: %s", exc)
        return DashboardStatsResponse(
            active_tenders=0,
            total_tenders=0,
            total_bids=0,
            submitted_bids=0,
            draft_bids=0,
            total_vendors=0,
        )
