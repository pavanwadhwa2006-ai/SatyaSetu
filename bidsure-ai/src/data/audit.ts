import { AuditEvent } from '@/types';

// ============================================================
// Mock Audit Trail Data — Prototype Data
// ============================================================

export const auditEvents: Record<string, AuditEvent[]> = {
  // Bidder C: National Process Equipments — the showcase audit trail
  'BIDDER-003': [
    { id: 'AUD-001', timestamp: '2026-09-16T09:31:00+05:30', timeFormatted: '09:31 AM', eventType: 'BID_SUBMITTED', description: 'Bid submitted by National Process Equipments Pvt. Ltd.', actor: 'Bidder', details: 'Bid ID: BID-DEMO-003' },
    { id: 'AUD-002', timestamp: '2026-09-16T09:32:00+05:30', timeFormatted: '09:32 AM', eventType: 'DOCUMENTS_UPLOADED', description: '13 documents uploaded successfully', actor: 'System', details: 'PAN, GST, Udyam, CoI, Turnover, Experience, OEM, Technical, Datasheet, Warranty, Delivery, MII, MSE' },
    { id: 'AUD-003', timestamp: '2026-09-16T09:33:00+05:30', timeFormatted: '09:33 AM', eventType: 'EXTRACTION_COMPLETED', description: 'Document AI extraction completed for all 13 documents', actor: 'Document Intelligence', details: 'Average extraction confidence: 96.8%' },
    { id: 'AUD-004', timestamp: '2026-09-16T09:34:00+05:30', timeFormatted: '09:34 AM', eventType: 'VERIFICATION_COMPLETED', description: 'Prototype GST verification completed', actor: 'Verification Engine', details: 'Source: Prototype GST Verification Service' },
    { id: 'AUD-005', timestamp: '2026-09-16T09:34:15+05:30', timeFormatted: '09:34 AM', eventType: 'MISMATCH_DETECTED', description: 'GST legal name mismatch detected', actor: 'Cross-Verification Engine', details: 'Certificate: "National Process Equipments Pvt Ltd" vs Verification: "National Process Equipment Ltd"' },
    { id: 'AUD-006', timestamp: '2026-09-16T09:35:00+05:30', timeFormatted: '09:35 AM', eventType: 'COMPLIANCE_ANALYZED', description: 'AI Compliance Analysis completed — Score: 84/100', actor: 'AI Compliance Engine', details: '11 PASS, 0 FAIL, 2 REVIEW' },
    { id: 'AUD-007', timestamp: '2026-09-16T09:36:00+05:30', timeFormatted: '09:36 AM', eventType: 'RECOMMENDATION_GENERATED', description: 'AI recommendation generated: REVIEW BEFORE FINAL DECISION', actor: 'AI Recommendation Engine', details: 'GST identity mismatch requires officer verification' },
    { id: 'AUD-008', timestamp: '2026-09-16T09:38:00+05:30', timeFormatted: '09:38 AM', eventType: 'OFFICER_REVIEWED', description: 'Procurement Officer reviewed compliance evidence', actor: 'Officer: Ananya Mehta', details: 'Reviewed GST verification details and mismatch evidence' },
    { id: 'AUD-009', timestamp: '2026-09-16T09:41:00+05:30', timeFormatted: '09:41 AM', eventType: 'DECISION_RECORDED', description: 'Final decision recorded by Procurement Officer', actor: 'Officer: Ananya Mehta', details: null },
  ],
  'BIDDER-001': [
    { id: 'AUD-A-001', timestamp: '2026-09-14T09:31:00+05:30', timeFormatted: '09:31 AM', eventType: 'BID_SUBMITTED', description: 'Bid submitted by ABC Engineering Pvt. Ltd.', actor: 'Bidder', details: 'Bid ID: BID-DEMO-001' },
    { id: 'AUD-A-002', timestamp: '2026-09-14T09:32:00+05:30', timeFormatted: '09:32 AM', eventType: 'DOCUMENTS_UPLOADED', description: '12 documents uploaded successfully', actor: 'System', details: null },
    { id: 'AUD-A-003', timestamp: '2026-09-14T09:33:00+05:30', timeFormatted: '09:33 AM', eventType: 'EXTRACTION_COMPLETED', description: 'Document AI extraction completed', actor: 'Document Intelligence', details: 'Average confidence: 97.5%' },
    { id: 'AUD-A-004', timestamp: '2026-09-14T09:34:00+05:30', timeFormatted: '09:34 AM', eventType: 'VERIFICATION_COMPLETED', description: 'All prototype verifications passed', actor: 'Verification Engine', details: null },
    { id: 'AUD-A-005', timestamp: '2026-09-14T09:35:00+05:30', timeFormatted: '09:35 AM', eventType: 'COMPLIANCE_ANALYZED', description: 'AI Compliance Analysis completed — Score: 96/100', actor: 'AI Compliance Engine', details: '13 PASS, 0 FAIL, 0 REVIEW' },
    { id: 'AUD-A-006', timestamp: '2026-09-14T09:36:00+05:30', timeFormatted: '09:36 AM', eventType: 'RECOMMENDATION_GENERATED', description: 'AI recommendation: QUALIFY', actor: 'AI Recommendation Engine', details: null },
  ],
  'BIDDER-002': [
    { id: 'AUD-B-001', timestamp: '2026-09-15T14:22:00+05:30', timeFormatted: '02:22 PM', eventType: 'BID_SUBMITTED', description: 'Bid submitted by Bharat Industrial Systems Ltd.', actor: 'Bidder', details: 'Bid ID: BID-DEMO-002' },
    { id: 'AUD-B-002', timestamp: '2026-09-15T14:23:00+05:30', timeFormatted: '02:23 PM', eventType: 'DOCUMENTS_UPLOADED', description: '10 documents uploaded', actor: 'System', details: 'Note: OEM Authorization Certificate not uploaded' },
    { id: 'AUD-B-003', timestamp: '2026-09-15T14:24:00+05:30', timeFormatted: '02:24 PM', eventType: 'EXTRACTION_COMPLETED', description: 'Document AI extraction completed', actor: 'Document Intelligence', details: null },
    { id: 'AUD-B-004', timestamp: '2026-09-15T14:25:00+05:30', timeFormatted: '02:25 PM', eventType: 'VERIFICATION_COMPLETED', description: 'Prototype verifications completed', actor: 'Verification Engine', details: null },
    { id: 'AUD-B-005', timestamp: '2026-09-15T14:26:00+05:30', timeFormatted: '02:26 PM', eventType: 'COMPLIANCE_ANALYZED', description: 'AI Compliance Analysis completed — Score: 72/100', actor: 'AI Compliance Engine', details: '9 PASS, 3 FAIL, 1 REVIEW' },
    { id: 'AUD-B-006', timestamp: '2026-09-15T14:27:00+05:30', timeFormatted: '02:27 PM', eventType: 'RECOMMENDATION_GENERATED', description: 'AI recommendation: DISQUALIFY', actor: 'AI Recommendation Engine', details: 'Missing mandatory OEM Authorization' },
  ],
  'BIDDER-004': [
    { id: 'AUD-D-001', timestamp: '2026-09-17T16:48:00+05:30', timeFormatted: '04:48 PM', eventType: 'BID_SUBMITTED', description: 'Bid submitted by Reliable Instruments Pvt. Ltd.', actor: 'Bidder', details: 'Bid ID: BID-DEMO-004' },
    { id: 'AUD-D-002', timestamp: '2026-09-17T16:49:00+05:30', timeFormatted: '04:49 PM', eventType: 'DOCUMENTS_UPLOADED', description: '13 documents uploaded successfully', actor: 'System', details: null },
    { id: 'AUD-D-003', timestamp: '2026-09-17T16:50:00+05:30', timeFormatted: '04:50 PM', eventType: 'EXTRACTION_COMPLETED', description: 'Document AI extraction completed', actor: 'Document Intelligence', details: null },
    { id: 'AUD-D-004', timestamp: '2026-09-17T16:51:00+05:30', timeFormatted: '04:51 PM', eventType: 'VERIFICATION_COMPLETED', description: 'Prototype verifications completed', actor: 'Verification Engine', details: null },
    { id: 'AUD-D-005', timestamp: '2026-09-17T16:52:00+05:30', timeFormatted: '04:52 PM', eventType: 'COMPLIANCE_ANALYZED', description: 'AI Compliance Analysis completed — Score: 78/100', actor: 'AI Compliance Engine', details: '11 PASS, 1 FAIL, 1 REVIEW' },
    { id: 'AUD-D-006', timestamp: '2026-09-17T16:53:00+05:30', timeFormatted: '04:53 PM', eventType: 'RECOMMENDATION_GENERATED', description: 'AI recommendation: DISQUALIFY', actor: 'AI Recommendation Engine', details: 'Turnover below minimum threshold' },
  ],
};

export const getAuditByBidder = (bidderId: string): AuditEvent[] =>
  auditEvents[bidderId] || [];
