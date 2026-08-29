"""
SatyaSetu Backend — Tender Endpoints

GET  /api/tenders                  — list all tenders (public)
POST /api/tenders                  — create tender (PROCUREMENT_OFFICER only)
GET  /api/tenders/{id}             — get single tender (public)
POST /api/tenders/publish          — publish GeM tender with AI requirement extraction
POST /api/officer/publish-tender   — officer publish tender endpoint
"""

import logging
import uuid
from typing import Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, File, Form, UploadFile, status, HTTPException

from app.core.dependencies import require_officer
from app.schemas.auth import CurrentUser
from app.schemas.tender import TenderCreate, TenderResponse, TenderListResponse
from app.services import tender_service
from app.services.tender_extraction import extract_tender_requirements
from app.core.database import get_supabase_client

logger = logging.getLogger("app.api.tenders")
router = APIRouter(prefix="/tenders", tags=["tenders"])


@router.get(
    "",
    response_model=TenderListResponse,
    summary="List all tenders",
    description=(
        "Returns a list of all tender records from the database. "
        "Public endpoint — no authentication required. "
        "Use ?status=OPEN to filter by status."
    ),
)
def list_tenders(
    status: Optional[str] = Query(
        default=None,
        description="Filter by status: OPEN, EVALUATION, CLOSED, AWARDED",
    ),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> TenderListResponse:
    return tender_service.list_tenders(
        status_filter=status,
        limit=limit,
        offset=offset,
    )


@router.post(
    "",
    response_model=TenderResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a tender",
    description=(
        "Create a new tender record. "
        "Restricted to PROCUREMENT_OFFICER role. "
        "tender_number must be unique."
    ),
)
def create_tender(
    body: TenderCreate,
    current_user: CurrentUser = Depends(require_officer),
) -> TenderResponse:
    return tender_service.create_tender(data=body, created_by=current_user.id)


@router.get(
    "/{tender_id}",
    response_model=TenderResponse,
    summary="Get a single tender",
    description="Returns a tender by UUID. Public — no authentication required.",
    responses={
        404: {"description": "Tender not found"},
    },
)
def get_tender(tender_id: str) -> TenderResponse:
    return tender_service.get_tender(tender_id)


@router.post(
    "/publish",
    summary="Publish GeM Tender with AI Requirement Extraction",
)
async def publish_tender(
    file: UploadFile = File(...),
    tender_number: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    closing_date: Optional[str] = Form(None),
    estimated_value: Optional[float] = Form(None),
    emd_amount: Optional[float] = Form(None),
) -> dict:
    return await _process_tender_publish(
        file=file,
        tender_number=tender_number,
        title=title,
        department=department,
        category=category,
        closing_date=closing_date,
        estimated_value=estimated_value,
        emd_amount=emd_amount,
    )


# Additional router for POST /api/officer/publish-tender
officer_router = APIRouter(prefix="/officer", tags=["officer"])


from pydantic import BaseModel


class PublishExistingTenderRequest(BaseModel):
    tender_id: str
    storage_path: Optional[str] = None


@officer_router.post(
    "/publish-tender",
    summary="Officer Publish Tender Endpoint",
    description="Accepts PDF upload and tender metadata, uploads to tender-documents bucket, extracts AI requirements, and stores tender in Supabase.",
)
async def officer_publish_tender(
    file: UploadFile = File(...),
    tender_number: Optional[str] = Form(None),
    title: Optional[str] = Form(None),
    department: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    closing_date: Optional[str] = Form(None),
    estimated_value: Optional[float] = Form(None),
    emd_amount: Optional[float] = Form(None),
) -> dict:
    return await _process_tender_publish(
        file=file,
        tender_number=tender_number,
        title=title,
        department=department,
        category=category,
        closing_date=closing_date,
        estimated_value=estimated_value,
        emd_amount=emd_amount,
    )


@officer_router.post(
    "/publish-existing-tender",
    summary="Publish an existing GeM tender from Supabase Storage using Gemini AI Requirement Extraction",
)
async def officer_publish_existing_tender(req: PublishExistingTenderRequest) -> dict:
    supabase = get_supabase_client()
    
    # 1. Fetch tender record
    t_res = supabase.table("tenders").select("*").eq("id", req.tender_id).execute()
    if not t_res.data:
        raise HTTPException(status_code=404, detail=f"Tender '{req.tender_id}' not found")
    
    tender_record = t_res.data[0]
    
    # 2. Get storage_path from request or tender_documents table
    storage_path = req.storage_path
    if not storage_path:
        doc_res = supabase.table("tender_documents").select("*").eq("tender_id", req.tender_id).execute()
        if doc_res.data and doc_res.data[0].get("storage_path"):
            storage_path = doc_res.data[0]["storage_path"]
        else:
            clean_num = tender_record.get("tender_number", "").replace("/", "")
            storage_path = f"{clean_num}.pdf"
            
    # 3. Download PDF bytes from Supabase Storage bucket 'tender-documents'
    try:
        pdf_bytes = supabase.storage.from_("tender-documents").download(storage_path)
    except Exception as dl_err:
        logger.error("Failed downloading '%s' from tender-documents bucket: %s", storage_path, str(dl_err))
        raise HTTPException(status_code=404, detail=f"PDF file '{storage_path}' not found in tender-documents storage bucket.") from dl_err
        
    # 4. Run Gemini AI Requirement Extraction
    extraction_status_str = "COMPLETED"
    try:
        extracted = extract_tender_requirements(pdf_bytes, storage_path)
    except Exception as ext_err:
        logger.error("Gemini extraction error for '%s': %s", storage_path, str(ext_err))
        extraction_status_str = "FAILED"
        extracted = {}

    now_iso = datetime.now(timezone.utc).isoformat()
    
    update_payload = {
        "status": "OPEN",
        "extracted_requirements": extracted,
        "extraction_status": extraction_status_str,
        "extracted_at": now_iso,
        "published_at": now_iso,
    }
    if extracted.get("tender_title"):
        update_payload["title"] = extracted["tender_title"]
    if extracted.get("department"):
        update_payload["department"] = extracted["department"]
    if extracted.get("category"):
        update_payload["category"] = extracted["category"]
    if extracted.get("estimated_value"):
        update_payload["estimated_value"] = int(extracted["estimated_value"])
    if extracted.get("emd_amount"):
        update_payload["emd_amount"] = int(extracted["emd_amount"])
        
    supabase.table("tenders").update(update_payload).eq("id", req.tender_id).execute()
    
    return {
        "tender_id": req.tender_id,
        "tender_number": tender_record.get("tender_number"),
        "title": update_payload.get("title", tender_record.get("title")),
        "status": "OPEN",
        "extraction_status": extraction_status_str,
        "extracted_requirements": extracted,
        "storage_path": storage_path,
    }


async def _process_tender_publish(
    file: UploadFile,
    tender_number: Optional[str] = None,
    title: Optional[str] = None,
    department: Optional[str] = None,
    category: Optional[str] = None,
    closing_date: Optional[str] = None,
    estimated_value: Optional[float] = None,
    emd_amount: Optional[float] = None,
) -> dict:
    supabase = get_supabase_client()

    filename = file.filename or "tender_document.pdf"
    pdf_bytes = await file.read()
    file_size = len(pdf_bytes)

    logger.info("Tender upload received | filename: '%s' | size: %d bytes", filename, file_size)

    # 1. Upload PDF to Supabase Storage bucket 'tender-documents'
    unique_file_id = str(uuid.uuid4())
    storage_path = f"{unique_file_id}.pdf"
    try:
        supabase.storage.from_("tender-documents").upload(
            path=storage_path,
            file=pdf_bytes,
            file_options={"content-type": "application/pdf", "upsert": "true"},
        )
        logger.info("PDF stored | path: '%s' in bucket 'tender-documents'", storage_path)
    except Exception as st_err:
        logger.warning("Storage upload warning for '%s': %s", storage_path, str(st_err))

    # 2. Run AI requirement extraction
    logger.info("AI requirement extraction started for '%s'", filename)
    extraction_status_str = "COMPLETED"
    try:
        extracted = extract_tender_requirements(pdf_bytes, filename)
        logger.info("AI requirement extraction completed for '%s'", filename)
    except Exception as ext_err:
        logger.error("AI requirement extraction failed: %s", str(ext_err))
        extraction_status_str = "FAILED"
        extracted = {}

    final_tender_number = tender_number or extracted.get("tender_number") or f"GEM/2026/B/{uuid.uuid4().hex[:7].upper()}"
    final_title = title or extracted.get("tender_title") or f"GeM Procurement Tender {final_tender_number}"
    final_dept = department or extracted.get("department") or "Procurement Division"
    final_cat = category or extracted.get("category") or "General Goods/Services"
    final_deadline = closing_date or extracted.get("submission_deadline") or "2026-09-20T23:59:59+05:30"
    final_est_value = int(estimated_value or extracted.get("estimated_value") or 18500000)
    final_emd = int(emd_amount or extracted.get("emd_amount") or 370000)

    # 3. Create Tender Record in public.tenders
    tender_id = str(uuid.uuid4())
    now_iso = datetime.now(timezone.utc).isoformat()

    tender_payload = {
        "id": tender_id,
        "tender_number": final_tender_number,
        "title": final_title,
        "organization": extracted.get("organization") or "Government Procurement Department",
        "department": final_dept,
        "category": final_cat,
        "description": extracted.get("description") or final_title,
        "source": "OFFICER_PUBLISHED",
        "status": "OPEN",
        "estimated_value": final_est_value,
        "emd_amount": final_emd,
        "submission_deadline": final_deadline,
        "delivery_period_days": int(extracted.get("delivery_period_days") or 120),
        "warranty_months": int(extracted.get("warranty_months") or 36),
        "extracted_requirements": extracted,
        "extraction_status": extraction_status_str,
        "extracted_at": now_iso,
        "published_at": now_iso,
    }

    try:
        ins_res = supabase.table("tenders").upsert(tender_payload, on_conflict="tender_number").execute()
        if ins_res.data and len(ins_res.data) > 0:
            tender_id = ins_res.data[0]["id"]
    except Exception as db_err:
        logger.error("Database insert error into public.tenders: %s", str(db_err))

    # 4. Create Tender Document Record in public.tender_documents
    doc_payload = {
        "id": str(uuid.uuid4()),
        "tender_id": tender_id,
        "original_filename": filename,
        "storage_path": storage_path,
        "mime_type": "application/pdf",
        "file_size": file_size,
        "processing_status": "PROCESSED" if extraction_status_str == "COMPLETED" else "UPLOADED",
    }
    try:
        supabase.table("tender_documents").insert(doc_payload).execute()
    except Exception as doc_err:
        logger.warning("tender_documents insert warning: %s", str(doc_err))

    logger.info("Tender published successfully | tender_id: '%s' | tender_number: '%s'", tender_id, final_tender_number)

    return {
        "tender_id": tender_id,
        "tender_number": final_tender_number,
        "title": final_title,
        "department": final_dept,
        "category": final_cat,
        "status": "OPEN",
        "extraction_status": extraction_status_str,
        "extracted_requirements": extracted,
        "storage_path": storage_path,
    }
