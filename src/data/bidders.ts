import { Bidder } from '@/types';

// ============================================================
// Mock Bidder Data — Prototype Data
// All names, PANs, GSTINs are synthetic and for demonstration only.
// ============================================================

export const bidders: Bidder[] = [
  {
    id: 'BIDDER-001',
    legalName: 'ABC Engineering Pvt. Ltd.',
    shortName: 'ABC Engineering',
    pan: 'AABCA1234B',
    gstin: '07AABCA1234B1ZP',
    udyamNumber: 'UDYAM-DL-07-0012345',
    registrationNumber: 'U29100DL2010PTC123456',
    address: '42, Industrial Area Phase II, Okhla',
    state: 'Delhi',
    city: 'New Delhi',
    pincode: '110020',
    authorizedRepresentative: 'Rajesh Kumar Sharma',
    email: 'rajesh.sharma@abcengineering.demo',
    phone: '+91-11-26345678',
    incorporationYear: 2010,
    turnover: 220000000,
    turnoverFormatted: '₹22.0 Crore',
    employeeCount: 185,
    msmeCategory: 'Medium',
  },
  {
    id: 'BIDDER-002',
    legalName: 'Bharat Industrial Systems Ltd.',
    shortName: 'Bharat Industrial',
    pan: 'AABCB5678C',
    gstin: '29AABCB5678C1ZQ',
    udyamNumber: '',
    registrationNumber: 'U31900KA2015PLC098765',
    address: '18, Peenya Industrial Estate',
    state: 'Karnataka',
    city: 'Bengaluru',
    pincode: '560058',
    authorizedRepresentative: 'Anil Verma',
    email: 'anil.verma@bharatindustrial.demo',
    phone: '+91-80-28394756',
    incorporationYear: 2015,
    turnover: 155000000,
    turnoverFormatted: '₹15.5 Crore',
    employeeCount: 120,
    msmeCategory: null,
  },
  {
    id: 'BIDDER-003',
    legalName: 'National Process Equipments Pvt. Ltd.',
    shortName: 'National Process Equipments',
    pan: 'AABCN9012D',
    gstin: '27ABCDE1234F1Z5',
    udyamNumber: 'UDYAM-MH-27-0098765',
    registrationNumber: 'U28100MH2008PTC567890',
    address: '204, MIDC Industrial Area, Andheri East',
    state: 'Maharashtra',
    city: 'Mumbai',
    pincode: '400093',
    authorizedRepresentative: 'Priya Deshmukh',
    email: 'priya.deshmukh@nationalprocess.demo',
    phone: '+91-22-28574632',
    incorporationYear: 2008,
    turnover: 148000000,
    turnoverFormatted: '₹14.8 Crore',
    employeeCount: 95,
    msmeCategory: 'Small',
  },
  {
    id: 'BIDDER-004',
    legalName: 'Reliable Instruments Pvt. Ltd.',
    shortName: 'Reliable Instruments',
    pan: 'AABCR3456E',
    gstin: '33AABCR3456E1ZR',
    udyamNumber: 'UDYAM-TN-33-0054321',
    registrationNumber: 'U33100TN2012PTC234567',
    address: '156, SIDCO Industrial Estate, Ambattur',
    state: 'Tamil Nadu',
    city: 'Chennai',
    pincode: '600098',
    authorizedRepresentative: 'Suresh Rajan',
    email: 'suresh.rajan@reliableinstruments.demo',
    phone: '+91-44-26789012',
    incorporationYear: 2012,
    turnover: 82000000,
    turnoverFormatted: '₹8.2 Crore',
    employeeCount: 68,
    msmeCategory: 'Small',
  },
];

export const getBidderById = (id: string): Bidder | undefined =>
  bidders.find((b) => b.id === id);

export const getBiddersByIds = (ids: string[]): Bidder[] =>
  bidders.filter((b) => ids.includes(b.id));
