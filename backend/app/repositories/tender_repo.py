"""
SatyaSetu Backend — Tender Repository
All database queries for the tenders table go here.
Uses the Supabase service_role client for server-side operations.
"""

import logging
import uuid
from typing import Optional
from app.core.database import get_supabase_client
from app.schemas.tender import TenderCreate

logger = logging.getLogger(__name__)

# Columns to select with documents relation
TENDER_COLUMNS = (
    "id, tender_number, title, organization, department, category, description, "
    "source, status, estimated_value, submission_deadline, publish_date, "
    "bid_validity_days, evaluation_type, delivery_location, delivery_period_days, "
    "warranty_months, emd_amount, created_by, created_at, updated_at, "
    "documents:tender_documents(*)"
)


def get_all_tenders(
    status_filter: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> tuple[list[dict], int]:
    """
    Fetch all tenders with optional status filter.

    Returns:
        (list of tender dicts, total count)
    """
    client = get_supabase_client()
    query = client.table("tenders").select(TENDER_COLUMNS, count="exact")

    if status_filter:
        query = query.eq("status", status_filter)

    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)

    try:
        response = query.execute()
        return (response.data if response else []) or [], (response.count if response else 0) or 0
    except Exception as exc:
        logger.error("DB error fetching tenders: %s", exc)
        raise


def get_tender_by_id(tender_id: str) -> Optional[dict]:
    """
    Fetch a single tender by UUID or tender_number.

    Returns:
        Tender dict or None if not found.
    """
    client = get_supabase_client()
    try:
        is_uuid = False
        try:
            uuid.UUID(str(tender_id))
            is_uuid = True
        except (ValueError, AttributeError):
            is_uuid = False

        query = client.table("tenders").select(TENDER_COLUMNS)
        if is_uuid:
            response = query.eq("id", tender_id).maybe_single().execute()
        else:
            response = query.eq("tender_number", tender_id).maybe_single().execute()

        if response is None:
            return None
        return response.data
    except Exception as exc:
        logger.error("DB error fetching tender %s: %s", tender_id, exc)
        raise


def create_tender(data: TenderCreate, created_by: Optional[str] = None) -> dict:
    """
    Insert a new tender record.

    Args:
        data: Validated TenderCreate schema
        created_by: UUID of the user creating the tender (officer)

    Returns:
        Newly created tender dict
    """
    client = get_supabase_client()
    payload = data.model_dump(exclude_none=True)
    if created_by:
        payload["created_by"] = created_by

    # Convert date/datetime to ISO string for Supabase
    for key in ("submission_deadline", "publish_date"):
        if key in payload and payload[key] is not None:
            payload[key] = payload[key].isoformat()

    try:
        response = (
            client.table("tenders")
            .insert(payload)
            .select(TENDER_COLUMNS)
            .single()
            .execute()
        )
        return response.data
    except Exception as exc:
        logger.error("DB error creating tender: %s", exc)
        raise
