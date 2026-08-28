"""
SatyaSetu Backend — Bid Submissions API Router (Phase 6)
Provides complete endpoints for tender selection, draft creation, multi-document PDF uploads,
storage persistence, lifecycle management, and bid submission finalization.
"""

import io
import uuid
import logging
from typing import Optional
from datetime import datetime, timezone
from fastapi import (
    APIRouter,
    HTTPException,
    UploadFile,
    File,
    Form,
    Query,
    Depends,
    status,
)
from fastapi.responses import StreamingResponse

from app.schemas.bid_submission import (
    BidSubmissionCreate,
    BidSubmissionResponse,
    BidSubmissionListResponse,
    VendorDocumentResponse,
    BidSubmitActionResponse,
)
from app.repositories import (
    bid_submission_repo,
    vendor_document_repo,
    tender_repo,
    vendor_repo,
)
from app.services import storage_service
from app.core.dependencies import get_current_user_optional
from app.schemas.auth import CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/bid-submissions", tags=["bid-submissions"])

# Maximum allowed upload size: 25 MB
MAX_UPLOAD_SIZE = 25 * 1024 * 1024


def _resolve_tender_id(tender_ref: str) -> dict:
    """Finds tender record by UUID or tender_number."""
    tender = tender_repo.get_tender_by_id(tender_ref)
    if not tender:
        tender = tender_repo.get_tender_by_number(tender_ref)
    if not tender:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Tender not found for identifier: {tender_ref}",
        )
    return tender


def _resolve_vendor_id(vendor_ref: Optional[str], user: Optional[CurrentUser]) -> dict:
    """Finds or resolves vendor record."""
    if vendor_ref:
        vendor = vendor_repo.get_vendor_by_id(vendor_ref)
        if vendor:
            return vendor
        # Maybe vendor_ref is legal_name?
        vendors, _ = vendor_repo.get_all_vendors(limit=100)
        matched = next((v for v in vendors if v["legal_name"].lower() == vendor_ref.lower() or v.get("display_name", "").lower() == vendor_ref.lower()), None)
        if matched:
            return matched
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor not found for identifier: {vendor_ref}",
        )
    elif user:
        vendor = vendor_repo.get_vendor_by_user_id(user.id)
        if vendor:
            return vendor

    # Fallback to the first active vendor in DB if none provided
    vendors, _ = vendor_repo.get_all_vendors(limit=1)
    if vendors:
        return vendors[0]

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Vendor identity could not be resolved. Please specify vendor_id.",
    )


def _enrich_submission_response(sub: dict) -> BidSubmissionResponse:
    """Enriches a raw bid submission record with tender info, vendor info, and documents."""
    tender = tender_repo.get_tender_by_id(sub["tender_id"])
    vendor = vendor_repo.get_vendor_by_id(sub["vendor_id"])
    raw_docs = vendor_document_repo.get_documents_by_submission(sub["id"])
    
    docs = [
        VendorDocumentResponse(
            id=d["id"],
            bid_submission_id=d["bid_submission_id"],
            vendor_id=d["vendor_id"],
            original_filename=d["original_filename"],
            storage_path=d.get("storage_path"),
            mime_type=d.get("mime_type"),
            file_size=d.get("file_size"),
            document_type=d.get("document_type"),
            processing_status=d.get("processing_status", "UPLOADED"),
            uploaded_by=d.get("uploaded_by"),
            created_at=d["created_at"],
            download_url=f"/api/bid-submissions/{sub['id']}/documents/{d['id']}/download",
        )
        for d in raw_docs
    ]

    return BidSubmissionResponse(
        id=sub["id"],
        tender_id=sub["tender_id"],
        vendor_id=sub["vendor_id"],
        status=sub["status"],
        submitted_at=sub.get("submitted_at"),
        created_at=sub["created_at"],
        updated_at=sub["updated_at"],
        tender=tender,
        vendor=vendor,
        documents=docs,
        documents_count=len(docs),
    )


# ── Route Handlers ─────────────────────────────────────────────────────────────

