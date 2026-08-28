import { RiskAssessment, AIRecommendation, VerificationReasoning } from '@/types';

// ============================================================
// Mock Risk Assessment Data — Prototype Data
// ============================================================

export const riskAssessments: RiskAssessment[] = [
  {
    bidderId: 'BIDDER-001',
    bidId: 'BID-DEMO-001',
    riskLevel: 'LOW',
    riskScore: 8,
    maxScore: 100,
    flags: [
      { id: 'RF-A-01', description: 'All mandatory documents submitted', severity: 'LOW', category: 'Documentation', relatedRequirement: null, relatedDocument: null },
      { id: 'RF-A-02', description: 'All verification checks passed', severity: 'LOW', category: 'Verification', relatedRequirement: null, relatedDocument: null },
    ],
    recommendedAction: 'Proceed with qualification. No significant risk factors identified.',
  },
  {
    bidderId: 'BIDDER-002',
    bidId: 'BID-DEMO-002',
    riskLevel: 'HIGH',
    riskScore: 72,
    maxScore: 100,
    flags: [
      { id: 'RF-B-01', description: 'Missing mandatory OEM Authorization Certificate', severity: 'HIGH', category: 'Documentation', relatedRequirement: 'REQ-007', relatedDocument: null },
      { id: 'RF-B-02', description: 'Technical specification does not meet accuracy requirement', severity: 'HIGH', category: 'Technical', relatedRequirement: 'REQ-008', relatedDocument: 'Tech_Compliance_Bharat.pdf' },
      { id: 'RF-B-03', description: 'Delivery timeline close to maximum allowable period', severity: 'LOW', category: 'Delivery', relatedRequirement: 'REQ-010', relatedDocument: 'Delivery_Bharat.pdf' },
    ],
    recommendedAction: 'Recommend disqualification. Missing mandatory OEM authorization and technical non-compliance detected.',
  },
  {
    bidderId: 'BIDDER-003',
    bidId: 'BID-DEMO-003',
    riskLevel: 'MEDIUM',
    riskScore: 34,
    maxScore: 100,
    flags: [
      { id: 'RF-C-01', description: 'GST legal name mismatch between submitted certificate and prototype verification record', severity: 'MEDIUM', category: 'Identity Verification', relatedRequirement: 'REQ-002', relatedDocument: 'GST_Registration_NPE.pdf' },
      { id: 'RF-C-02', description: 'No missing mandatory documents', severity: 'LOW', category: 'Documentation', relatedRequirement: null, relatedDocument: null },
      { id: 'RF-C-03', description: 'Turnover requirement satisfied', severity: 'LOW', category: 'Financial', relatedRequirement: 'REQ-005', relatedDocument: null },
      { id: 'RF-C-04', description: 'Experience requirement satisfied', severity: 'LOW', category: 'Technical', relatedRequirement: 'REQ-006', relatedDocument: null },
    ],
    recommendedAction: 'Review GST identity mismatch before final qualification. All other requirements satisfied.',
  },
  {
    bidderId: 'BIDDER-004',
    bidId: 'BID-DEMO-004',
    riskLevel: 'HIGH',
    riskScore: 58,
    maxScore: 100,
    flags: [
      { id: 'RF-D-01', description: 'Annual turnover ₹8.2 Crore is below the minimum ₹10 Crore threshold', severity: 'HIGH', category: 'Financial', relatedRequirement: 'REQ-005', relatedDocument: 'Financials_RI.pdf' },
      { id: 'RF-D-02', description: 'Temperature range narrower than tender requirement', severity: 'MEDIUM', category: 'Technical', relatedRequirement: 'REQ-008', relatedDocument: 'Tech_Compliance_RI.pdf' },
      { id: 'RF-D-03', description: 'All mandatory documents submitted', severity: 'LOW', category: 'Documentation', relatedRequirement: null, relatedDocument: null },
    ],
    recommendedAction: 'Recommend disqualification. Turnover below mandatory threshold. Technical specification concerns require review.',
  },
];

export const getRiskByBidder = (bidderId: string): RiskAssessment | undefined =>
  riskAssessments.find((r) => r.bidderId === bidderId);

// ============================================================
// Mock AI Recommendations — Prototype Data
// ============================================================

const DISCLAIMER = 'AI recommendation is advisory only. Final qualification or disqualification decision remains with the Procurement Officer as per applicable government procurement rules and regulations.';

