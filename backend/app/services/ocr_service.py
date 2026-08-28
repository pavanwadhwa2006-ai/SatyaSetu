"""
SatyaSetu Backend — Gemini OCR & Document Intelligence Service

Responsibility:
  Extract structured entity fields from uploaded PDFs stored in Supabase Storage.
  Does NOT perform rule validation or compliance verdict generation.
"""

import json
import logging
import re
from typing import Any, Dict, Optional

from app.core.config import get_settings
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)

# System prompt requesting ONLY structured JSON entity extraction
OCR_EXTRACTION_PROMPT = """
You are a high-precision document extraction engine for procurement document verification.
Your ONLY task is to analyze the provided document PDF and extract key structured information.
Do NOT evaluate compliance, do NOT pass judgment, and do NOT make procurement decisions.

Extract the following fields into a strictly valid JSON object matching this schema:
{
  "document_type": "PAN_CERTIFICATE | GST_CERTIFICATE | COMPANY_REGISTRATION | TURNOVER_CERTIFICATE | WORK_ORDER | COMPLETION_CERTIFICATE | TECHNICAL_COMPLIANCE | UNKNOWN",
  "legal_name": "Full legal company name as printed on document, or null",
  "pan_number": "10-character PAN number if present (e.g. AABCA1234B), or null",
  "gstin": "15-character GSTIN if present (e.g. 07AABCA1234B1ZP), or null",
  "address": "Full registered or business address if present, or null",
  "turnover": "Numeric financial turnover value in INR if present, or null",
  "work_order_value": "Numeric contract/work order monetary value in INR if present, or null",
  "completion_status": "COMPLETED | IN_PROGRESS | PENDING | UNKNOWN"
}

Return ONLY the raw JSON object. Do not include markdown code block formatting or conversational commentary.
"""

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None  # type: ignore
    types = None  # type: ignore


def _sanitize_log_message(msg: str) -> str:
    """Scrub potential API keys or secret tokens from log strings."""
    if not msg:
        return ""
    # Mask potential API key patterns (AIza..., sb_publishable..., bearer tokens)
    sanitized = re.sub(r"(AIza[0-9A-Za-z-_]{35})", "[REDACTED_API_KEY]", msg)
    sanitized = re.sub(r"(sb_publishable_[A-Za-z0-9_-]+)", "[REDACTED_KEY]", sanitized)
    sanitized = re.sub(r"(Bearer\s+[A-Za-z0-9._-]+)", "Bearer [REDACTED_TOKEN]", sanitized)
    return sanitized