@router.post(
    "",
    response_model=BidSubmissionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Start or Resume a Bid Submission",
    description="Initiates a new DRAFT bid submission for a tender and vendor. If a DRAFT already exists, returns it.",
)
def create_or_resume_bid_submission(
    payload: BidSubmissionCreate,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> BidSubmissionResponse:
    tender = _resolve_tender_id(payload.tender_id)
    vendor = _resolve_vendor_id(payload.vendor_id, current_user)

    if tender["status"] not in ("OPEN", "DRAFT"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tender {tender['tender_number']} is not open for submission (status: {tender['status']}).",
        )

    # Check for existing submission
    existing = bid_submission_repo.get_submission_by_tender_and_vendor(tender["id"], vendor["id"])
    if existing:
        if existing["status"] == "DRAFT":
            logger.info("Resuming existing DRAFT submission %s for vendor %s", existing["id"], vendor["id"])
            return _enrich_submission_response(existing)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A bid has already been submitted for this tender by {vendor['legal_name']} (status: {existing['status']}).",
            )

    new_sub = bid_submission_repo.create_bid_submission(
        tender_id=tender["id"],
        vendor_id=vendor["id"],
        status="DRAFT",
    )
    logger.info("Created new DRAFT bid submission %s for tender %s vendor %s", new_sub["id"], tender["id"], vendor["id"])
    return _enrich_submission_response(new_sub)


@router.get(
    "",
    response_model=BidSubmissionListResponse,
    summary="List Bid Submissions",
    description="Fetches bid submissions with optional filtering by vendor, tender, and status.",
)
def list_bid_submissions(
    vendor_id: Optional[str] = Query(None, description="Filter by vendor UUID"),
    tender_id: Optional[str] = Query(None, description="Filter by tender UUID or bid number"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (DRAFT, SUBMITTED, etc.)"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> BidSubmissionListResponse:
    target_tender_id = None
    if tender_id:
        t = _resolve_tender_id(tender_id)
        target_tender_id = t["id"]

    target_vendor_id = vendor_id
    # If user is a BIDDER without vendor_id query param, scope to user's vendor
    if not target_vendor_id and current_user and current_user.role == "BIDDER":
        user_vendor = vendor_repo.get_vendor_by_user_id(current_user.id)
        if user_vendor:
            target_vendor_id = user_vendor["id"]

    subs, total = bid_submission_repo.get_bid_submissions(
        vendor_id=target_vendor_id,
        tender_id=target_tender_id,
        status=status_filter,
        limit=limit,
        offset=offset,
    )
    enriched = [_enrich_submission_response(s) for s in subs]
    return BidSubmissionListResponse(items=enriched, total=total)


@router.get(
    "/{submission_id}",
    response_model=BidSubmissionResponse,
    summary="Get Bid Submission Details",
    description="Retrieves a full bid submission record with associated documents, tender, and vendor details.",
)
def get_bid_submission(submission_id: str) -> BidSubmissionResponse:
    sub = bid_submission_repo.get_bid_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid submission not found: {submission_id}",
        )
    return _enrich_submission_response(sub)


@router.post(
    "/{submission_id}/documents",
    response_model=VendorDocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload Document to Bid Submission",
    description="Uploads a PDF document to an active DRAFT bid submission, saves it to storage, and creates a vendor_documents record.",
)
async def upload_vendor_document(
    submission_id: str,
    file: UploadFile = File(..., description="PDF document file to upload"),
    document_type: Optional[str] = Form(None, description="Document classification tag (e.g. TURNOVER_CERTIFICATE, MAF, etc.)"),
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> VendorDocumentResponse:
    sub = bid_submission_repo.get_bid_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid submission not found: {submission_id}",
        )

    # Prevent modifying non-DRAFT submissions
    if sub["status"] != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot upload documents to submission with status '{sub['status']}'. Only DRAFT submissions can be edited.",
        )

    # Validate file format (strictly allow PDF)
    filename = file.filename or "uploaded_document.pdf"
    if not filename.lower().endswith(".pdf") and file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents (.pdf) are accepted for procurement verification.",
        )

    # Read binary bytes and validate size
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes).",
        )
    if len(file_bytes) > MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {MAX_UPLOAD_SIZE // (1024 * 1024)} MB.",
        )

    # Save to storage
    doc_id = str(uuid.uuid4())
    storage_path, file_size, mime_type = storage_service.save_vendor_document(
        file_bytes=file_bytes,
        original_filename=filename,
        tender_id=sub["tender_id"],
        submission_id=sub["id"],
        document_id=doc_id,
        mime_type=file.content_type or "application/pdf",
    )

    # Create DB record in vendor_documents
    doc_payload = {
        "id": doc_id,
        "bid_submission_id": sub["id"],
        "vendor_id": sub["vendor_id"],
        "original_filename": filename,
        "storage_path": storage_path,
        "mime_type": mime_type,
        "file_size": file_size,
        "document_type": document_type,
        "processing_status": "UPLOADED",
        "uploaded_by": current_user.id if current_user else None,
    }

    doc_record = vendor_document_repo.create_vendor_document(doc_payload)
    logger.info("Successfully uploaded document %s (%s bytes) for submission %s", filename, file_size, submission_id)

    return VendorDocumentResponse(
        id=doc_record["id"],
        bid_submission_id=doc_record["bid_submission_id"],
        vendor_id=doc_record["vendor_id"],
        original_filename=doc_record["original_filename"],
        storage_path=doc_record.get("storage_path"),
        mime_type=doc_record.get("mime_type"),
        file_size=doc_record.get("file_size"),
        document_type=doc_record.get("document_type"),
        processing_status=doc_record.get("processing_status", "UPLOADED"),
        uploaded_by=doc_record.get("uploaded_by"),
        created_at=doc_record["created_at"],
        download_url=f"/api/bid-submissions/{submission_id}/documents/{doc_record['id']}/download",
    )


