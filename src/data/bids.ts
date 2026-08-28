import { Bid } from '@/types';
import { bidders } from './bidders';

// ============================================================
// Mock Bid Data — Prototype Data
// ============================================================

export const bids: Bid[] = [
  {
    id: 'BID-DEMO-001',
    tenderId: 'GEM/2026/B/7903799',
    bidderId: 'BIDDER-001',
    bidder: bidders[0],
    status: 'UNDER_EVALUATION',
    submittedAt: '2026-09-14T09:31:00+05:30',
    commercial: {
      quotedAmount: 15400000,
      quotedAmountFormatted: '₹1.54 Crore',
      taxPercentage: 18,
      taxAmount: 2772000,
      totalAmount: 16200000,
      totalAmountFormatted: '₹1.62 Crore',
    },
    technical: {
      productModel: 'ThermoTrack Pro X500',
      specifications: 'Industrial RTD sensors, -200°C to +850°C, ±0.1°C accuracy, IP67 rated, 4-20mA output with HART protocol, RS485 Modbus',
      deliveryPeriodDays: 90,
      warrantyMonths: 36,
      experienceYears: 14,
      experienceDetails: 'Supplied and installed industrial monitoring systems for NTPC, BHEL, IOCL, and SAIL across 45+ projects since 2012.',
      miiPercentage: 72,
    },
    documentIds: [
      'DOC-001-PAN', 'DOC-001-GST', 'DOC-001-UDYAM', 'DOC-001-REG',
      'DOC-001-TURN', 'DOC-001-EXP', 'DOC-001-OEM', 'DOC-001-TECH',
      'DOC-001-DATA', 'DOC-001-WAR', 'DOC-001-DEL', 'DOC-001-MII',
    ],
  },
  {
    id: 'BID-DEMO-002',
    tenderId: 'GEM/2026/B/7903799',
    bidderId: 'BIDDER-002',
    bidder: bidders[1],
    status: 'UNDER_EVALUATION',
    submittedAt: '2026-09-15T14:22:00+05:30',
    commercial: {
      quotedAmount: 14600000,
      quotedAmountFormatted: '₹1.46 Crore',
      taxPercentage: 18,
      taxAmount: 2628000,
      totalAmount: 15400000,
      totalAmountFormatted: '₹1.54 Crore',
    },
    technical: {
      productModel: 'InduTemp Monitor 400',
      specifications: 'Thermocouple based, -50°C to +1200°C, ±0.5°C accuracy, IP65, 4-20mA analog output',
      deliveryPeriodDays: 110,
      warrantyMonths: 36,
      experienceYears: 8,
      experienceDetails: 'Supplied monitoring equipment to various state government departments and public sector undertakings.',
      miiPercentage: 55,
    },
    documentIds: [
      'DOC-002-PAN', 'DOC-002-GST', 'DOC-002-REG',
      'DOC-002-TURN', 'DOC-002-EXP', 'DOC-002-TECH',
      'DOC-002-DATA', 'DOC-002-WAR', 'DOC-002-DEL', 'DOC-002-MII',
      // Note: Missing OEM Authorization — intentional for demo
    ],
  },
  {
    id: 'BID-DEMO-003',
    tenderId: 'GEM/2026/B/7903799',
    bidderId: 'BIDDER-003',
    bidder: bidders[2],
    status: 'UNDER_EVALUATION',
    submittedAt: '2026-09-16T11:05:00+05:30',
    commercial: {
      quotedAmount: 14100000,
      quotedAmountFormatted: '₹1.41 Crore',
      taxPercentage: 18,
      taxAmount: 2538000,
      totalAmount: 14900000,
      totalAmountFormatted: '₹1.49 Crore',
    },
    technical: {
      productModel: 'ProcessTemp Elite 600',
      specifications: 'RTD + Thermocouple dual-mode, -200°C to +1000°C, ±0.15°C accuracy, IP67, Modbus RTU/TCP, HART 7',
      deliveryPeriodDays: 100,
      warrantyMonths: 36,
      experienceYears: 16,
      experienceDetails: 'Supplied process monitoring systems to ONGC, GAIL, HPCL, and multiple pharmaceutical companies. 60+ successful installations.',
      miiPercentage: 68,
    },
    documentIds: [
      'DOC-003-PAN', 'DOC-003-GST', 'DOC-003-UDYAM', 'DOC-003-REG',
      'DOC-003-TURN', 'DOC-003-EXP', 'DOC-003-OEM', 'DOC-003-TECH',
      'DOC-003-DATA', 'DOC-003-WAR', 'DOC-003-DEL', 'DOC-003-MII',
      'DOC-003-MSE',
    ],
  },
  {
    id: 'BID-DEMO-004',
    tenderId: 'GEM/2026/B/7903799',
    bidderId: 'BIDDER-004',
    bidder: bidders[3],
    status: 'UNDER_EVALUATION',
    submittedAt: '2026-09-17T16:48:00+05:30',
    commercial: {
      quotedAmount: 15900000,
      quotedAmountFormatted: '₹1.59 Crore',
      taxPercentage: 18,
      taxAmount: 2862000,
      totalAmount: 16800000,
      totalAmountFormatted: '₹1.68 Crore',
    },
    technical: {
      productModel: 'ReliTemp Industrial 350',
      specifications: 'RTD sensors, -100°C to +600°C, ±0.2°C accuracy, IP66, 4-20mA, RS485',
      deliveryPeriodDays: 95,
      warrantyMonths: 36,
      experienceYears: 11,
      experienceDetails: 'Supplied temperature monitoring equipment to various industrial and government clients in Tamil Nadu and Andhra Pradesh.',
      miiPercentage: 78,
    },
    documentIds: [
      'DOC-004-PAN', 'DOC-004-GST', 'DOC-004-UDYAM', 'DOC-004-REG',
      'DOC-004-TURN', 'DOC-004-EXP', 'DOC-004-OEM', 'DOC-004-TECH',
      'DOC-004-DATA', 'DOC-004-WAR', 'DOC-004-DEL', 'DOC-004-MII',
      'DOC-004-MSE',
    ],
  },
];

export const getBidsByTender = (tenderId: string): Bid[] =>
  bids.filter((b) => b.tenderId === tenderId);

export const getBidById = (id: string): Bid | undefined =>
  bids.find((b) => b.id === id);

export const getBidByBidderAndTender = (bidderId: string, tenderId: string): Bid | undefined =>
  bids.find((b) => b.bidderId === bidderId && b.tenderId === tenderId);
