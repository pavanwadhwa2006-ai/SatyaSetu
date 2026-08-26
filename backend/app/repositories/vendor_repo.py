"""
SatyaSetu Backend — Vendor Repository
All database queries for the vendors table go here.
"""

import logging
from typing import Optional
from app.core.database import get_supabase_client
from app.schemas.vendor import VendorCreate

logger = logging.getLogger(__name__)

VENDOR_COLUMNS = "id, user_id, legal_name, display_name, status, created_at, updated_at"


def get_all_vendors(limit: int = 100, offset: int = 0) -> tuple[list[dict], int]:
    """
    Fetch all vendors (officer-only use).

    Returns:
        (list of vendor dicts, total count)
    """
    client = get_supabase_client()
    try:
        response = (
            client.table("vendors")
            .select(VENDOR_COLUMNS, count="exact")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        return response.data or [], response.count or 0
    except Exception as exc:
        logger.error("DB error fetching vendors: %s", exc)
        raise


def get_vendor_by_id(vendor_id: str) -> Optional[dict]:
    """Fetch a single vendor by UUID."""
    client = get_supabase_client()
    try:
        response = (
            client.table("vendors")
            .select(VENDOR_COLUMNS)
            .eq("id", vendor_id)
            .maybe_single()
            .execute()
        )
        return response.data
    except Exception as exc:
        logger.error("DB error fetching vendor %s: %s", vendor_id, exc)
        raise


def get_vendor_by_user_id(user_id: str) -> Optional[dict]:
    """Fetch the vendor profile linked to a specific auth user."""
    client = get_supabase_client()
    try:
        response = (
            client.table("vendors")
            .select(VENDOR_COLUMNS)
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        return response.data
    except Exception as exc:
        logger.error("DB error fetching vendor for user %s: %s", user_id, exc)
        raise


def create_vendor(data: VendorCreate, user_id: Optional[str] = None) -> dict:
    """
    Insert a new vendor record.

    Args:
        data: Validated VendorCreate schema
        user_id: Auth user UUID to link (if creating own vendor profile)

    Returns:
        Newly created vendor dict
    """
    client = get_supabase_client()
    payload = data.model_dump(exclude_none=True)
    if user_id:
        payload["user_id"] = user_id

    try:
        response = (
            client.table("vendors")
            .insert(payload)
            .select(VENDOR_COLUMNS)
            .single()
            .execute()
        )
        return response.data
    except Exception as exc:
        logger.error("DB error creating vendor: %s", exc)
        raise