@router.get(
    "/{submission_id}/documents",
    response_model=list[VendorDocumentResponse],
    summary="List Uploaded Documents",
    description="Returns all document metadata uploaded for a bid submission.",
)
def list_submission_documents(submission_id: str) -> list[VendorDocumentResponse]:
    sub = bid_submission_repo.get_bid_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid submission not found: {submission_id}",
        )
    raw_docs = vendor_document_repo.get_documents_by_submission(submission_id)
    return [
        VendorDocumentResponse(
            id=d["id"],
            bid_submission_id=d["bid_submission_id"],
            vendor_id=d["vendor_id"],
            original_filename=d["original_filename"],
            storage_path=d.get("storage_path"),
            mime_type=d.get("mime_type"),
            file_size=d.get("file_size"),
            document_type=d.get("document_type"),
            processing_status=d.get("processing_status", "UPLOADED"),
            uploaded_by=d.get("uploaded_by"),
            created_at=d["created_at"],
            download_url=f"/api/bid-submissions/{submission_id}/documents/{d['id']}/download",
        )
        for d in raw_docs
    ]


@router.get(
    "/{submission_id}/documents/{document_id}/download",
    summary="Download / Preview Uploaded Document",
    description="Streams the binary content of an uploaded vendor PDF document.",
)
def download_vendor_document(submission_id: str, document_id: str):
    doc = vendor_document_repo.get_document_by_id(document_id)
    if not doc or doc["bid_submission_id"] != submission_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found for this submission.",
        )

    storage_path = doc.get("storage_path")
    if not storage_path:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document storage path is missing.",
        )

    file_bytes = storage_service.get_document_bytes(storage_path)
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file content not found in storage.",
        )

    safe_filename = doc.get("original_filename", "document.pdf")
    return StreamingResponse(
        io.BytesIO(file_bytes),
        media_type=doc.get("mime_type", "application/pdf"),
        headers={
            "Content-Disposition": f'inline; filename="{safe_filename}"',
            "Content-Length": str(len(file_bytes)),
        },
    )


@router.delete(
    "/{submission_id}/documents/{document_id}",
    summary="Delete Uploaded Document",
    description="Deletes a document from storage and database. Only permitted when submission is in DRAFT state.",
)
def delete_vendor_document(submission_id: str, document_id: str):
    sub = bid_submission_repo.get_bid_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid submission not found: {submission_id}",
        )
    if sub["status"] != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete documents from a submission with status '{sub['status']}'. Only DRAFT submissions can be modified.",
        )

    doc = vendor_document_repo.get_document_by_id(document_id)
    if not doc or doc["bid_submission_id"] != submission_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found for this submission.",
        )

    storage_path = doc.get("storage_path")
    if storage_path:
        storage_service.delete_stored_document(storage_path)

    vendor_document_repo.delete_document(document_id)
    logger.info("Deleted document %s from submission %s", document_id, submission_id)
    return {"deleted": True, "document_id": document_id}


@router.post(
    "/{submission_id}/submit",
    response_model=BidSubmitActionResponse,
    summary="Finalize and Submit Bid",
    description="Transitions submission status from DRAFT to SUBMITTED and locks documents from further edits.",
)
def submit_bid(submission_id: str) -> BidSubmitActionResponse:
    sub = bid_submission_repo.get_bid_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid submission not found: {submission_id}",
        )

    if sub["status"] != "DRAFT":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bid is already finalized with status: '{sub['status']}'.",
        )

    # Require at least 1 document
    doc_count = vendor_document_repo.count_documents_by_submission(submission_id)
    if doc_count == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot submit bid without uploading at least one required vendor document.",
        )

    now = datetime.now(timezone.utc)
    updated = bid_submission_repo.update_bid_submission_status(
        submission_id=submission_id,
        status="SUBMITTED",
        submitted_at=now,
    )
    logger.info("Bid submission %s successfully finalized to SUBMITTED", submission_id)

    return BidSubmitActionResponse(
        id=updated["id"],
        status=updated["status"],
        submitted_at=now,
        message="Bid submitted successfully. The bid package is now locked for evaluation.",
    )
