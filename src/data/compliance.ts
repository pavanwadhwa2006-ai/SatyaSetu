import { ComplianceResult } from '@/types';

// ============================================================
// Mock Compliance Data — Prototype Data
// ============================================================

export const complianceResults: ComplianceResult[] = [
  // --- Bidder A: ABC Engineering — COMPLIANT (96%) ---
  {
    bidderId: 'BIDDER-001',
    bidId: 'BID-DEMO-001',
    tenderId: 'GEM-DEMO-2026-001',
    overallStatus: 'PASS',
    complianceScore: 96,
    totalRequirements: 13,
    passedRequirements: 13,
    failedRequirements: 0,
    reviewRequirements: 0,
    items: [
      { requirementId: 'REQ-001', requirementName: 'PAN Verification', status: 'PASS', evidenceDocument: 'PAN_Certificate_ABC.pdf', evidencePage: 1, extractedValue: 'AABCA1234B', expectedValue: 'AABCA1234B', reason: 'PAN matched with prototype verification record', confidence: 99 },
      { requirementId: 'REQ-002', requirementName: 'GST Registration', status: 'PASS', evidenceDocument: 'GST_Registration_ABC.pdf', evidencePage: 1, extractedValue: '07AABCA1234B1ZP — Active', expectedValue: 'Active GST Registration', reason: 'GSTIN active, legal name matched', confidence: 98 },
      { requirementId: 'REQ-003', requirementName: 'Company Registration', status: 'PASS', evidenceDocument: 'CoI_ABC_Engineering.pdf', evidencePage: 1, extractedValue: 'U29100DL2010PTC123456', expectedValue: 'Valid CIN', reason: 'Company registration verified', confidence: 98 },
      { requirementId: 'REQ-004', requirementName: 'Udyam/MSME Registration', status: 'PASS', evidenceDocument: 'Udyam_Certificate_ABC.pdf', evidencePage: 1, extractedValue: 'UDYAM-DL-07-0012345 — Medium', expectedValue: 'Valid Udyam (if applicable)', reason: 'Udyam registration valid', confidence: 97 },
      { requirementId: 'REQ-005', requirementName: 'Minimum Turnover', status: 'PASS', evidenceDocument: 'Audited_Financials_ABC.pdf', evidencePage: 2, extractedValue: '₹22.0 Crore (FY 2024-25)', expectedValue: '≥ ₹10 Crore', reason: 'Average turnover exceeds ₹10 Crore threshold', confidence: 96 },
      { requirementId: 'REQ-006', requirementName: 'Relevant Experience', status: 'PASS', evidenceDocument: 'Experience_Certificates_ABC.pdf', evidencePage: 4, extractedValue: '14 years, 45+ projects', expectedValue: '≥ 5 years', reason: 'Experience requirement satisfied', confidence: 95 },
      { requirementId: 'REQ-007', requirementName: 'OEM Authorization Certificate', status: 'PASS', evidenceDocument: 'OEM_Auth_ThermoTrack.pdf', evidencePage: 1, extractedValue: 'ThermoTrack Industries — Valid till Mar 2027', expectedValue: 'Valid OEM Authorization', reason: 'Valid OEM authorization from manufacturer', confidence: 99 },
      { requirementId: 'REQ-008', requirementName: 'Technical Compliance', status: 'PASS', evidenceDocument: 'Technical_Compliance_ABC.pdf', evidencePage: 3, extractedValue: 'All parameters meet/exceed requirements', expectedValue: 'Meets tender specifications', reason: 'Technical specifications satisfied', confidence: 97 },
      { requirementId: 'REQ-009', requirementName: 'Product Datasheet', status: 'PASS', evidenceDocument: 'Datasheet_ThermoTrack_X500.pdf', evidencePage: 1, extractedValue: 'ThermoTrack Pro X500', expectedValue: 'Product datasheet submitted', reason: 'Product datasheet submitted and verified', confidence: 98 },
      { requirementId: 'REQ-010', requirementName: 'Delivery Undertaking', status: 'PASS', evidenceDocument: 'Delivery_Undertaking_ABC.pdf', evidencePage: 1, extractedValue: '90 days', expectedValue: '≤ 120 days', reason: 'Delivery within specified timeline', confidence: 99 },
      { requirementId: 'REQ-011', requirementName: 'Warranty Declaration', status: 'PASS', evidenceDocument: 'Warranty_Declaration_ABC.pdf', evidencePage: 1, extractedValue: '36 months comprehensive', expectedValue: '≥ 36 months', reason: 'Warranty period meets minimum requirement', confidence: 99 },
      { requirementId: 'REQ-012', requirementName: 'MII/Local Content Declaration', status: 'PASS', evidenceDocument: 'MII_Declaration_ABC.pdf', evidencePage: 1, extractedValue: '72% local content', expectedValue: 'MII declaration submitted', reason: 'Make in India declaration with 72% local content', confidence: 97 },
      { requirementId: 'REQ-013', requirementName: 'MSE Certificate', status: 'PASS', evidenceDocument: null, evidencePage: null, extractedValue: 'Not claiming MSE preference', expectedValue: 'MSE certificate (if applicable)', reason: 'Not applicable — bidder not claiming MSE preference', confidence: 100 },
    ],
  },

  // --- Bidder B: Bharat Industrial — FAIL (72%) ---
  {
    bidderId: 'BIDDER-002',
    bidId: 'BID-DEMO-002',
    tenderId: 'GEM-DEMO-2026-001',
    overallStatus: 'FAIL',
    complianceScore: 72,
    totalRequirements: 13,
    passedRequirements: 9,
    failedRequirements: 3,
    reviewRequirements: 1,
    items: [
      { requirementId: 'REQ-001', requirementName: 'PAN Verification', status: 'PASS', evidenceDocument: 'PAN_Certificate_Bharat.pdf', evidencePage: 1, extractedValue: 'AABCB5678C', expectedValue: 'AABCB5678C', reason: 'PAN matched', confidence: 99 },
      { requirementId: 'REQ-002', requirementName: 'GST Registration', status: 'PASS', evidenceDocument: 'GST_Registration_Bharat.pdf', evidencePage: 1, extractedValue: '29AABCB5678C1ZQ — Active', expectedValue: 'Active GST', reason: 'GSTIN active, legal name matched', confidence: 98 },
      { requirementId: 'REQ-003', requirementName: 'Company Registration', status: 'PASS', evidenceDocument: 'CoI_Bharat_Industrial.pdf', evidencePage: 1, extractedValue: 'U31900KA2015PLC098765', expectedValue: 'Valid CIN', reason: 'Company registration verified', confidence: 98 },
      { requirementId: 'REQ-004', requirementName: 'Udyam/MSME Registration', status: 'PASS', evidenceDocument: null, evidencePage: null, extractedValue: 'Not registered', expectedValue: 'Valid Udyam (if applicable)', reason: 'Not applicable — bidder not MSME registered', confidence: 100 },
      { requirementId: 'REQ-005', requirementName: 'Minimum Turnover', status: 'PASS', evidenceDocument: 'Financials_Bharat.pdf', evidencePage: 3, extractedValue: '₹15.5 Crore', expectedValue: '≥ ₹10 Crore', reason: 'Turnover exceeds threshold', confidence: 96 },
      { requirementId: 'REQ-006', requirementName: 'Relevant Experience', status: 'PASS', evidenceDocument: 'Experience_Bharat.pdf', evidencePage: 2, extractedValue: '8 years', expectedValue: '≥ 5 years', reason: 'Experience requirement satisfied', confidence: 94 },
      { requirementId: 'REQ-007', requirementName: 'OEM Authorization Certificate', status: 'FAIL', evidenceDocument: null, evidencePage: null, extractedValue: null, expectedValue: 'Valid OEM Authorization', reason: 'Mandatory document not submitted. OEM Authorization Certificate is required.', confidence: 100 },
      { requirementId: 'REQ-008', requirementName: 'Technical Compliance', status: 'FAIL', evidenceDocument: 'Tech_Compliance_Bharat.pdf', evidencePage: 2, extractedValue: 'Accuracy: ±0.5°C (Required: ±0.15°C)', expectedValue: 'Meets tender specifications', reason: 'Accuracy specification does not meet tender requirement of ±0.15°C', confidence: 92 },
      { requirementId: 'REQ-009', requirementName: 'Product Datasheet', status: 'PASS', evidenceDocument: 'Datasheet_InduTemp_400.pdf', evidencePage: 1, extractedValue: 'InduTemp Monitor 400', expectedValue: 'Product datasheet submitted', reason: 'Datasheet submitted', confidence: 95 },
      { requirementId: 'REQ-010', requirementName: 'Delivery Undertaking', status: 'REVIEW', evidenceDocument: 'Delivery_Bharat.pdf', evidencePage: 1, extractedValue: '110 days', expectedValue: '≤ 120 days', reason: 'Within deadline but close to maximum limit', confidence: 90 },
      { requirementId: 'REQ-011', requirementName: 'Warranty Declaration', status: 'PASS', evidenceDocument: 'Warranty_Bharat.pdf', evidencePage: 1, extractedValue: '36 months', expectedValue: '≥ 36 months', reason: 'Warranty meets requirement', confidence: 99 },
      { requirementId: 'REQ-012', requirementName: 'MII/Local Content Declaration', status: 'PASS', evidenceDocument: 'MII_Bharat.pdf', evidencePage: 1, extractedValue: '55% local content', expectedValue: 'MII declaration submitted', reason: 'MII declaration found', confidence: 93 },
      { requirementId: 'REQ-013', requirementName: 'MSE Certificate', status: 'FAIL', evidenceDocument: null, evidencePage: null, extractedValue: null, expectedValue: 'MSE certificate (if applicable)', reason: 'Not applicable', confidence: 100 },
    ],
  },

  // --- Bidder C: National Process Equipments — REVIEW (84%) ---
  {
    bidderId: 'BIDDER-003',
    bidId: 'BID-DEMO-003',
    tenderId: 'GEM-DEMO-2026-001',
    overallStatus: 'REVIEW',
    complianceScore: 84,
    totalRequirements: 13,
    passedRequirements: 11,
    failedRequirements: 0,
    reviewRequirements: 2,
    items: [
      { requirementId: 'REQ-001', requirementName: 'PAN Verification', status: 'PASS', evidenceDocument: 'PAN_Certificate_NPE.pdf', evidencePage: 1, extractedValue: 'AABCN9012D', expectedValue: 'AABCN9012D', reason: 'PAN matched with prototype verification record', confidence: 99 },
      { requirementId: 'REQ-002', requirementName: 'GST Registration', status: 'REVIEW', evidenceDocument: 'GST_Registration_NPE.pdf', evidencePage: 1, extractedValue: '27ABCDE1234F1Z5 — Active', expectedValue: 'Active GST', reason: 'GSTIN active but legal name mismatch detected. Certificate: "National Process Equipments Pvt Ltd" vs Verification: "National Process Equipment Ltd"', confidence: 92 },
      { requirementId: 'REQ-003', requirementName: 'Company Registration', status: 'PASS', evidenceDocument: 'CoI_NPE.pdf', evidencePage: 1, extractedValue: 'U28100MH2008PTC567890', expectedValue: 'Valid CIN', reason: 'Company registration verified', confidence: 98 },
      { requirementId: 'REQ-004', requirementName: 'Udyam/MSME Registration', status: 'PASS', evidenceDocument: 'Udyam_NPE.pdf', evidencePage: 1, extractedValue: 'UDYAM-MH-27-0098765 — Small', expectedValue: 'Valid Udyam (if applicable)', reason: 'Udyam registration valid', confidence: 97 },
      { requirementId: 'REQ-005', requirementName: 'Minimum Turnover', status: 'PASS', evidenceDocument: 'Financials_NPE.pdf', evidencePage: 2, extractedValue: '₹14.8 Crore (FY 2024-25)', expectedValue: '≥ ₹10 Crore', reason: 'Average turnover exceeds threshold', confidence: 96 },
      { requirementId: 'REQ-006', requirementName: 'Relevant Experience', status: 'PASS', evidenceDocument: 'Experience_NPE.pdf', evidencePage: 4, extractedValue: '16 years, 60+ installations', expectedValue: '≥ 5 years', reason: 'Experience requirement satisfied', confidence: 95 },
      { requirementId: 'REQ-007', requirementName: 'OEM Authorization Certificate', status: 'PASS', evidenceDocument: 'OEM_Auth_ProcessTemp.pdf', evidencePage: 1, extractedValue: 'ProcessTemp Industries — Valid till Jun 2027', expectedValue: 'Valid OEM Authorization', reason: 'Valid OEM authorization from manufacturer', confidence: 99 },
      { requirementId: 'REQ-008', requirementName: 'Technical Compliance', status: 'PASS', evidenceDocument: 'Tech_Compliance_NPE.pdf', evidencePage: 3, extractedValue: 'All parameters meet/exceed requirements', expectedValue: 'Meets tender specifications', reason: 'Technical specifications satisfied', confidence: 97 },
      { requirementId: 'REQ-009', requirementName: 'Product Datasheet', status: 'PASS', evidenceDocument: 'Datasheet_ProcessTemp_600.pdf', evidencePage: 1, extractedValue: 'ProcessTemp Elite 600', expectedValue: 'Product datasheet submitted', reason: 'Product datasheet submitted and verified', confidence: 98 },
      { requirementId: 'REQ-010', requirementName: 'Delivery Undertaking', status: 'PASS', evidenceDocument: 'Delivery_NPE.pdf', evidencePage: 1, extractedValue: '100 days', expectedValue: '≤ 120 days', reason: 'Delivery within specified timeline', confidence: 99 },
      { requirementId: 'REQ-011', requirementName: 'Warranty Declaration', status: 'PASS', evidenceDocument: 'Warranty_NPE.pdf', evidencePage: 1, extractedValue: '36 months comprehensive', expectedValue: '≥ 36 months', reason: 'Warranty meets requirement', confidence: 99 },
      { requirementId: 'REQ-012', requirementName: 'MII/Local Content Declaration', status: 'PASS', evidenceDocument: 'MII_NPE.pdf', evidencePage: 1, extractedValue: '68% local content', expectedValue: 'MII declaration submitted', reason: 'Make in India declaration with 68% local content', confidence: 97 },
      { requirementId: 'REQ-013', requirementName: 'MSE Certificate', status: 'REVIEW', evidenceDocument: 'MSE_Certificate_NPE.pdf', evidencePage: 1, extractedValue: 'Small Enterprise — Manufacturing', expectedValue: 'MSE certificate (if applicable)', reason: 'MSE certificate submitted; name consistency to be verified with GST resolution', confidence: 88 },
    ],
  },

  // --- Bidder D: Reliable Instruments — FAIL (78%) ---
  {
    bidderId: 'BIDDER-004',
    bidId: 'BID-DEMO-004',
    tenderId: 'GEM-DEMO-2026-001',
    overallStatus: 'FAIL',
    complianceScore: 78,
    totalRequirements: 13,
    passedRequirements: 11,
    failedRequirements: 1,
    reviewRequirements: 1,
    items: [
      { requirementId: 'REQ-001', requirementName: 'PAN Verification', status: 'PASS', evidenceDocument: 'PAN_Certificate_RI.pdf', evidencePage: 1, extractedValue: 'AABCR3456E', expectedValue: 'AABCR3456E', reason: 'PAN matched', confidence: 99 },
      { requirementId: 'REQ-002', requirementName: 'GST Registration', status: 'PASS', evidenceDocument: 'GST_Registration_RI.pdf', evidencePage: 1, extractedValue: '33AABCR3456E1ZR — Active', expectedValue: 'Active GST', reason: 'GSTIN active, legal name matched', confidence: 98 },
      { requirementId: 'REQ-003', requirementName: 'Company Registration', status: 'PASS', evidenceDocument: 'CoI_RI.pdf', evidencePage: 1, extractedValue: 'U33100TN2012PTC234567', expectedValue: 'Valid CIN', reason: 'Company registration verified', confidence: 98 },
      { requirementId: 'REQ-004', requirementName: 'Udyam/MSME Registration', status: 'PASS', evidenceDocument: 'Udyam_RI.pdf', evidencePage: 1, extractedValue: 'UDYAM-TN-33-0054321 — Small', expectedValue: 'Valid Udyam (if applicable)', reason: 'Udyam registration valid', confidence: 97 },
      { requirementId: 'REQ-005', requirementName: 'Minimum Turnover', status: 'FAIL', evidenceDocument: 'Financials_RI.pdf', evidencePage: 3, extractedValue: '₹8.2 Crore (FY 2024-25)', expectedValue: '≥ ₹10 Crore', reason: 'Average annual turnover ₹8.2 Crore is below the minimum ₹10 Crore threshold', confidence: 96 },
      { requirementId: 'REQ-006', requirementName: 'Relevant Experience', status: 'PASS', evidenceDocument: 'Experience_RI.pdf', evidencePage: 2, extractedValue: '11 years', expectedValue: '≥ 5 years', reason: 'Experience requirement satisfied', confidence: 95 },
      { requirementId: 'REQ-007', requirementName: 'OEM Authorization Certificate', status: 'PASS', evidenceDocument: 'OEM_Auth_ReliTemp.pdf', evidencePage: 1, extractedValue: 'ReliTemp Manufacturing — Valid', expectedValue: 'Valid OEM Authorization', reason: 'Valid OEM authorization', confidence: 99 },
      { requirementId: 'REQ-008', requirementName: 'Technical Compliance', status: 'REVIEW', evidenceDocument: 'Tech_Compliance_RI.pdf', evidencePage: 3, extractedValue: 'Range: -100°C to +600°C (Required: -200°C to +850°C)', expectedValue: 'Meets tender specifications', reason: 'Temperature range narrower than tender requirement. May not cover full application scope.', confidence: 85 },
      { requirementId: 'REQ-009', requirementName: 'Product Datasheet', status: 'PASS', evidenceDocument: 'Datasheet_ReliTemp_350.pdf', evidencePage: 1, extractedValue: 'ReliTemp Industrial 350', expectedValue: 'Product datasheet submitted', reason: 'Product datasheet submitted', confidence: 97 },
      { requirementId: 'REQ-010', requirementName: 'Delivery Undertaking', status: 'PASS', evidenceDocument: 'Delivery_RI.pdf', evidencePage: 1, extractedValue: '95 days', expectedValue: '≤ 120 days', reason: 'Delivery within timeline', confidence: 99 },
      { requirementId: 'REQ-011', requirementName: 'Warranty Declaration', status: 'PASS', evidenceDocument: 'Warranty_RI.pdf', evidencePage: 1, extractedValue: '36 months', expectedValue: '≥ 36 months', reason: 'Warranty meets requirement', confidence: 99 },
      { requirementId: 'REQ-012', requirementName: 'MII/Local Content Declaration', status: 'PASS', evidenceDocument: 'MII_RI.pdf', evidencePage: 1, extractedValue: '78% local content', expectedValue: 'MII declaration submitted', reason: 'MII declaration with 78% local content', confidence: 98 },
      { requirementId: 'REQ-013', requirementName: 'MSE Certificate', status: 'PASS', evidenceDocument: 'MSE_Certificate_RI.pdf', evidencePage: 1, extractedValue: 'Small Enterprise — Manufacturing', expectedValue: 'MSE certificate (if applicable)', reason: 'MSE certificate valid', confidence: 96 },
    ],
  },
];

export const getComplianceByBidder = (bidderId: string): ComplianceResult | undefined =>
  complianceResults.find((c) => c.bidderId === bidderId);

export const getComplianceByTender = (tenderId: string): ComplianceResult[] =>
  complianceResults.filter((c) => c.tenderId === tenderId);
