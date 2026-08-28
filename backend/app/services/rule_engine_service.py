"""
SatyaSetu Backend — Deterministic Rule Engine Service

Pure deterministic evaluation service.
Gemini OCR extracts raw text entities into vendor_documents.extracted_data.
RuleEngineService performs all validation, risk scoring, and recommendation decisions.
"""

import re
from typing import Any, Dict, List, Optional


PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
GST_REGEX = re.compile(
    r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
)

MANDATORY_DOCUMENT_TYPES = [
    "PAN_CERTIFICATE",
    "GST_CERTIFICATE",
    "COMPANY_REGISTRATION",
    "TURNOVER_CERTIFICATE",
    "TECHNICAL_COMPLIANCE",
]


class RuleEngineService:
    """
    Pure deterministic rule engine for evaluation of extracted bidder document entities.
    Produces zero non-deterministic outputs.
    """

    @staticmethod
    def validate_pan(pan: Optional[str]) -> Dict[str, Any]:
        """
        Rule 1: Validate 10-character PAN format (e.g. ABCDE1234F).
        """
        if not pan:
            return {
                "number": None,
                "format_valid": False,
                "status": "Missing PAN Document",
            }
        clean_pan = pan.strip().upper()
        is_valid = bool(PAN_REGEX.match(clean_pan))
        return {
            "number": clean_pan,
            "format_valid": is_valid,
            "status": "Active (Demo Validation)" if is_valid else "Invalid PAN Format",
        }

    @staticmethod
    def validate_gstin(gstin: Optional[str]) -> Dict[str, Any]:
        """
        Rule 2: Validate 15-character GSTIN format (e.g. 27ABCDE1234F1Z5).
        """
        if not gstin:
            return {
                "gstin": None,
                "format_valid": False,
                "status": "Missing GST Document",
            }
        clean_gst = gstin.strip().upper()
        is_valid = bool(GST_REGEX.match(clean_gst))
        return {
            "gstin": clean_gst,
            "format_valid": is_valid,
            "status": "Active (Demo Validation)" if is_valid else "Invalid GSTIN Format",
        }

    @staticmethod
    def evaluate_turnover(
        actual_turnover: Optional[float], required_turnover: float = 50000000.0
    ) -> Dict[str, Any]:
        """
        Rule 3: Compare extracted turnover against tender minimum requirement.
        """
        actual = float(actual_turnover) if actual_turnover is not None else 0.0
        eligible = actual >= required_turnover
        return {
            "required": float(required_turnover),
            "actual": actual,
            "eligible": eligible,
        }

    @staticmethod
    def check_missing_documents(extracted_documents: List[Dict[str, Any]]) -> List[str]:
        """
        Rule 4: Detect missing mandatory document types.
        """
        present_types = set()
        for doc in extracted_documents:
            doc_type = doc.get("document_type") or ""
            if doc_type:
                present_types.add(doc_type.upper())

        missing = []
        for req in MANDATORY_DOCUMENT_TYPES:
            if not any(req in pt for pt in present_types):
                missing.append(req)
        return missing

    @staticmethod
    def check_name_consistency(legal_names: List[str]) -> Dict[str, Any]:
        """
        Rule 5: Check legal-name consistency across extracted documents.
        """
        normalized = set()
        for name in legal_names:
            if name:
                norm = (
                    name.upper()
                    .replace(".", "")
                    .replace(",", "")
                    .replace("PVT", "")
                    .replace("LTD", "")
                    .replace("PRIVATE", "")
                    .replace("LIMITED", "")
                    .strip()
                )
                if norm:
                    normalized.add(norm)

        passed = len(normalized) <= 1
        return {
            "passed": passed,
            "unique_names": list(set([n for n in legal_names if n])),
        }

    @classmethod
    def evaluate_merged_entities(
        cls,
        extracted_documents: List[Dict[str, Any]],
        required_turnover: float = 50000000.0,
    ) -> Dict[str, Any]:
        """
        Execute deterministic evaluation pipeline:
          1. Merge extracted document fields
          2. Run validation rules (PAN, GSTIN, Turnover, Missing Docs, Name Consistency)
          3. Calculate risk score (0 - 100)
          4. Return recommendation: AUTO_APPROVE | HUMAN_REVIEW | REJECT
        """
        pan_number = None
        gstin_number = None
        extracted_turnover = None
        legal_names = []

        for doc in extracted_documents:
            ext = doc.get("extracted_data") or doc
            if not pan_number and ext.get("pan_number"):
                pan_number = ext.get("pan_number")
            if not gstin_number and ext.get("gstin"):
                gstin_number = ext.get("gstin")
            if extracted_turnover is None and ext.get("turnover"):
                try:
                    extracted_turnover = float(ext.get("turnover"))
                except (ValueError, TypeError):
                    pass
            if ext.get("legal_name"):
                legal_names.append(ext.get("legal_name"))

        # Execute rule checks
        missing_documents = cls.check_missing_documents(extracted_documents)
        pan_result = cls.validate_pan(pan_number)
        gst_result = cls.validate_gstin(gstin_number)
        turnover_result = cls.evaluate_turnover(extracted_turnover, required_turnover)
        name_consistency = cls.check_name_consistency(legal_names)

        # Rule 6: Calculate Risk Score (0 - 100)
        risk_score = 0

        if missing_documents:
            risk_score += len(missing_documents) * 15

        if not pan_result["format_valid"]:
            risk_score += 25

        if not gst_result["format_valid"]:
            risk_score += 25

        if not turnover_result["eligible"]:
            risk_score += 30

        if not name_consistency["passed"]:
            risk_score += 20

        risk_score = min(100, risk_score)

        # Rule 7: Strict Recommendation (AUTO_APPROVE | HUMAN_REVIEW | REJECT)
        if risk_score == 0 and not missing_documents:
            recommendation = "AUTO_APPROVE"
        elif risk_score >= 50 or not turnover_result["eligible"] or len(missing_documents) >= 2:
            recommendation = "REJECT"
        else:
            recommendation = "HUMAN_REVIEW"

        return {
            "documents_processed": len(extracted_documents),
            "missing_documents": missing_documents,
            "pan": pan_result,
            "gst": gst_result,
            "turnover": turnover_result,
            "name_consistency": name_consistency,
            "risk_score": risk_score,
            "recommendation": recommendation,
        }
