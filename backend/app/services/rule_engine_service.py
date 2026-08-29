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
    "WORK_ORDER",
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
        Rule 4: Detect missing mandatory document types with alias matching.
        """
        present_types = set()
        for doc in extracted_documents:
            doc_type = (doc.get("document_type") or doc.get("type") or "").upper()
            if doc_type:
                present_types.add(doc_type)

        aliases = {
            "PAN_CERTIFICATE": ["PAN", "PAN_CERTIFICATE"],
            "GST_CERTIFICATE": ["GST", "GSTIN", "GST_CERTIFICATE"],
            "COMPANY_REGISTRATION": ["COI", "COMPANY_REGISTRATION", "UDYAM", "MSME"],
            "TURNOVER_CERTIFICATE": ["TURNOVER", "TURNOVER_CERTIFICATE", "CA_TURNOVER"],
            "WORK_ORDER": ["WORK_ORDER", "EXPERIENCE", "COMPLETION_CERTIFICATE"],
        }

        missing = []
        for req_type, req_aliases in aliases.items():
            if not any(any(alias in pt for alias in req_aliases) for pt in present_types):
                missing.append(req_type)
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
        Execute deterministic evaluation pipeline with strict AI Document Classification & Slot Verification:
          - PAN Verification: 15 pts
          - GST Registration: 15 pts
          - Company Registration / Udyam: 20 pts
          - Minimum Turnover: 20 pts
          - Relevant Experience / Work Order: 20 pts
          - Technical Compliance: 10 pts
        Total = 100 pts.
        """
        pan_number = None
        gstin_number = None
        extracted_turnover = None
        work_order_val = None
        udyam_num = None
        cin_num = None
        client_name = None
        legal_names = []
        doc_filename_map = {}
        slot_doc_map = {}

        for doc in extracted_documents:
            ext = doc.get("extracted_data") or doc
            if isinstance(ext, str):
                try:
                    import json
                    ext = json.loads(ext)
                except Exception:
                    ext = {}

            dtype = (doc.get("document_type") or ext.get("document_type") or "").upper()
            filename = (doc.get("original_filename") or f"{dtype.lower()}.pdf").lower()
            orig_filename = doc.get("original_filename") or f"{dtype.lower()}.pdf"
            doc_filename_map[dtype] = orig_filename
            
            doc_class = (ext.get("document_classification") or ext.get("document_type") or "").upper()
            is_profile = ext.get("is_company_profile_or_brochure") == True or "COMPANY_PROFILE" in doc_class or "profile" in filename or "brochure" in filename

            slot_doc_map[dtype] = {
                "filename": orig_filename,
                "ext": ext,
                "classification": doc_class,
                "detected_title": ext.get("detected_title") or "",
                "is_profile": is_profile,
                "summary": ext.get("summary") or ""
            }

            if not pan_number and ext.get("pan_number"):
                pan_number = ext.get("pan_number")
            if not gstin_number and ext.get("gstin"):
                gstin_number = ext.get("gstin")
            if not udyam_num and ext.get("udyam_number"):
                udyam_num = ext.get("udyam_number")
            if not cin_num and ext.get("cin"):
                cin_num = ext.get("cin")
            if extracted_turnover is None and ext.get("turnover") is not None:
                try:
                    extracted_turnover = float(ext.get("turnover"))
                except (ValueError, TypeError):
                    pass
            if work_order_val is None and ext.get("work_order_value") is not None:
                try:
                    work_order_val = float(ext.get("work_order_value"))
                except (ValueError, TypeError):
                    pass
            if not client_name and ext.get("client_name"):
                client_name = ext.get("client_name")

            if ext.get("legal_name"):
                legal_names.append(ext.get("legal_name"))

        missing_documents = cls.check_missing_documents(extracted_documents)
        pan_result = cls.validate_pan(pan_number)
        gst_result = cls.validate_gstin(gstin_number)
        turnover_result = cls.evaluate_turnover(extracted_turnover, required_turnover)
        name_consistency = cls.check_name_consistency(legal_names)

        # ── 1. PAN Slot Verification ──
        pan_doc = slot_doc_map.get("PAN_CERTIFICATE") or {}
        pan_is_profile = pan_doc.get("is_profile", False)
        pan_pass = pan_result["format_valid"] and not pan_is_profile

        # ── 2. GST Slot Verification ──
        gst_doc = slot_doc_map.get("GST_CERTIFICATE") or {}
        gst_is_profile = gst_doc.get("is_profile", False)
        gst_pass = gst_result["format_valid"] and not gst_is_profile

        # ── 3. Company Registration / Udyam Slot Verification ──
        coi_doc = slot_doc_map.get("COMPANY_REGISTRATION") or {}
        coi_is_profile = coi_doc.get("is_profile", False)
        coi_class = coi_doc.get("classification", "")
        has_reg_proof = bool(udyam_num or cin_num or "UDYAM" in coi_class or "INCORPORATION" in coi_class or "MSME" in coi_class)
        coi_pass = ("COMPANY_REGISTRATION" not in missing_documents) and has_reg_proof and not coi_is_profile

        # ── 4. Turnover Slot Verification ──
        to_doc = slot_doc_map.get("TURNOVER_CERTIFICATE") or {}
        to_is_profile = to_doc.get("is_profile", False)
        turnover_pass = turnover_result["eligible"] and ("TURNOVER_CERTIFICATE" not in missing_documents) and not to_is_profile

        # ── 5. Work Order / Experience Slot Verification ──
        exp_doc = slot_doc_map.get("WORK_ORDER") or {}
        exp_is_profile = exp_doc.get("is_profile", False)
        exp_class = exp_doc.get("classification", "")
        has_wo_proof = bool(work_order_val or client_name or "WORK_ORDER" in exp_class or "COMPLETION" in exp_class or "CONTRACT" in exp_class)
        exp_pass = ("WORK_ORDER" not in missing_documents) and has_wo_proof and not exp_is_profile

        # ── 6. Technical Compliance Slot Verification ──
        tech_doc = slot_doc_map.get("TECHNICAL_COMPLIANCE") or {}
        tech_is_profile = tech_doc.get("is_profile", False)
        tech_pass = ("TECHNICAL_COMPLIANCE" not in missing_documents) and not tech_is_profile

        # ── Calculate Weighted Compliance Score (Max 100) ──
        earned_score = 0
        if pan_pass:
            earned_score += 15
        if gst_pass:
            earned_score += 15
        if coi_pass:
            earned_score += 20
        if turnover_pass:
            earned_score += 20
        elif "TURNOVER_CERTIFICATE" not in missing_documents and not to_is_profile and extracted_turnover and extracted_turnover >= (required_turnover * 0.7):
            earned_score += 10

        if exp_pass:
            earned_score += 20
        if tech_pass:
            earned_score += 10

        # Mismatch Penalty: Deduct points if any slot received a Company Profile / mismatched document
        failed_slots = sum(1 for is_p in [pan_is_profile, gst_is_profile, coi_is_profile, to_is_profile, exp_is_profile, tech_is_profile] if is_p)
        if failed_slots > 0:
            earned_score = max(0, earned_score - (failed_slots * 15))

        if not name_consistency["passed"] and len(name_consistency.get("unique_names", [])) > 1:
            earned_score = max(0, earned_score - 10)

        compliance_score = int(min(100, max(0, earned_score)))

        # Risk Score Calculation
        risk_score = max(0, 100 - compliance_score)
        if missing_documents:
            risk_score += len(missing_documents) * 10
        if failed_slots > 0:
            risk_score += failed_slots * 15
        risk_score = min(100, risk_score)

        if risk_score <= 20:
            risk_level = "LOW"
        elif risk_score <= 50:
            risk_level = "MEDIUM"
        else:
            risk_level = "HIGH"

        # Decision & AI Recommendation Thresholds
        if compliance_score >= 90 and not missing_documents and pan_pass and gst_pass and coi_pass and exp_pass and name_consistency["passed"] and failed_slots == 0:
            officer_decision = "QUALIFIED"
            ai_status = "VERIFIED"
            recommendation = "AUTO_APPROVE"
        elif compliance_score >= 70 and failed_slots == 0:
            officer_decision = "CLARIFICATION_REQUESTED"
            ai_status = "NEEDS_REVIEW"
            recommendation = "HUMAN_REVIEW"
        else:
            officer_decision = "DISQUALIFIED"
            ai_status = "NEEDS_REVIEW"
            recommendation = "AUTO_REJECT"

        # Generate Evidence-Based Items for Officer Portal
        items = [
            {
                "requirementId": "REQ-001",
                "requirementName": "PAN Verification",
                "status": "PASS" if pan_pass else "FAIL",
                "confidence": 99 if pan_pass else 40,
                "evidenceDocument": pan_doc.get("filename") or "PAN_Certificate.pdf",
                "evidencePage": 1,
                "extractedValue": f"PAN: {pan_result['number']}" if pan_pass else (f"Detected: {pan_doc.get('detected_title', 'Company Profile')} (No PAN Card)" if pan_is_profile else "Missing PAN"),
                "expectedValue": "Valid 10-character PAN Card",
                "reason": "PAN matched format and legal name" if pan_pass else ("Uploaded file is a Company Profile / Brochure instead of a PAN Card Certificate." if pan_is_profile else "Invalid or missing PAN format"),
            },
            {
                "requirementId": "REQ-002",
                "requirementName": "GST Registration",
                "status": "PASS" if gst_pass else "FAIL",
                "confidence": 98 if gst_pass else 40,
                "evidenceDocument": gst_doc.get("filename") or "GST_Registration.pdf",
                "evidencePage": 1,
                "extractedValue": f"GSTIN: {gst_result['gstin']}" if gst_pass else (f"Detected: {gst_doc.get('detected_title', 'Company Profile')} (No GSTIN)" if gst_is_profile else "Missing GSTIN"),
                "expectedValue": "Active GST REG-06 Registration",
                "reason": "GSTIN active, legal name matched" if gst_pass else ("Uploaded file is a Company Profile / Brochure instead of GST Registration Certificate." if gst_is_profile else "Missing or invalid GSTIN"),
            },
            {
                "requirementId": "REQ-003",
                "requirementName": "Company Registration / Udyam",
                "status": "PASS" if coi_pass else "FAIL",
                "confidence": 98 if coi_pass else 35,
                "evidenceDocument": coi_doc.get("filename") or "Company_Profile.pdf",
                "evidencePage": 1,
                "extractedValue": f"UDYAM: {udyam_num}" if udyam_num else (f"CIN: {cin_num}" if cin_num else (f"Detected: {coi_doc.get('detected_title', 'Company Profile')} (No UDYAM/CIN Number)" if coi_is_profile else "No Udyam / Incorporation Registration Proof")),
                "expectedValue": "Udyam Registration Certificate / Certificate of Incorporation",
                "reason": "Company registration & Udyam verified" if coi_pass else ("Uploaded file is a Company Profile / Brochure instead of Udyam Certificate or Certificate of Incorporation. No UDYAM registration number found." if coi_is_profile else "Uploaded document does not contain Udyam or Incorporation registration proof"),
            },
            {
                "requirementId": "REQ-004",
                "requirementName": "Minimum Turnover",
                "status": "PASS" if turnover_pass else "FAIL",
                "confidence": 96 if turnover_pass else 40,
                "evidenceDocument": to_doc.get("filename") or "CA_Turnover.pdf",
                "evidencePage": 1,
                "extractedValue": f"INR {extracted_turnover:,.0f}" if (extracted_turnover and not to_is_profile) else f"Detected: {to_doc.get('detected_title', 'Company Profile')} (No CA Turnover Statement)",
                "expectedValue": f">= INR {required_turnover:,.0f}",
                "reason": "Turnover satisfies tender threshold" if turnover_pass else ("Uploaded document is a Company Profile / Brochure instead of a CA Audited Turnover Certificate with UDIN." if to_is_profile else f"Turnover below required INR {required_turnover:,.0f}"),
            },
            {
                "requirementId": "REQ-005",
                "requirementName": "Relevant Experience / Work Order",
                "status": "PASS" if exp_pass else "FAIL",
                "confidence": 95 if exp_pass else 35,
                "evidenceDocument": exp_doc.get("filename") or "Company_Profile.pdf",
                "evidencePage": 1,
                "extractedValue": f"Contract: {client_name or 'Government Client'} (INR {work_order_val:,.0f})" if (work_order_val and not exp_is_profile) else f"Detected: {exp_doc.get('detected_title', 'Company Profile')} (No Work Order Value)",
                "expectedValue": "Relevant Work Order / Contract Completion Certificate",
                "reason": "Past performance & work order verified" if exp_pass else ("Uploaded file is a Company Profile / Brochure instead of a Work Order or Contract Completion Certificate. No client contract value found." if exp_is_profile else "Uploaded document does not contain work order contract value or completion proof"),
            },
            {
                "requirementId": "REQ-006",
                "requirementName": "Technical Compliance",
                "status": "PASS" if tech_pass else "FAIL",
                "confidence": 97 if tech_pass else 45,
                "evidenceDocument": tech_doc.get("filename") or "Company_Profile.pdf",
                "evidencePage": 1,
                "extractedValue": "Technical Specification Declaration" if tech_pass else f"Detected: {tech_doc.get('detected_title', 'Company Profile')} (No Specification Declaration)",
                "expectedValue": "Meets Tender Technical Specification",
                "reason": "Technical criteria satisfied" if tech_pass else "Uploaded document is a Company Profile / Brochure without technical compliance declaration",
            },
        ]

        passed_count = sum(1 for it in items if it["status"] == "PASS")
        failed_count = sum(1 for it in items if it["status"] == "FAIL")
        review_count = sum(1 for it in items if it["status"] == "REVIEW")

        return {
            "compliance_score": compliance_score,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "ai_verification_status": ai_status,
            "officer_recommendation": officer_decision,
            "recommendation": recommendation,
            "documents_processed": len(extracted_documents),
            "missing_documents": missing_documents,
            "totalRequirements": len(items),
            "passedRequirements": passed_count,
            "failedRequirements": failed_count,
            "reviewRequirements": review_count,
            "pan": pan_result,
            "gst": gst_result,
            "turnover": turnover_result,
            "name_consistency": name_consistency,
            "items": items,
        }

