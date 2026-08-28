"""
SatyaSetu Backend — Document Intelligence API Router (Phase 7)
Provides endpoints for triggering PDF document processing, text extraction,
document classification, and structured fact retrieval with page provenance.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status

from app.schemas.document_intelligence import (
    DocumentFactSchema,
    DocumentProcessResponse,
    SubmissionFactsResponse,
)
from app.services import document_intelligence
from app.repositories import vendor_document_repo, bid_submission_repo
from app.core.dependencies import get_current_user_optional
from app.schemas.auth import CurrentUser

logger = logging.getLogger(__name__)

router = APIRouter(tags=["document-intelligence"])


# ── Document-Level Endpoints ───────────────────────────────────────────────────

@router.post(
    "/documents/{document_id}/process",
    response_model=DocumentProcessResponse,
    summary="Process Single Vendor Document",
    description="Extracts text, classifies document type, and extracts structured facts with source page and quote provenance.",
)
def process_single_document(
    document_id: str,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> DocumentProcessResponse:
    doc = vendor_document_repo.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor document not found: {document_id}",
        )

    try:
        result = document_intelligence.process_vendor_document(document_id)
        return result
    except ValueError as exc:
        logger.error("Validation error processing document %s: %s", document_id, exc)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    except Exception as exc:
        logger.error("Internal error processing document %s: %s", document_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing Document Intelligence: {exc}",
        )


@router.get(
    "/documents/{document_id}/facts",
    response_model=list[DocumentFactSchema],
    summary="Get Extracted Facts for Document",
    description="Returns structured domain facts extracted from the document.",
)
def get_document_facts(
    document_id: str,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> list[DocumentFactSchema]:
    doc = vendor_document_repo.get_document_by_id(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor document not found: {document_id}",
        )

    # Process if not yet processed
    result = document_intelligence.process_vendor_document(document_id)
    return result.facts


# ── Submission-Level Endpoints ─────────────────────────────────────────────────

@router.post(
    "/bid-submissions/{submission_id}/process",
    response_model=SubmissionFactsResponse,
    summary="Process All Documents in a Bid Submission",
    description="Processes each uploaded document in a bid package, classifying types and extracting facts.",
)
def process_submission_documents(
    submission_id: str,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> SubmissionFactsResponse:
    sub = bid_submission_repo.get_bid_submission_by_id(submission_id)
    if not sub:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bid submission not found: {submission_id}",
        )

    docs = vendor_document_repo.get_documents_by_submission(submission_id)
    processed_results: list[DocumentProcessResponse] = []
    total_facts = 0

    for d in docs:
        try:
            res = document_intelligence.process_vendor_document(d["id"])
            processed_results.append(res)
            total_facts += res.extracted_facts_count
        except Exception as exc:
            logger.warning("Error processing document %s in submission %s: %s", d["id"], submission_id, exc)
            processed_results.append(
                DocumentProcessResponse(
                    document_id=d["id"],
                    bid_submission_id=submission_id,
                    vendor_id=d["vendor_id"],
                    original_filename=d["original_filename"],
                    document_type=d.get("document_type", "OTHER"),
                    processing_status="FAILED",
                    extracted_pages_count=0,
                    extracted_facts_count=0,
                    facts=[],
                    error_message=str(exc),
                    message=f"Failed to process '{d['original_filename']}': {exc}",
                )
            )

    return SubmissionFactsResponse(
        submission_id=submission_id,
        documents_processed_count=len(processed_results),
        total_facts_count=total_facts,
        documents=processed_results,
    )


@router.get(
    "/bid-submissions/{submission_id}/facts",
    response_model=SubmissionFactsResponse,
    summary="Get All Extracted Facts for Bid Submission",
    description="Returns all extracted domain facts across all documents in a bid package.",
)
def get_submission_facts(
    submission_id: str,
    current_user: Optional[CurrentUser] = Depends(get_current_user_optional),
) -> SubmissionFactsResponse:
    return process_submission_documents(submission_id, current_user)
