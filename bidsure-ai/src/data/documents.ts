import { BidDocument, DocumentType } from '@/types';

// ============================================================
// Mock Document Data — Prototype Data
// All file names and extracted data are synthetic.
// ============================================================

function makeDoc(
  id: string,
  bidId: string,
  bidderId: string,
  type: DocumentType,
  typeName: string,
  fileName: string,
  pageCount: number,
  extractionStatus: 'PENDING' | 'EXTRACTED' | 'FAILED',
  verificationStatus: 'PENDING' | 'PASS' | 'FAIL' | 'REVIEW',
  confidence: number,
  extractedFields: { fieldName: string; extractedValue: string; confidence: number }[] = []
): BidDocument {
  return {
    id, bidId, bidderId, type, typeName, fileName,
    uploadedAt: '2026-09-14T09:32:00+05:30',
    fileSize: `${Math.floor(Math.random() * 400 + 100)} KB`,
    pageCount,
    extractionStatus, verificationStatus, confidence,
    extractedFields,
  };
}

// --- Bidder A: ABC Engineering (Fully Compliant) ---
const bidder1Docs: BidDocument[] = [
  makeDoc('DOC-001-PAN', 'BID-DEMO-001', 'BIDDER-001', 'PAN_CERTIFICATE', 'PAN Certificate', 'PAN_Certificate_ABC.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'PAN Number', extractedValue: 'AABCA1234B', confidence: 99 }, { fieldName: 'Name', extractedValue: 'ABC Engineering Pvt. Ltd.', confidence: 98 }]),
  makeDoc('DOC-001-GST', 'BID-DEMO-001', 'BIDDER-001', 'GST_CERTIFICATE', 'GST Certificate', 'GST_Registration_ABC.pdf', 2, 'EXTRACTED', 'PASS', 98,
    [{ fieldName: 'GSTIN', extractedValue: '07AABCA1234B1ZP', confidence: 99 }, { fieldName: 'Legal Name', extractedValue: 'ABC Engineering Pvt. Ltd.', confidence: 98 }, { fieldName: 'Status', extractedValue: 'ACTIVE', confidence: 99 }]),
  makeDoc('DOC-001-UDYAM', 'BID-DEMO-001', 'BIDDER-001', 'UDYAM_CERTIFICATE', 'Udyam Certificate', 'Udyam_Certificate_ABC.pdf', 1, 'EXTRACTED', 'PASS', 97,
    [{ fieldName: 'Udyam Number', extractedValue: 'UDYAM-DL-07-0012345', confidence: 97 }, { fieldName: 'Enterprise Name', extractedValue: 'ABC Engineering Pvt. Ltd.', confidence: 96 }]),
  makeDoc('DOC-001-REG', 'BID-DEMO-001', 'BIDDER-001', 'COMPANY_REGISTRATION', 'Company Registration', 'CoI_ABC_Engineering.pdf', 3, 'EXTRACTED', 'PASS', 98,
    [{ fieldName: 'CIN', extractedValue: 'U29100DL2010PTC123456', confidence: 98 }, { fieldName: 'Company Name', extractedValue: 'ABC Engineering Pvt. Ltd.', confidence: 99 }]),
  makeDoc('DOC-001-TURN', 'BID-DEMO-001', 'BIDDER-001', 'TURNOVER_CERTIFICATE', 'Turnover Certificate', 'Audited_Financials_ABC.pdf', 8, 'EXTRACTED', 'PASS', 96,
    [{ fieldName: 'FY 2024-25 Turnover', extractedValue: '₹22.0 Crore', confidence: 96 }, { fieldName: 'FY 2023-24 Turnover', extractedValue: '₹19.8 Crore', confidence: 95 }, { fieldName: 'FY 2022-23 Turnover', extractedValue: '₹17.5 Crore', confidence: 95 }]),
  makeDoc('DOC-001-EXP', 'BID-DEMO-001', 'BIDDER-001', 'EXPERIENCE_CERTIFICATE', 'Experience Certificate', 'Experience_Certificates_ABC.pdf', 12, 'EXTRACTED', 'PASS', 95,
    [{ fieldName: 'Years of Experience', extractedValue: '14 years', confidence: 95 }, { fieldName: 'Projects Completed', extractedValue: '45+', confidence: 93 }]),
  makeDoc('DOC-001-OEM', 'BID-DEMO-001', 'BIDDER-001', 'OEM_AUTHORIZATION', 'OEM Authorization', 'OEM_Auth_ThermoTrack.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'Manufacturer', extractedValue: 'ThermoTrack Industries', confidence: 99 }, { fieldName: 'Authorized Dealer', extractedValue: 'ABC Engineering Pvt. Ltd.', confidence: 98 }, { fieldName: 'Validity', extractedValue: '31 Mar 2027', confidence: 99 }]),
  makeDoc('DOC-001-TECH', 'BID-DEMO-001', 'BIDDER-001', 'TECHNICAL_COMPLIANCE', 'Technical Compliance Sheet', 'Technical_Compliance_ABC.pdf', 6, 'EXTRACTED', 'PASS', 97,
    [{ fieldName: 'Temperature Range', extractedValue: '-200°C to +850°C', confidence: 98 }, { fieldName: 'Accuracy', extractedValue: '±0.1°C', confidence: 97 }]),
  makeDoc('DOC-001-DATA', 'BID-DEMO-001', 'BIDDER-001', 'PRODUCT_DATASHEET', 'Product Datasheet', 'Datasheet_ThermoTrack_X500.pdf', 4, 'EXTRACTED', 'PASS', 98, []),
  makeDoc('DOC-001-WAR', 'BID-DEMO-001', 'BIDDER-001', 'WARRANTY_DECLARATION', 'Warranty Declaration', 'Warranty_Declaration_ABC.pdf', 2, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'Warranty Period', extractedValue: '36 months', confidence: 99 }]),
  makeDoc('DOC-001-DEL', 'BID-DEMO-001', 'BIDDER-001', 'DELIVERY_UNDERTAKING', 'Delivery Undertaking', 'Delivery_Undertaking_ABC.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'Delivery Period', extractedValue: '90 days', confidence: 99 }]),
  makeDoc('DOC-001-MII', 'BID-DEMO-001', 'BIDDER-001', 'MII_DECLARATION', 'MII Declaration', 'MII_Declaration_ABC.pdf', 1, 'EXTRACTED', 'PASS', 97,
    [{ fieldName: 'Local Content', extractedValue: '72%', confidence: 97 }]),
];

// --- Bidder B: Bharat Industrial (Missing OEM) ---
const bidder2Docs: BidDocument[] = [
  makeDoc('DOC-002-PAN', 'BID-DEMO-002', 'BIDDER-002', 'PAN_CERTIFICATE', 'PAN Certificate', 'PAN_Certificate_Bharat.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'PAN Number', extractedValue: 'AABCB5678C', confidence: 99 }]),
  makeDoc('DOC-002-GST', 'BID-DEMO-002', 'BIDDER-002', 'GST_CERTIFICATE', 'GST Certificate', 'GST_Registration_Bharat.pdf', 2, 'EXTRACTED', 'PASS', 98,
    [{ fieldName: 'GSTIN', extractedValue: '29AABCB5678C1ZQ', confidence: 99 }, { fieldName: 'Legal Name', extractedValue: 'Bharat Industrial Systems Ltd.', confidence: 98 }, { fieldName: 'Status', extractedValue: 'ACTIVE', confidence: 99 }]),
  makeDoc('DOC-002-REG', 'BID-DEMO-002', 'BIDDER-002', 'COMPANY_REGISTRATION', 'Company Registration', 'CoI_Bharat_Industrial.pdf', 3, 'EXTRACTED', 'PASS', 98, []),
  makeDoc('DOC-002-TURN', 'BID-DEMO-002', 'BIDDER-002', 'TURNOVER_CERTIFICATE', 'Turnover Certificate', 'Financials_Bharat.pdf', 6, 'EXTRACTED', 'PASS', 96,
    [{ fieldName: 'FY 2024-25 Turnover', extractedValue: '₹15.5 Crore', confidence: 96 }]),
  makeDoc('DOC-002-EXP', 'BID-DEMO-002', 'BIDDER-002', 'EXPERIENCE_CERTIFICATE', 'Experience Certificate', 'Experience_Bharat.pdf', 4, 'EXTRACTED', 'PASS', 94,
    [{ fieldName: 'Years of Experience', extractedValue: '8 years', confidence: 94 }]),
  // OEM Authorization is MISSING — intentional
  makeDoc('DOC-002-TECH', 'BID-DEMO-002', 'BIDDER-002', 'TECHNICAL_COMPLIANCE', 'Technical Compliance Sheet', 'Tech_Compliance_Bharat.pdf', 5, 'EXTRACTED', 'FAIL', 88,
    [{ fieldName: 'Accuracy', extractedValue: '±0.5°C', confidence: 92 }]),
  makeDoc('DOC-002-DATA', 'BID-DEMO-002', 'BIDDER-002', 'PRODUCT_DATASHEET', 'Product Datasheet', 'Datasheet_InduTemp_400.pdf', 3, 'EXTRACTED', 'PASS', 95, []),
  makeDoc('DOC-002-WAR', 'BID-DEMO-002', 'BIDDER-002', 'WARRANTY_DECLARATION', 'Warranty Declaration', 'Warranty_Bharat.pdf', 1, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-002-DEL', 'BID-DEMO-002', 'BIDDER-002', 'DELIVERY_UNDERTAKING', 'Delivery Undertaking', 'Delivery_Bharat.pdf', 1, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-002-MII', 'BID-DEMO-002', 'BIDDER-002', 'MII_DECLARATION', 'MII Declaration', 'MII_Bharat.pdf', 1, 'EXTRACTED', 'PASS', 93, []),
];

// --- Bidder C: National Process Equipments (GST Mismatch) ---
const bidder3Docs: BidDocument[] = [
  makeDoc('DOC-003-PAN', 'BID-DEMO-003', 'BIDDER-003', 'PAN_CERTIFICATE', 'PAN Certificate', 'PAN_Certificate_NPE.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'PAN Number', extractedValue: 'AABCN9012D', confidence: 99 }, { fieldName: 'Name', extractedValue: 'National Process Equipments Pvt. Ltd.', confidence: 98 }]),
  makeDoc('DOC-003-GST', 'BID-DEMO-003', 'BIDDER-003', 'GST_CERTIFICATE', 'GST Certificate', 'GST_Registration_NPE.pdf', 2, 'EXTRACTED', 'REVIEW', 92,
    [{ fieldName: 'GSTIN', extractedValue: '27ABCDE1234F1Z5', confidence: 99 }, { fieldName: 'Legal Name', extractedValue: 'National Process Equipments Pvt Ltd', confidence: 95 }, { fieldName: 'Status', extractedValue: 'ACTIVE', confidence: 99 }]),
  makeDoc('DOC-003-UDYAM', 'BID-DEMO-003', 'BIDDER-003', 'UDYAM_CERTIFICATE', 'Udyam Certificate', 'Udyam_NPE.pdf', 1, 'EXTRACTED', 'PASS', 97,
    [{ fieldName: 'Udyam Number', extractedValue: 'UDYAM-MH-27-0098765', confidence: 97 }]),
  makeDoc('DOC-003-REG', 'BID-DEMO-003', 'BIDDER-003', 'COMPANY_REGISTRATION', 'Company Registration', 'CoI_NPE.pdf', 3, 'EXTRACTED', 'PASS', 98, []),
  makeDoc('DOC-003-TURN', 'BID-DEMO-003', 'BIDDER-003', 'TURNOVER_CERTIFICATE', 'Turnover Certificate', 'Financials_NPE.pdf', 8, 'EXTRACTED', 'PASS', 96,
    [{ fieldName: 'FY 2024-25 Turnover', extractedValue: '₹14.8 Crore', confidence: 96 }, { fieldName: 'FY 2023-24 Turnover', extractedValue: '₹13.2 Crore', confidence: 95 }]),
  makeDoc('DOC-003-EXP', 'BID-DEMO-003', 'BIDDER-003', 'EXPERIENCE_CERTIFICATE', 'Experience Certificate', 'Experience_NPE.pdf', 10, 'EXTRACTED', 'PASS', 95,
    [{ fieldName: 'Years of Experience', extractedValue: '16 years', confidence: 95 }]),
  makeDoc('DOC-003-OEM', 'BID-DEMO-003', 'BIDDER-003', 'OEM_AUTHORIZATION', 'OEM Authorization', 'OEM_Auth_ProcessTemp.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'Manufacturer', extractedValue: 'ProcessTemp Industries', confidence: 99 }, { fieldName: 'Validity', extractedValue: '30 Jun 2027', confidence: 99 }]),
  makeDoc('DOC-003-TECH', 'BID-DEMO-003', 'BIDDER-003', 'TECHNICAL_COMPLIANCE', 'Technical Compliance Sheet', 'Tech_Compliance_NPE.pdf', 5, 'EXTRACTED', 'PASS', 97, []),
  makeDoc('DOC-003-DATA', 'BID-DEMO-003', 'BIDDER-003', 'PRODUCT_DATASHEET', 'Product Datasheet', 'Datasheet_ProcessTemp_600.pdf', 4, 'EXTRACTED', 'PASS', 98, []),
  makeDoc('DOC-003-WAR', 'BID-DEMO-003', 'BIDDER-003', 'WARRANTY_DECLARATION', 'Warranty Declaration', 'Warranty_NPE.pdf', 2, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-003-DEL', 'BID-DEMO-003', 'BIDDER-003', 'DELIVERY_UNDERTAKING', 'Delivery Undertaking', 'Delivery_NPE.pdf', 1, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-003-MII', 'BID-DEMO-003', 'BIDDER-003', 'MII_DECLARATION', 'MII Declaration', 'MII_NPE.pdf', 1, 'EXTRACTED', 'PASS', 97, []),
  makeDoc('DOC-003-MSE', 'BID-DEMO-003', 'BIDDER-003', 'MSE_CERTIFICATE', 'MSE Certificate', 'MSE_Certificate_NPE.pdf', 1, 'EXTRACTED', 'PASS', 96, []),
];

// --- Bidder D: Reliable Instruments (Turnover below threshold) ---
const bidder4Docs: BidDocument[] = [
  makeDoc('DOC-004-PAN', 'BID-DEMO-004', 'BIDDER-004', 'PAN_CERTIFICATE', 'PAN Certificate', 'PAN_Certificate_RI.pdf', 1, 'EXTRACTED', 'PASS', 99,
    [{ fieldName: 'PAN Number', extractedValue: 'AABCR3456E', confidence: 99 }]),
  makeDoc('DOC-004-GST', 'BID-DEMO-004', 'BIDDER-004', 'GST_CERTIFICATE', 'GST Certificate', 'GST_Registration_RI.pdf', 2, 'EXTRACTED', 'PASS', 98,
    [{ fieldName: 'GSTIN', extractedValue: '33AABCR3456E1ZR', confidence: 99 }, { fieldName: 'Legal Name', extractedValue: 'Reliable Instruments Pvt. Ltd.', confidence: 98 }, { fieldName: 'Status', extractedValue: 'ACTIVE', confidence: 99 }]),
  makeDoc('DOC-004-UDYAM', 'BID-DEMO-004', 'BIDDER-004', 'UDYAM_CERTIFICATE', 'Udyam Certificate', 'Udyam_RI.pdf', 1, 'EXTRACTED', 'PASS', 97, []),
  makeDoc('DOC-004-REG', 'BID-DEMO-004', 'BIDDER-004', 'COMPANY_REGISTRATION', 'Company Registration', 'CoI_RI.pdf', 3, 'EXTRACTED', 'PASS', 98, []),
  makeDoc('DOC-004-TURN', 'BID-DEMO-004', 'BIDDER-004', 'TURNOVER_CERTIFICATE', 'Turnover Certificate', 'Financials_RI.pdf', 6, 'EXTRACTED', 'FAIL', 96,
    [{ fieldName: 'FY 2024-25 Turnover', extractedValue: '₹8.2 Crore', confidence: 96 }, { fieldName: 'FY 2023-24 Turnover', extractedValue: '₹7.8 Crore', confidence: 95 }]),
  makeDoc('DOC-004-EXP', 'BID-DEMO-004', 'BIDDER-004', 'EXPERIENCE_CERTIFICATE', 'Experience Certificate', 'Experience_RI.pdf', 5, 'EXTRACTED', 'PASS', 95,
    [{ fieldName: 'Years of Experience', extractedValue: '11 years', confidence: 95 }]),
  makeDoc('DOC-004-OEM', 'BID-DEMO-004', 'BIDDER-004', 'OEM_AUTHORIZATION', 'OEM Authorization', 'OEM_Auth_ReliTemp.pdf', 1, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-004-TECH', 'BID-DEMO-004', 'BIDDER-004', 'TECHNICAL_COMPLIANCE', 'Technical Compliance Sheet', 'Tech_Compliance_RI.pdf', 5, 'EXTRACTED', 'PASS', 96, []),
  makeDoc('DOC-004-DATA', 'BID-DEMO-004', 'BIDDER-004', 'PRODUCT_DATASHEET', 'Product Datasheet', 'Datasheet_ReliTemp_350.pdf', 3, 'EXTRACTED', 'PASS', 97, []),
  makeDoc('DOC-004-WAR', 'BID-DEMO-004', 'BIDDER-004', 'WARRANTY_DECLARATION', 'Warranty Declaration', 'Warranty_RI.pdf', 1, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-004-DEL', 'BID-DEMO-004', 'BIDDER-004', 'DELIVERY_UNDERTAKING', 'Delivery Undertaking', 'Delivery_RI.pdf', 1, 'EXTRACTED', 'PASS', 99, []),
  makeDoc('DOC-004-MII', 'BID-DEMO-004', 'BIDDER-004', 'MII_DECLARATION', 'MII Declaration', 'MII_RI.pdf', 1, 'EXTRACTED', 'PASS', 98, []),
  makeDoc('DOC-004-MSE', 'BID-DEMO-004', 'BIDDER-004', 'MSE_CERTIFICATE', 'MSE Certificate', 'MSE_Certificate_RI.pdf', 1, 'EXTRACTED', 'PASS', 96, []),
];

export const documents: BidDocument[] = [
  ...bidder1Docs,
  ...bidder2Docs,
  ...bidder3Docs,
  ...bidder4Docs,
];

export const getDocumentsByBidder = (bidderId: string): BidDocument[] =>
  documents.filter((d) => d.bidderId === bidderId);

export const getDocumentById = (id: string): BidDocument | undefined =>
  documents.find((d) => d.id === id);

export const getDocumentsByBid = (bidId: string): BidDocument[] =>
  documents.filter((d) => d.bidId === bidId);
