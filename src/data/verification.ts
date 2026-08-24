import { VerificationRecord } from '@/types';

// ============================================================
// Mock Verification Data — Prototype Verification Sources
// IMPORTANT: These are mock/prototype verification sources.
// They do NOT represent live Government API integrations.
// ============================================================

export const verificationRecords: VerificationRecord[] = [
  // --- Bidder A: ABC Engineering ---
  {
    id: 'VER-GST-001',
    bidderId: 'BIDDER-001',
    verificationType: 'GST',
    verificationSource: 'Prototype GST Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'GSTIN': '07AABCA1234B1ZP',
      'Legal Name': 'ABC Engineering Pvt. Ltd.',
      'State': 'Delhi',
    },
    verificationData: {
      'GSTIN': '07AABCA1234B1ZP',
      'Legal Name': 'ABC Engineering Pvt. Ltd.',
      'Status': 'ACTIVE',
      'Registration Date': '15-Jul-2017',
      'State': 'Delhi',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-14T09:34:00+05:30',
  },
  {
    id: 'VER-PAN-001',
    bidderId: 'BIDDER-001',
    verificationType: 'PAN',
    verificationSource: 'Prototype PAN Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'PAN': 'AABCA1234B',
      'Name': 'ABC Engineering Pvt. Ltd.',
    },
    verificationData: {
      'PAN': 'AABCA1234B',
      'Name': 'ABC Engineering Pvt. Ltd.',
      'Status': 'ACTIVE',
      'Category': 'Company',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-14T09:34:05+05:30',
  },

  // --- Bidder B: Bharat Industrial ---
  {
    id: 'VER-GST-002',
    bidderId: 'BIDDER-002',
    verificationType: 'GST',
    verificationSource: 'Prototype GST Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'GSTIN': '29AABCB5678C1ZQ',
      'Legal Name': 'Bharat Industrial Systems Ltd.',
    },
    verificationData: {
      'GSTIN': '29AABCB5678C1ZQ',
      'Legal Name': 'Bharat Industrial Systems Ltd.',
      'Status': 'ACTIVE',
      'Registration Date': '01-Mar-2018',
      'State': 'Karnataka',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-15T14:34:00+05:30',
  },
  {
    id: 'VER-PAN-002',
    bidderId: 'BIDDER-002',
    verificationType: 'PAN',
    verificationSource: 'Prototype PAN Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'PAN': 'AABCB5678C',
      'Name': 'Bharat Industrial Systems Ltd.',
    },
    verificationData: {
      'PAN': 'AABCB5678C',
      'Name': 'Bharat Industrial Systems Ltd.',
      'Status': 'ACTIVE',
      'Category': 'Company',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-15T14:34:05+05:30',
  },

  // --- Bidder C: National Process Equipments (GST Mismatch) ---
  {
    id: 'VER-GST-003',
    bidderId: 'BIDDER-003',
    verificationType: 'GST',
    verificationSource: 'Prototype GST Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'GSTIN': '27ABCDE1234F1Z5',
      'Legal Name': 'National Process Equipments Pvt Ltd',
    },
    verificationData: {
      'GSTIN': '27ABCDE1234F1Z5',
      'Legal Name': 'National Process Equipment Ltd',
      'Status': 'ACTIVE',
      'Registration Date': '22-Nov-2017',
      'State': 'Maharashtra',
    },
    status: 'REVIEW',
    discrepancies: [
      'Legal name mismatch: Certificate shows "National Process Equipments Pvt Ltd" but verification record shows "National Process Equipment Ltd"',
    ],
    verifiedAt: '2026-09-16T11:34:00+05:30',
  },
  {
    id: 'VER-PAN-003',
    bidderId: 'BIDDER-003',
    verificationType: 'PAN',
    verificationSource: 'Prototype PAN Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'PAN': 'AABCN9012D',
      'Name': 'National Process Equipments Pvt. Ltd.',
    },
    verificationData: {
      'PAN': 'AABCN9012D',
      'Name': 'National Process Equipments Pvt. Ltd.',
      'Status': 'ACTIVE',
      'Category': 'Company',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-16T11:34:05+05:30',
  },
  {
    id: 'VER-UDYAM-003',
    bidderId: 'BIDDER-003',
    verificationType: 'UDYAM',
    verificationSource: 'Prototype Udyam Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'Udyam Number': 'UDYAM-MH-27-0098765',
      'Enterprise Name': 'National Process Equipments Pvt. Ltd.',
    },
    verificationData: {
      'Udyam Number': 'UDYAM-MH-27-0098765',
      'Enterprise Name': 'National Process Equipments Pvt. Ltd.',
      'Category': 'Small',
      'Type': 'Manufacturing',
      'Status': 'ACTIVE',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-16T11:34:10+05:30',
  },

  // --- Bidder D: Reliable Instruments ---
  {
    id: 'VER-GST-004',
    bidderId: 'BIDDER-004',
    verificationType: 'GST',
    verificationSource: 'Prototype GST Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'GSTIN': '33AABCR3456E1ZR',
      'Legal Name': 'Reliable Instruments Pvt. Ltd.',
    },
    verificationData: {
      'GSTIN': '33AABCR3456E1ZR',
      'Legal Name': 'Reliable Instruments Pvt. Ltd.',
      'Status': 'ACTIVE',
      'Registration Date': '10-Sep-2018',
      'State': 'Tamil Nadu',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-17T16:54:00+05:30',
  },
  {
    id: 'VER-PAN-004',
    bidderId: 'BIDDER-004',
    verificationType: 'PAN',
    verificationSource: 'Prototype PAN Verification Service',
    sourceLabel: 'Mock Government Verification',
    submittedData: {
      'PAN': 'AABCR3456E',
      'Name': 'Reliable Instruments Pvt. Ltd.',
    },
    verificationData: {
      'PAN': 'AABCR3456E',
      'Name': 'Reliable Instruments Pvt. Ltd.',
      'Status': 'ACTIVE',
      'Category': 'Company',
    },
    status: 'PASS',
    discrepancies: [],
    verifiedAt: '2026-09-17T16:54:05+05:30',
  },
];

export const getVerificationsByBidder = (bidderId: string): VerificationRecord[] =>
  verificationRecords.filter((v) => v.bidderId === bidderId);

export const getVerificationById = (id: string): VerificationRecord | undefined =>
  verificationRecords.find((v) => v.id === id);
