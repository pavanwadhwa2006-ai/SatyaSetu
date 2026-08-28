"""
SatyaSetu Backend — GeM Tender Requirement Extraction Service

Responsibility:
  Extract structured tender requirements from uploaded GeM Tender PDFs using Gemini 2.5 Pro.
  Extracts document requirements, financial criteria, deadlines, and eligibility rules.
"""

import json
import logging
import re
from typing import Any, Dict

from app.core.config import get_settings
from app.core.database import get_supabase_client

logger = logging.getLogger(__name__)

TENDER_EXTRACTION_PROMPT = """
You are a high-precision tender requirement extraction engine for Government e-Marketplace (GeM) procurement documents.
Your task is to analyze the provided GeM Tender PDF and extract structured requirement metadata required for tender publishing and compliance verification.

Extract the following fields into a strictly valid JSON object matching this schema:
{
  "tender_title": "Full title or description of goods/services requested",
  "tender_number": "GeM Tender/Bid number e.g. GEM/2026/B/7903799",
  "organization": "Purchaser or Organization Name e.g. Ministry of Railways / Central Instrumentation Division",
  "department": "Department or Division Name",
  "category": "Item Category / Service Type e.g. Manpower Outsourcing Services",
  "description": "Comprehensive summary description of tender requirements",
  "required_documents": [
    "List of mandatory documents required from bidders e.g. Company Profile, PAN Card, GST Certificate, CA Turnover Certificate, Work Order, Completion Certificate, Technical Compliance Declaration"
  ],
  "minimum_turnover": 50000000.0,
  "emd_amount": 370000.0,
  "estimated_value": 18500000.0,
  "submission_deadline": "ISO date string or deadline string e.g. 2026-09-20T23:59:59+05:30",
  "delivery_period_days": 120,
  "warranty_months": 36,
  "eligibility_conditions": [
    "List of key eligibility conditions or technical qualification standards"
  ]
}

Return ONLY the raw JSON object. Do not include markdown code block formatting or conversational commentary.
"""


def _sanitize_log_message(msg: str) -> str:
    """Scrub potential API keys or secret tokens from log strings."""
    if not msg:
        return ""
    sanitized = re.sub(r"(AIza[0-9A-Za-z-_]{35})", "[REDACTED_API_KEY]", msg)
    sanitized = re.sub(r"(sb_publishable_[A-Za-z0-9_-]+)", "[REDACTED_KEY]", sanitized)
    sanitized = re.sub(r"(Bearer\s+[A-Za-z0-9._-]+)", "Bearer [REDACTED_TOKEN]", sanitized)
    return sanitized


class TenderExtractionService:
    """
    Gemini 2.5 Pro powered GeM Tender Requirement Extraction Service.
    Parses GeM tender PDFs to extract structured requirement criteria.
    """

    def __init__(self):
        self.settings = get_settings()
        self.supabase = get_supabase_client()

    def extract_tender_requirements(
        self, pdf_bytes: bytes, file_name: str = "tender.pdf"
    ) -> Dict[str, Any]:
        """
        Send GeM Tender PDF bytes to Gemini 2.5 Pro via Google GenAI SDK.
        Returns structured requirement JSON.
        """
        try:
            from google import genai
            from google.genai import types
        except ImportError as err:
            logger.error("google-genai package is not installed: %s", str(err))
            raise ImportError(
                "google-genai package is not installed. Run 'pip install google-genai'."
            ) from err

        api_key = self.settings.effective_gemini_api_key
        if not api_key:
            raise ValueError(
                "GEMINI_API_KEY environment variable is not configured."
            )

        try:
            client = genai.Client(api_key=api_key)

            pdf_part = types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")

            response = client.models.generate_content(
                model="gemini-2.5-pro",
                contents=[pdf_part, TENDER_EXTRACTION_PROMPT],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1,
                ),
            )

            text_content = (response.text or "").strip()
            if text_content.startswith("```"):
                text_content = text_content.strip("`").removeprefix("json").strip()

            extracted_json = json.loads(text_content)
            return extracted_json
        except json.JSONDecodeError as json_err:
            clean_output = _sanitize_log_message(text_content if 'text_content' in locals() else "")
            logger.error("Failed to parse valid JSON from Gemini tender extraction: %s", clean_output)
            raise ValueError(f"Gemini tender extraction response was not valid JSON: {json_err}") from json_err
        except Exception as api_err:
            clean_err = _sanitize_log_message(str(api_err))
            logger.error("Gemini API error during tender extraction for file '%s': %s", file_name, clean_err)
            raise RuntimeError(f"Tender requirement extraction failed: {clean_err}") from api_err