export const aiRecommendations: AIRecommendation[] = [
  {
    bidderId: 'BIDDER-001',
    bidId: 'BID-DEMO-001',
    tenderId: 'GEM/2026/B/7903799',
    recommendation: 'QUALIFY',
    recommendationLabel: 'Recommend Qualification',
    reasonSummary: [
      'All 13 mandatory and preferential requirements satisfied',
      'All documents submitted and verified',
      'Turnover ₹22.0 Crore exceeds ₹10 Crore threshold',
      '14 years of relevant experience with 45+ completed projects',
      'Valid OEM Authorization from ThermoTrack Industries',
      'Technical specifications meet or exceed all tender requirements',
      'All prototype verifications passed without discrepancies',
    ],
    evidenceReferences: [
      { document: 'PAN_Certificate_ABC.pdf', page: 1, detail: 'PAN verified' },
      { document: 'GST_Registration_ABC.pdf', page: 1, detail: 'GST active, name matched' },
      { document: 'Audited_Financials_ABC.pdf', page: 2, detail: 'Turnover ₹22.0 Cr' },
      { document: 'OEM_Auth_ThermoTrack.pdf', page: 1, detail: 'Valid till Mar 2027' },
    ],
    disclaimer: DISCLAIMER,
    generatedAt: '2026-09-14T09:36:00+05:30',
  },
  {
    bidderId: 'BIDDER-002',
    bidId: 'BID-DEMO-002',
    tenderId: 'GEM/2026/B/7903799',
    recommendation: 'DISQUALIFY',
    recommendationLabel: 'Recommend Disqualification',
    reasonSummary: [
      'Missing mandatory OEM Authorization Certificate — document not submitted',
      'Technical accuracy specification (±0.5°C) does not meet tender requirement (±0.15°C)',
      'Two mandatory requirement failures detected',
      'Financial threshold satisfied (₹15.5 Crore)',
      'Relevant experience (8 years) meets minimum requirement',
    ],
    evidenceReferences: [
      { document: 'Tech_Compliance_Bharat.pdf', page: 2, detail: 'Accuracy: ±0.5°C vs required ±0.15°C' },
    ],
    disclaimer: DISCLAIMER,
    generatedAt: '2026-09-15T14:27:00+05:30',
  },
  {
    bidderId: 'BIDDER-003',
    bidId: 'BID-DEMO-003',
    tenderId: 'GEM/2026/B/7903799',
    recommendation: 'REVIEW_BEFORE_DECISION',
    recommendationLabel: 'Review Before Final Decision',
    reasonSummary: [
      'All mandatory documents submitted and extracted',
      'Technical requirements satisfied — specifications meet tender requirements',
      'Financial threshold satisfied — ₹14.8 Crore exceeds ₹10 Crore minimum',
      'GST identity mismatch requires officer verification: Certificate shows "National Process Equipments Pvt Ltd" vs prototype verification shows "National Process Equipment Ltd"',
      'Mismatch could indicate name variation, data entry error, or identity concern',
    ],
    evidenceReferences: [
      { document: 'GST_Registration_NPE.pdf', page: 1, detail: 'Legal name: "National Process Equipments Pvt Ltd"' },
      { document: 'Prototype Verification Record', page: 0, detail: 'VER-GST-003: Legal name: "National Process Equipment Ltd"' },
      { document: 'Financials_NPE.pdf', page: 2, detail: 'Turnover ₹14.8 Cr' },
      { document: 'OEM_Auth_ProcessTemp.pdf', page: 1, detail: 'Valid till Jun 2027' },
    ],
    disclaimer: DISCLAIMER,
    generatedAt: '2026-09-16T09:36:00+05:30',
  },
  {
    bidderId: 'BIDDER-004',
    bidId: 'BID-DEMO-004',
    tenderId: 'GEM/2026/B/7903799',
    recommendation: 'DISQUALIFY',
    recommendationLabel: 'Recommend Disqualification',
    reasonSummary: [
      'Annual turnover ₹8.2 Crore is below the mandatory minimum of ₹10 Crore',
      'Temperature range (-100°C to +600°C) is narrower than tender specification (-200°C to +850°C)',
      'All mandatory documents submitted',
      'Relevant experience (11 years) meets minimum requirement',
      'Financial non-compliance is a mandatory disqualification criterion',
    ],
    evidenceReferences: [
      { document: 'Financials_RI.pdf', page: 3, detail: 'Turnover ₹8.2 Cr (required ≥ ₹10 Cr)' },
      { document: 'Tech_Compliance_RI.pdf', page: 3, detail: 'Range: -100°C to +600°C' },
    ],
    disclaimer: DISCLAIMER,
    generatedAt: '2026-09-17T16:53:00+05:30',
  },
];

