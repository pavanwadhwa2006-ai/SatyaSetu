"""
SatyaSetu Backend — Storage Service (Phase 6)
Safely handles PDF file uploads, path normalization, Supabase Storage integration,
and resilient local mirror storage for bidder documents.
"""

import os
import re
import uuid
import logging
from pathlib import Path
from typing import Optional, Tuple
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)

VENDOR_DOCS_BUCKET = "vendor-documents"
LOCAL_UPLOAD_BASE = Path(__file__).resolve().parent.parent.parent / "data" / "uploads"


def _sanitize_filename(filename: str) -> str:
    """Strip directory traversal and replace unsafe characters."""
    base = os.path.basename(filename)
    safe = re.sub(r"[^a-zA-Z0-9_\-\.]", "_", base)
    return safe or f"document_{uuid.uuid4().hex[:8]}.pdf"


def save_vendor_document(
    file_bytes: bytes,
    original_filename: str,
    tender_id: str,
    submission_id: str,
    document_id: str,
    mime_type: str = "application/pdf",
) -> Tuple[str, int, str]:
    """
    Saves an uploaded document safely to Supabase Storage and mirrors locally.

    Returns:
        (storage_path, file_size_bytes, mime_type)
    """
    clean_filename = _sanitize_filename(original_filename)
    clean_tender = re.sub(r"[^a-zA-Z0-9_\-]", "_", tender_id)
    clean_submission = re.sub(r"[^a-zA-Z0-9_\-]", "_", submission_id)

    storage_path = f"{clean_tender}/{clean_submission}/{document_id}_{clean_filename}"
    file_size = len(file_bytes)

    # 1. Local mirror storage for fast local access and offline reliability
    try:
        local_dir = LOCAL_UPLOAD_BASE / clean_tender / clean_submission
        local_dir.mkdir(parents=True, exist_ok=True)
        local_file = local_dir / f"{document_id}_{clean_filename}"
        with open(local_file, "wb") as f:
            f.write(file_bytes)
        logger.info("Saved local document mirror: %s", local_file)
    except Exception as exc:
        logger.warning("Local storage mirror warning: %s", exc)

    # 2. Upload to Supabase Storage bucket
    try:
        client = get_supabase_client()
        # Check / create bucket if needed
        try:
            client.storage.create_bucket(VENDOR_DOCS_BUCKET, options={"public": False})
        except Exception:
            pass  # Bucket likely already exists

        # Upload binary bytes
        client.storage.from_(VENDOR_DOCS_BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": mime_type, "upsert": "true"},
        )
        logger.info("Uploaded to Supabase Storage: bucket=%s path=%s", VENDOR_DOCS_BUCKET, storage_path)
    except Exception as exc:
        logger.warning("Supabase Storage upload note (using local mirror fallback): %s", exc)

    return storage_path, file_size, mime_type


def get_document_bytes(storage_path: str) -> Optional[bytes]:
    """Retrieves document binary content from Supabase Storage or local mirror."""
    # Try Supabase storage first
    try:
        client = get_supabase_client()
        data = client.storage.from_(VENDOR_DOCS_BUCKET).download(storage_path)
        if data:
            return data
    except Exception as exc:
        logger.debug("Supabase Storage download fallback to local: %s", exc)

    # Fallback to local mirror
    try:
        local_file = LOCAL_UPLOAD_BASE / storage_path
        if local_file.exists():
            return local_file.read_bytes()
    except Exception as exc:
        logger.error("Error reading local document mirror %s: %s", storage_path, exc)

    return None


def delete_stored_document(storage_path: str) -> bool:
    """Deletes stored file from Supabase storage and local mirror."""
    # Delete from Supabase
    try:
        client = get_supabase_client()
        client.storage.from_(VENDOR_DOCS_BUCKET).remove([storage_path])
    except Exception as exc:
        logger.debug("Supabase storage delete error: %s", exc)

    # Delete local mirror
    try:
        local_file = LOCAL_UPLOAD_BASE / storage_path
        if local_file.exists():
            local_file.unlink()
    except Exception as exc:
        logger.debug("Local file delete error: %s", exc)

    return True
