"""
SatyaSetu Backend — Synthetic Bidder Document Validation Tests (Phase 4)
Validates that all generated synthetic PDF documents meet Phase 4 specifications:
- 5 bidder packages represented across 3 tenders
- Exactly matching ground truth file names and codes
- Watermark presence on every PDF
- No benchmark verdict leakage in text or filenames
- Valid, non-corrupt PDF structure that opens and extracts text cleanly
"""

import os
import json
import pytest
from pypdf import PdfReader

# Base paths
TEST_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(TEST_DIR)
PROJECT_ROOT = os.path.dirname(BACKEND_DIR)
SYNTHETIC_DIR = os.path.join(PROJECT_ROOT, "data", "synthetic")

EXPECTED_PACKAGES = {
    "T1-B2-Nexus": {
        "bidderCode": "T1-B2",
        "expectedFiles": [
            "Nexus_CA_Turnover_Cert.pdf",
            "OEM_CSI_Turnover_Statement.pdf",
            "Nexus_Reseller_MAF_Generic.pdf",
            "PO_Horizon_Techworks.pdf",
            "Nexus_Udyam_Registration.pdf",
            "Nexus_MII_SelfDeclaration.pdf",
            "Nexus_Technical_Delivery_Proposal.pdf",
            "Nexus_NonBlacklisting_PlainPaper.pdf",
        ],
    },
    "T2-B1-Vanguard": {
        "bidderCode": "T2-B1",
        "expectedFiles": [
            "Vanguard_Audited_Turnover_Certificate.pdf",
            "Vanguard_Supply_Performance_8000units.pdf",
            "Vanguard_CRAC_Certificates.pdf",
            "Vanguard_Udyam_Manufacturing_Kanpur.pdf",
            "Vanguard_MII_CA_Certificate_78.4pct.pdf",
            "Vanguard_Notarized_Affidavit.pdf",
        ],
    },
    "T2-B2-Zenith": {
        "bidderCode": "T2-B2",
        "expectedFiles": [
            "Zenith_CA_Turnover_2Years.pdf",
            "Zenith_DPIIT_Application_Ack.pdf",
            "Zenith_AlphaTrading_PO_3500units.pdf",
            "Zenith_Expired_OEM_MAF.pdf",
            "Zenith_MII_Self_Declaration.pdf",
            "Zenith_Sample_Timeline_Undertaking.pdf",
            "Zenith_NonBlacklisting_Letterhead.pdf",
        ],
    },
    "T3-B1-Apex": {
        "bidderCode": "T3-B1",
        "expectedFiles": [
            "Apex_Audited_Turnover_Cert.pdf",
            "Apex_Govt_Polytechnic_AMC_Cert.pdf",
            "Apex_ClassA_Electrical_License_Gujarat.pdf",
            "Apex_GSTR3B_Apr_May_Jun2026.pdf",
            "Apex_Notarized_NonBlacklisting_Affidavit.pdf",
            "Apex_Bank_Solvency_Certificate.pdf",
            "Apex_ISI_Material_Undertaking.pdf",
        ],
    },
    "T3-B2-Voltech": {
        "bidderCode": "T3-B2",
        "expectedFiles": [
            "Voltech_CA_Turnover_Cert.pdf",
            "Voltech_GST_Delhi_Registration.pdf",
            "Voltech_PO_LED_Bulb_Supply.pdf",
            "Voltech_Expired_Electrical_License.pdf",
            "Voltech_Partial_GSTR3B_Apr2026.pdf",
            "Voltech_NonBlacklisting_PlainPaper.pdf",
            "Voltech_Technical_Material_Proposal.pdf",
            "Voltech_NCLT_IBC_Disclosure.pdf",
        ],
    },
}


def test_synthetic_directory_and_manifest_exist():
    """Verify synthetic output directory and manifest.json exist."""
    assert os.path.exists(SYNTHETIC_DIR), f"Synthetic directory missing: {SYNTHETIC_DIR}"
    manifest_file = os.path.join(SYNTHETIC_DIR, "manifest.json")
    assert os.path.exists(manifest_file), f"Manifest file missing: {manifest_file}"

    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    assert "packages" in manifest
    assert len(manifest["packages"]) == 5


def test_all_expected_packages_and_files_exist():
    """Verify every bidder package directory and each expected PDF exists and is non-empty."""
    for folder_name, pkg_info in EXPECTED_PACKAGES.items():
        pkg_path = os.path.join(SYNTHETIC_DIR, folder_name)
        assert os.path.isdir(pkg_path), f"Missing package directory: {pkg_path}"

        for filename in pkg_info["expectedFiles"]:
            pdf_path = os.path.join(pkg_path, filename)
            assert os.path.exists(pdf_path), f"Missing PDF file: {pdf_path}"
            file_size = os.path.getsize(pdf_path)
            assert file_size > 1000, f"PDF file suspiciously small ({file_size} bytes): {pdf_path}"


def test_pdf_open_read_and_watermark():
    """Verify every generated PDF opens cleanly with pypdf and contains the required watermark."""
    for folder_name, pkg_info in EXPECTED_PACKAGES.items():
        pkg_path = os.path.join(SYNTHETIC_DIR, folder_name)
        for filename in pkg_info["expectedFiles"]:
            pdf_path = os.path.join(pkg_path, filename)
            reader = PdfReader(pdf_path)
            assert len(reader.pages) >= 1, f"PDF has 0 pages: {pdf_path}"

            # Extract text from all pages
            full_text = ""
            for page in reader.pages:
                full_text += page.extract_text() or ""

            assert len(full_text.strip()) > 50, f"Extracted text too short in: {pdf_path}"
            assert "SYNTHETIC DATA" in full_text, f"Missing watermark in: {pdf_path}"
            assert "HACKATHON DEMONSTRATION ONLY" in full_text, f"Missing demo notice in: {pdf_path}"


def test_no_benchmark_verdict_leakage():
    """Verify filenames and document bodies do not contain hardcoded verdict shortcuts."""
    for folder_name, pkg_info in EXPECTED_PACKAGES.items():
        pkg_path = os.path.join(SYNTHETIC_DIR, folder_name)
        for filename in pkg_info["expectedFiles"]:
            assert "NON_COMPLIANT" not in filename
            assert "COMPLIANT" not in filename
            assert "REVIEW" not in filename

            pdf_path = os.path.join(pkg_path, filename)
            reader = PdfReader(pdf_path)
            for page in reader.pages:
                text = page.extract_text() or ""
                # Verify that verdict keywords are not leaked as answer keys
                assert "BENCHMARK_STATUS: COMPLIANT" not in text
                assert "BENCHMARK_STATUS: NON_COMPLIANT" not in text
                assert "VERDICT: FAIL" not in text
                assert "VERDICT: PASS" not in text


def test_apex_uses_normalized_t3_b1():
    """Verify Apex package and files use normalized code T3-B1."""
    apex_pkg = os.path.join(SYNTHETIC_DIR, "T3-B1-Apex")
    assert os.path.isdir(apex_pkg)
    assert not os.path.exists(os.path.join(SYNTHETIC_DIR, "T5-B1-Apex"))
