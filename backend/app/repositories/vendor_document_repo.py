"""
SatyaSetu Backend — Vendor Document Repository (Phase 6)
Handles database operations for the vendor_documents table.
"""

import logging
from typing import Optional, Any
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)

DOC_COLUMNS = "id, bid_submission_id, vendor_id, original_filename, storage_path, mime_type, file_size, document_type, processing_status, uploaded_by, created_at"


def create_vendor_document(doc_data: dict[str, Any]) -> dict[str, Any]:
    """Inserts a new vendor document record."""
    client = get_supabase_client()
    try:
        response = client.table("vendor_documents").insert(doc_data).execute()
        if response and response.data:
            return response.data[0] if isinstance(response.data, list) else response.data
        return doc_data
    except Exception as exc:
        logger.error("DB error creating vendor document: %s", exc)
        raise


def get_documents_by_submission(bid_submission_id: str) -> list[dict[str, Any]]:
    """Retrieves all documents associated with a bid submission."""
    client = get_supabase_client()
    try:
        response = (
            client.table("vendor_documents")
            .select(DOC_COLUMNS)
            .eq("bid_submission_id", bid_submission_id)
            .order("created_at", desc=False)
            .execute()
        )
        return response.data or []
    except Exception as exc:
        logger.error("DB error fetching documents for submission %s: %s", bid_submission_id, exc)
        raise


def get_document_by_id(document_id: str) -> Optional[dict[str, Any]]:
    """Retrieves a single vendor document by UUID."""
    client = get_supabase_client()
    try:
        response = (
            client.table("vendor_documents")
            .select(DOC_COLUMNS)
            .eq("id", document_id)
            .execute()
        )
        if response and response.data:
            return response.data[0] if isinstance(response.data, list) else response.data
        return None
    except Exception as exc:
        logger.error("DB error fetching vendor document %s: %s", document_id, exc)
        raise


def delete_document(document_id: str) -> bool:
    """Deletes a vendor document record."""
    client = get_supabase_client()
    try:
        client.table("vendor_documents").delete().eq("id", document_id).execute()
        return True
    except Exception as exc:
        logger.error("DB error deleting vendor document %s: %s", document_id, exc)
        raise


def count_documents_by_submission(bid_submission_id: str) -> int:
    """Returns the total number of documents uploaded for a bid submission."""
    client = get_supabase_client()
    try:
        response = (
            client.table("vendor_documents")
            .select("id", count="exact")
            .eq("bid_submission_id", bid_submission_id)
            .execute()
        )
        return response.count or len(response.data or [])
    except Exception as exc:
        logger.error("DB error counting documents for submission %s: %s", bid_submission_id, exc)
        return 0