export const getRecommendationByBidder = (bidderId: string): AIRecommendation | undefined =>
  aiRecommendations.find((r) => r.bidderId === bidderId);

// ============================================================
// Mock Verification Reasoning — Prototype Data
// ============================================================

export const verificationReasonings: Record<string, VerificationReasoning[]> = {
  'BIDDER-003': [
    {
      requirementId: 'REQ-005',
      requirementText: 'Bidder must maintain minimum average annual turnover of ₹10 Crore in last 3 financial years.',
      evidenceDocument: 'Financials_NPE.pdf',
      evidencePage: 2,
      extractedValue: '₹14.8 Crore (FY 2024-25), ₹13.2 Crore (FY 2023-24)',
      rule: 'Average Turnover ≥ ₹10 Crore',
      result: 'PASS',
      confidence: 96,
      reasoning: 'Extracted average annual turnover of ₹14.0 Crore exceeds the minimum threshold of ₹10 Crore.',
    },
    {
      requirementId: 'REQ-002',
      requirementText: 'Bidder must have active GST registration. Legal name must match across documents.',
      evidenceDocument: 'GST_Registration_NPE.pdf',
      evidencePage: 1,
      extractedValue: 'Legal Name: "National Process Equipments Pvt Ltd"',
      rule: 'GSTIN must be active AND legal name must match verification record',
      result: 'REVIEW',
      confidence: 92,
      reasoning: 'GSTIN is active. However, a legal name discrepancy was detected. The submitted certificate shows "National Process Equipments Pvt Ltd" while the prototype verification record shows "National Process Equipment Ltd". This may be a data entry variation or require officer clarification.',
    },
    {
      requirementId: 'REQ-007',
      requirementText: 'Valid OEM Authorization Certificate is mandatory for the offered product.',
      evidenceDocument: 'OEM_Auth_ProcessTemp.pdf',
      evidencePage: 1,
      extractedValue: 'ProcessTemp Industries — Authorized Dealer — Valid till 30 Jun 2027',
      rule: 'OEM Authorization must be valid and match offered product',
      result: 'PASS',
      confidence: 99,
      reasoning: 'Valid OEM authorization from ProcessTemp Industries found. Authorization covers the offered product (ProcessTemp Elite 600) and is valid until June 2027.',
    },
    {
      requirementId: 'REQ-006',
      requirementText: 'Minimum 5 years of experience in supply of industrial monitoring equipment.',
      evidenceDocument: 'Experience_NPE.pdf',
      evidencePage: 4,
      extractedValue: '16 years of experience, 60+ successful installations',
      rule: 'Experience ≥ 5 years in relevant domain',
      result: 'PASS',
      confidence: 95,
      reasoning: 'Bidder demonstrates 16 years of relevant experience with 60+ successful installations for clients including ONGC, GAIL, HPCL, and pharmaceutical companies.',
    },
  ],
  'BIDDER-002': [
    {
      requirementId: 'REQ-007',
      requirementText: 'Valid OEM Authorization Certificate is mandatory for the offered product.',
      evidenceDocument: null,
      evidencePage: null,
      extractedValue: null,
      rule: 'OEM Authorization Certificate must be submitted',
      result: 'FAIL',
      confidence: 100,
      reasoning: 'No OEM Authorization document was found in the submitted bid documents. This is a mandatory requirement and its absence results in automatic non-compliance.',
    },
    {
      requirementId: 'REQ-008',
      requirementText: 'Technical specifications must meet or exceed tender requirements.',
      evidenceDocument: 'Tech_Compliance_Bharat.pdf',
      evidencePage: 2,
      extractedValue: 'Accuracy: ±0.5°C',
      rule: 'Accuracy must be ≤ ±0.15°C',
      result: 'FAIL',
      confidence: 92,
      reasoning: 'The offered product accuracy of ±0.5°C does not meet the tender specification of ±0.15°C. This represents a significant technical non-compliance.',
    },
  ],
};

export const getReasoningByBidder = (bidderId: string): VerificationReasoning[] =>
  verificationReasonings[bidderId] || [];