class OCRService:
    """
    Service responsible for fetching PDFs from Supabase Storage and passing
    them to Gemini 2.5 Flash for structured JSON entity extraction.
    """

    def __init__(self, supabase=None, settings=None):
        self.supabase = supabase or get_supabase_client()
        self.settings = settings or get_settings()

    def download_pdf_from_storage(
        self, storage_path: str, bucket_name: str = "vendor-documents"
    ) -> bytes:
        """Download raw binary PDF bytes from Supabase Storage."""
        logger.info(
            "Downloading file from storage bucket '%s', path: '%s'", bucket_name, storage_path
        )
        try:
            res = self.supabase.storage.from_(bucket_name).download(storage_path)
            if not res or len(res) == 0:
                raise FileNotFoundError(
                    f"File not found or zero bytes returned at storage path: '{storage_path}' in bucket '{bucket_name}'."
                )
            return res
        except Exception as e:
            clean_err = _sanitize_log_message(str(e))
            logger.error(
                "Storage download failure for path '%s' in bucket '%s': %s",
                storage_path,
                bucket_name,
                clean_err,
            )
            raise RuntimeError(
                f"Failed to download storage file '{storage_path}' from bucket '{bucket_name}': {clean_err}"
            ) from e

    def extract_structured_data(
        self, pdf_bytes: bytes, file_name: str = "document.pdf"
    ) -> Dict[str, Any]:
        """
        Send PDF bytes to Gemini 2.5 Flash via Google GenAI SDK for structured JSON extraction.
        """
        if genai is None or types is None:
            logger.error("google-genai package is not installed.")
            raise ImportError(
                "google-genai package is not installed. Run 'pip install google-genai'."
            )

        api_key = self.settings.effective_gemini_api_key
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY environment variable is not configured."
            )

        try:
            client = genai.Client(api_key=api_key)

            pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")

            # Request extraction using Gemini 2.5 Flash
            model_name = "gemini-2.5-flash"
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=[pdf_part, OCR_EXTRACTION_PROMPT],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    ),
                )
            except Exception as model_err:
                logger.warning("Primary model %s failed, retrying with gemini-2.0-flash: %s", model_name, str(model_err))
                response = client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents=[pdf_part, OCR_EXTRACTION_PROMPT],
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1,
                    ),
                )

            text_content = (response.text or "").strip()
            # Clean any accidental markdown code fences if present
            if text_content.startswith("```"):
                text_content = text_content.strip("`").removeprefix("json").strip()

            extracted_json = json.loads(text_content)
            return extracted_json
        except json.JSONDecodeError as json_err:
            clean_output = _sanitize_log_message(text_content if 'text_content' in locals() else "")
            logger.error("Failed to parse valid JSON output from Gemini: %s", clean_output)
            raise ValueError(f"Gemini OCR response was not valid JSON: {json_err}") from json_err
        except Exception as api_err:
            clean_err = _sanitize_log_message(str(api_err))
            logger.error("Gemini API generation error for file '%s': %s", file_name, clean_err)
            raise RuntimeError(f"Gemini OCR processing failed: {clean_err}") from api_err

    def process_vendor_document(self, document_id: str) -> Dict[str, Any]:
        """
        Complete OCR Pipeline for a vendor document with strict state lifecycle:
          1. Query document record from vendor_documents by document_id
          2. Check storage_path
          3. Transition status: UPLOADED -> PROCESSING
          4. Download PDF bytes from Supabase Storage bucket 'vendor-documents'
          5. Extract structured JSON via Gemini 2.5 Pro
          6. Save extracted JSON into vendor_documents.extracted_data
          7. Transition status: PROCESSING -> PROCESSED (or FAILED on error)
        """
        # 1. Fetch document record
        doc_res = (
            self.supabase.table("vendor_documents")
            .select("*")
            .eq("id", document_id)
            .execute()
        )
        if not doc_res.data:
            raise ValueError(f"vendor_documents row not found for ID: {document_id}")

        doc_record = doc_res.data[0]
        storage_path = doc_record.get("storage_path")
        if not storage_path:
            # Mark as FAILED if storage path is missing
            self.supabase.table("vendor_documents").update(
                {"processing_status": "FAILED"}
            ).eq("id", document_id).execute()
            raise ValueError(
                f"Document {document_id} has no storage_path configured."
            )

        # 3. Transition status: UPLOADED -> PROCESSING
        self.supabase.table("vendor_documents").update(
            {"processing_status": "PROCESSING"}
        ).eq("id", document_id).execute()

        try:
            # 4. Download PDF from Storage bucket vendor-documents
            pdf_bytes = self.download_pdf_from_storage(
                storage_path, bucket_name="vendor-documents"
            )

            # 5. Extract structured data via Gemini 2.5 Pro
            extracted_data = self.extract_structured_data(
                pdf_bytes, file_name=doc_record.get("original_filename", "doc.pdf")
            )

            # 6 & 7. Save extracted JSON and transition status: PROCESSING -> PROCESSED
            update_payload = {
                "extracted_data": extracted_data,
                "processing_status": "PROCESSED",
            }
            self.supabase.table("vendor_documents").update(update_payload).eq(
                "id", document_id
            ).execute()

            logger.info(
                "Successfully processed document %s with Gemini 2.5 Pro", document_id
            )

            return {
                "document_id": document_id,
                "storage_path": storage_path,
                "processing_status": "PROCESSED",
                "extracted_data": extracted_data,
            }
        except Exception as e:
            clean_err = _sanitize_log_message(str(e))
            logger.error("Error processing vendor document %s: %s", document_id, clean_err)
            
            # Transition status: -> FAILED
            self.supabase.table("vendor_documents").update(
                {"processing_status": "FAILED"}
            ).eq("id", document_id).execute()
            
            raise e
