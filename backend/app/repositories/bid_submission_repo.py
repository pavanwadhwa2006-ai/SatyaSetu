"""
SatyaSetu Backend — Bid Submission Repository (Phase 6)
Handles database operations for the bid_submissions table.
"""

import logging
from typing import Optional, Any
from datetime import datetime, timezone
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)

SUBMISSION_COLUMNS = "id, tender_id, vendor_id, status, submitted_at, created_at, updated_at"


def create_bid_submission(tender_id: str, vendor_id: str, status: str = "DRAFT") -> dict[str, Any]:
    """Inserts a new bid submission record."""
    client = get_supabase_client()
    payload = {
        "tender_id": tender_id,
        "vendor_id": vendor_id,
        "status": status,
    }
    try:
        response = client.table("bid_submissions").insert(payload).execute()
        if response and response.data:
            if isinstance(response.data, list):
                return response.data[0]
            return response.data
        raise RuntimeError("No data returned from bid_submissions insert")
    except Exception as exc:
        logger.error("DB error creating bid submission for tender %s vendor %s: %s", tender_id, vendor_id, exc)
        raise


def get_bid_submission_by_id(submission_id: str) -> Optional[dict[str, Any]]:
    """Retrieves a single bid submission by UUID."""
    client = get_supabase_client()
    try:
        response = client.table("bid_submissions").select(SUBMISSION_COLUMNS).eq("id", submission_id).execute()
        if response and response.data:
            return response.data[0] if isinstance(response.data, list) else response.data
        return None
    except Exception as exc:
        logger.error("DB error fetching bid submission %s: %s", submission_id, exc)
        raise


def get_submission_by_tender_and_vendor(tender_id: str, vendor_id: str) -> Optional[dict[str, Any]]:
    """Retrieves existing bid submission for a specific tender and vendor pair."""
    client = get_supabase_client()
    try:
        response = (
            client.table("bid_submissions")
            .select(SUBMISSION_COLUMNS)
            .eq("tender_id", tender_id)
            .eq("vendor_id", vendor_id)
            .execute()
        )
        if response and response.data:
            return response.data[0] if isinstance(response.data, list) else response.data
        return None
    except Exception as exc:
        logger.error("DB error finding submission for tender %s vendor %s: %s", tender_id, vendor_id, exc)
        raise


def get_bid_submissions(
    vendor_id: Optional[str] = None,
    tender_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[dict[str, Any]], int]:
    """Fetches list of bid submissions with optional filters."""
    client = get_supabase_client()
    try:
        query = client.table("bid_submissions").select(SUBMISSION_COLUMNS, count="exact")
        if vendor_id:
            query = query.eq("vendor_id", vendor_id)
        if tender_id:
            query = query.eq("tender_id", tender_id)
        if status:
            query = query.eq("status", status)

        response = query.order("created_at", desc=True).range(offset, offset + limit - 1).execute()
        return (response.data if response else []) or [], (response.count if response else 0) or 0
    except Exception as exc:
        logger.error("DB error fetching bid submissions: %s", exc)
        raise


def update_bid_submission_status(
    submission_id: str,
    status: str,
    submitted_at: Optional[datetime] = None,
) -> dict[str, Any]:
    """Updates status and optional submitted_at timestamp of a bid submission."""
    client = get_supabase_client()
    payload: dict[str, Any] = {"status": status}
    if submitted_at:
        payload["submitted_at"] = submitted_at.isoformat()

    try:
        response = (
            client.table("bid_submissions")
            .update(payload)
            .eq("id", submission_id)
            .execute()
        )
        if response and response.data:
            return response.data[0] if isinstance(response.data, list) else response.data
        # Fallback to fetching updated row
        return get_bid_submission_by_id(submission_id) or {"id": submission_id, "status": status}
    except Exception as exc:
        logger.error("DB error updating status for submission %s to %s: %s", submission_id, status, exc)
        raise


def delete_bid_submission(submission_id: str) -> bool:
    """Deletes a bid submission (only allowed for DRAFT)."""
    client = get_supabase_client()
    try:
        client.table("bid_submissions").delete().eq("id", submission_id).execute()
        return True
    except Exception as exc:
        logger.error("DB error deleting bid submission %s: %s", submission_id, exc)
        raise
