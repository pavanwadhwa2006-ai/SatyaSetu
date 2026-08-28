"""
SatyaSetu Backend — Python Rule Engine

Pure deterministic Python rules engine.
Executes non-LLM rule checks:
  1. Missing required documents check
  2. PAN format validation (10-char alphanumeric regex)
  3. GSTIN format validation (15-char regex)
  4. Financial turnover threshold comparison
  5. Cross-document legal name mismatch detection
  6. Risk score calculation (0 - 100)
  7. Final recommendation: AUTO_APPROVE | HUMAN_REVIEW | REJECT
"""

import re
from typing import Any, Dict, List, Optional
from app.schemas.analysis import (
    FormatCheckResult,
    TurnoverCheckResult,
    NameMismatchResult,
)

PAN_REGEX = re.compile(r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$")
GST_REGEX = re.compile(
    r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
)

REQUIRED_DOC_TYPES = [
    "PAN_CERTIFICATE",
    "GST_CERTIFICATE",
    "COMPANY_REGISTRATION",
    "TURNOVER_CERTIFICATE",
    "TECHNICAL_COMPLIANCE",
]


class RuleEngine:
    """
    Deterministic rule evaluation engine for bid compliance.
    """

    @staticmethod
    def check_pan(pan: Optional[str]) -> FormatCheckResult:
        if not pan:
            return FormatCheckResult(
                valid=False, value=None, message="PAN number not found in documents."
            )
        clean_pan = pan.strip().upper()
        if PAN_REGEX.match(clean_pan):
            return FormatCheckResult(
                valid=True, value=clean_pan, message="Valid 10-character PAN format."
            )
        return FormatCheckResult(
            valid=False,
            value=clean_pan,
            message=f"Invalid PAN format '{clean_pan}'. Expected pattern: AABCA1234B.",
        )

    @staticmethod
    def check_gstin(gstin: Optional[str]) -> FormatCheckResult:
        if not gstin:
            return FormatCheckResult(
                valid=False, value=None, message="GSTIN not found in documents."
            )
        clean_gst = gstin.strip().upper()
        if GST_REGEX.match(clean_gst):
            return FormatCheckResult(
                valid=True, value=clean_gst, message="Valid 15-character GSTIN format."
            )
        return FormatCheckResult(
            valid=False,
            value=clean_gst,
            message=f"Invalid GSTIN format '{clean_gst}'. Expected pattern: 07AABCA1234B1ZP.",
        )

    @staticmethod
    def check_turnover(
        extracted_turnover: Optional[float], required_turnover: float = 10000000.0
    ) -> TurnoverCheckResult:
        if extracted_turnover is None:
            return TurnoverCheckResult(
                passed=False,
                extracted_turnover=None,
                required_turnover=required_turnover,
                message="Turnover amount not specified in extracted documents.",
            )
        passed = extracted_turnover >= required_turnover
        msg = (
            f"Extracted turnover ₹{extracted_turnover:,.2f} meets required threshold ₹{required_turnover:,.2f}."
            if passed
            else f"Extracted turnover ₹{extracted_turnover:,.2f} is below requirement ₹{required_turnover:,.2f}."
        )
        return TurnoverCheckResult(
            passed=passed,
            extracted_turnover=extracted_turnover,
            required_turnover=required_turnover,
            message=msg,
        )

    @staticmethod
    def check_name_mismatch(legal_names: List[str]) -> NameMismatchResult:
        normalized = set()
        for name in legal_names:
            if name:
                # Remove common suffixes and whitespace for fair comparison
                norm = (
                    name.upper()
                    .replace("PVT.", "")
                    .replace("LTD.", "")
                    .replace("PRIVATE", "")
                    .replace("LIMITED", "")
                    .strip()
                )
                if norm:
                    normalized.add(norm)

        unique_list = list(set([n for n in legal_names if n]))
        if len(normalized) > 1:
            return NameMismatchResult(
                detected=True,
                unique_names=unique_list,
                message=f"Cross-document name mismatch detected: {', '.join(unique_list)}",
            )
        return NameMismatchResult(
            detected=False,
            unique_names=unique_list,
            message="Legal entity names are consistent across all documents.",
        )

    @classmethod
    def evaluate_bid_documents(
        self,
        extracted_docs: List[Dict[str, Any]],
        required_turnover: float = 10000000.0,
    ) -> Dict[str, Any]:
        """
        Evaluate extracted document fields against rule set.
        """
        # Collect extracted values across documents
        extracted_doc_types = [
            d.get("document_type", "").upper() for d in extracted_docs if d.get("document_type")
        ]
        
        # Check missing documents
        missing_docs = []
        for req in REQUIRED_DOC_TYPES:
            if not any(req in dt for dt in extracted_doc_types):
                missing_docs.append(req)

        # Extract values
        pan_val = None
        gst_val = None
        turnover_val = None
        legal_names = []

        for doc in extracted_docs:
            ext = doc.get("extracted_data") or doc
            if not pan_val and ext.get("pan_number"):
                pan_val = ext.get("pan_number")
            if not gst_val and ext.get("gstin"):
                gst_val = ext.get("gstin")
            if turnover_val is None and ext.get("turnover"):
                try:
                    turnover_val = float(ext.get("turnover"))
                except (ValueError, TypeError):
                    pass
            if ext.get("legal_name"):
                legal_names.append(ext.get("legal_name"))

        pan_check = self.check_pan(pan_val)
        gst_check = self.check_gstin(gst_val)
        turnover_check = self.check_turnover(turnover_val, required_turnover=required_turnover)
        name_mismatch = self.check_name_mismatch(legal_names)

        # Risk Score Calculation (0 - 100)
        risk_score = 0
        findings = []

        if missing_docs:
            risk_score += len(missing_docs) * 20
            findings.append(f"Missing mandatory documents: {', '.join(missing_docs)}")

        if not pan_check.valid:
            risk_score += 25
            findings.append(f"PAN Check Failed: {pan_check.message}")

        if not gst_check.valid:
            risk_score += 25
            findings.append(f"GST Check Failed: {gst_check.message}")

        if not turnover_check.passed:
            risk_score += 30
            findings.append(f"Turnover Check Failed: {turnover_check.message}")

        if name_mismatch.detected:
            risk_score += 25
            findings.append(f"Name Mismatch Detected: {name_mismatch.message}")

        risk_score = min(100, risk_score)

        # Recommendation Logic: AUTO_APPROVE | HUMAN_REVIEW | REJECT
        if risk_score == 0 and not missing_docs:
            recommendation = "AUTO_APPROVE"
        elif risk_score >= 50 or len(missing_docs) >= 2 or not turnover_check.passed:
            recommendation = "REJECT"
        else:
            recommendation = "HUMAN_REVIEW"

        if not findings:
            findings.append("All deterministic compliance rules passed cleanly.")

        return {
            "missing_documents": missing_docs,
            "pan_check": pan_check,
            "gst_check": gst_check,
            "turnover_check": turnover_check,
            "name_mismatch": name_mismatch,
            "risk_score": risk_score,
            "recommendation": recommendation,
            "findings_summary": findings,
        }
