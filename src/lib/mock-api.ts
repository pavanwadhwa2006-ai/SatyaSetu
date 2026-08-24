// ============================================================
// Mock API Layer — Structured for Future Backend Replacement
// Currently returns local mock data.
// Replace these functions with actual API calls when integrating
// with FastAPI + Supabase backend.
// ============================================================

import { tenders, getTenderById as _getTenderById } from '@/data/tenders';
import { bidders, getBidderById as _getBidderById } from '@/data/bidders';
import { bids, getBidsByTender as _getBidsByTender, getBidByBidderAndTender as _getBidByBidderAndTender } from '@/data/bids';
import { getDocumentsByBidder as _getDocumentsByBidder } from '@/data/documents';
import { getComplianceByBidder as _getComplianceByBidder, getComplianceByTender as _getComplianceByTender } from '@/data/compliance';
import { getVerificationsByBidder as _getVerificationsByBidder } from '@/data/verification';
import { getAuditByBidder as _getAuditByBidder } from '@/data/audit';
import { getRiskByBidder as _getRiskByBidder, getRecommendationByBidder as _getRecommendationByBidder, getReasoningByBidder as _getReasoningByBidder } from '@/data/risk-and-recommendations';

// Simulate async API calls
const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchTenders() {
  await delay();
  return tenders;
}

export async function fetchTenderById(id: string) {
  await delay();
  return _getTenderById(id);
}

export async function fetchBidderById(id: string) {
  await delay();
  return _getBidderById(id);
}

export async function fetchBidsByTender(tenderId: string) {
  await delay();
  return _getBidsByTender(tenderId);
}

export async function fetchBidByBidderAndTender(bidderId: string, tenderId: string) {
  await delay();
  return _getBidByBidderAndTender(bidderId, tenderId);
}

export async function fetchDocumentsByBidder(bidderId: string) {
  await delay();
  return _getDocumentsByBidder(bidderId);
}

export async function fetchComplianceByBidder(bidderId: string) {
  await delay();
  return _getComplianceByBidder(bidderId);
}

export async function fetchComplianceByTender(tenderId: string) {
  await delay();
  return _getComplianceByTender(tenderId);
}

export async function fetchVerificationsByBidder(bidderId: string) {
  await delay();
  return _getVerificationsByBidder(bidderId);
}

export async function fetchAuditByBidder(bidderId: string) {
  await delay();
  return _getAuditByBidder(bidderId);
}

export async function fetchRiskByBidder(bidderId: string) {
  await delay();
  return _getRiskByBidder(bidderId);
}

export async function fetchRecommendationByBidder(bidderId: string) {
  await delay();
  return _getRecommendationByBidder(bidderId);
}

export async function fetchReasoningByBidder(bidderId: string) {
  await delay();
  return _getReasoningByBidder(bidderId);
}

export { bidders, bids };
