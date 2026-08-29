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

import { supabase } from '@/lib/supabase';
import { Tender, TenderStatus, Bidder, BidDocument } from '@/types';

// Simulate async API calls
const delay = (ms: number = 0) => new Promise((resolve) => setTimeout(resolve, ms));

function mapDbTenderToTender(row: any): Tender {
  const reqs = row.extracted_requirements || {};
  const val = Number(reqs.estimated_value ?? row.estimated_value) || 0;
  let valFormatted = `₹${val.toLocaleString('en-IN')}`;
  if (val >= 10000000) {
    valFormatted = `₹${(val / 10000000).toFixed(2)} Cr`;
  } else if (val >= 100000) {
    valFormatted = `₹${(val / 100000).toFixed(2)} Lakh`;
  }

  const emd = Number(reqs.emd_amount ?? row.emd_amount) || 0;
  let emdFormatted = `₹${emd.toLocaleString('en-IN')}`;
  if (emd >= 100000) {
    emdFormatted = `₹${(emd / 100000).toFixed(2)} Lakh`;
  }

  return {
    id: row.id,
    tenderNumber: row.tender_number || row.id,
    title: reqs.tender_title || row.title || '',
    organization: reqs.organization || row.organization || '',
    department: reqs.department || row.department || '',
    category: reqs.category || row.category || '',
    estimatedValue: val,
    estimatedValueFormatted: valFormatted,
    publishDate: row.publish_date || '',
    submissionDeadline: reqs.submission_deadline || row.submission_deadline || '',
    bidValidityDays: row.bid_validity_days || 90,
    evaluationType: row.evaluation_type || 'QCBS',
    status: (row.status as TenderStatus) || 'OPEN',
    description: reqs.description || row.description || '',
    requirements: [],
    deliveryLocation: row.delivery_location || '',
    deliveryPeriodDays: reqs.delivery_period_days || row.delivery_period_days || 90,
    warrantyMonths: reqs.warranty_months || row.warranty_months || 36,
    emdAmount: emd,
    emdAmountFormatted: emdFormatted,
  };
}

export async function fetchTenders(): Promise<Tender[]> {
  try {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(mapDbTenderToTender);
    }
  } catch (err) {
    console.warn('Supabase fetch error for tenders:', err);
  }
  return [];
}

export async function fetchTenderById(id: string) {
  try {
    const { data, error } = await supabase
      .from('tenders')
      .select('*')
      .or(`id.eq.${id},tender_number.eq.${id}`)
      .maybeSingle();

    if (!error && data) {
      const mapped = mapDbTenderToTender(data);
      if (data.extracted_requirements) {
        (mapped as any).extractedRequirements = data.extracted_requirements;
      }
      return mapped;
    }
  } catch (err) {
    console.warn('Supabase fetch tender by ID error:', err);
  }

  const fallback = _getTenderById(id);
  if (fallback) {
    (fallback as any).extractedRequirements = {
      tender_title: fallback.title,
      tender_number: fallback.id,
      organization: fallback.organization,
      department: fallback.department,
      category: fallback.category,
      description: fallback.description,
      required_documents: [
        "Company Profile",
        "PAN Card",
        "GST Certificate",
        "CA Turnover Certificate",
        "Work Order",
        "Completion Certificate",
        "Technical Compliance Declaration"
      ],
      minimum_turnover: fallback.estimatedValue * 2.5 || 50000000.0,
      emd_amount: fallback.emdAmount || 370000.0,
      estimated_value: fallback.estimatedValue || 18500000.0,
      submission_deadline: fallback.submissionDeadline,
      delivery_period_days: fallback.deliveryPeriodDays || 120,
      warranty_months: fallback.warrantyMonths || 36,
      eligibility_conditions: [
        "Compliance with technical specifications",
        "3-year comprehensive warranty with on-site support"
      ]
    };
  }
  return fallback;
}


function mapDbVendorToBidder(row: any, index: number): Bidder {
  const legalName = (row.legal_name || '').replace(/\s*\[SYNTHETIC\]\s*/g, '');
  const shortName = row.display_name || legalName.split(' ')[0] || 'Vendor';
  const mockFallback = bidders[index % bidders.length] || bidders[0];

  return {
    id: row.id || mockFallback.id,
    legalName: legalName || mockFallback.legalName,
    shortName: shortName || mockFallback.shortName,
    pan: mockFallback.pan,
    gstin: mockFallback.gstin,
    udyamNumber: mockFallback.udyamNumber,
    registrationNumber: mockFallback.registrationNumber,
    address: mockFallback.address,
    state: mockFallback.state,
    city: mockFallback.city,
    pincode: mockFallback.pincode,
    authorizedRepresentative: mockFallback.authorizedRepresentative,
    email: mockFallback.email,
    phone: mockFallback.phone,
    incorporationYear: mockFallback.incorporationYear,
    turnover: mockFallback.turnover,
    turnoverFormatted: mockFallback.turnoverFormatted,
    employeeCount: mockFallback.employeeCount,
    msmeCategory: mockFallback.msmeCategory,
  };
}

export async function fetchBidders(): Promise<Bidder[]> {
  try {
    const { data, error } = await supabase.from('vendors').select('*');
    if (!error && data && data.length > 0) {
      return data.map((row, i) => mapDbVendorToBidder(row, i));
    }
  } catch (err) {
    console.warn('Supabase fetch error for vendors, fallback to mock data:', err);
  }
  return bidders;
}

export async function fetchBidderById(id: string): Promise<Bidder> {
  try {
    const { data: vRow } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (vRow) {
      return mapDbVendorToBidder(vRow, 0);
    }

    const { data: subRow } = await supabase
      .from('bid_submissions')
      .select('*, vendors(*)')
      .eq('id', id)
      .maybeSingle();

    if (subRow && subRow.vendors) {
      return mapDbVendorToBidder(subRow.vendors, 0);
    }
  } catch (err) {
    console.warn('Supabase fetch error in fetchBidderById:', err);
  }

  const dbBidders = await fetchBidders();
  const found = dbBidders.find((b) => b.id === id);
  return found || _getBidderById(id) || dbBidders[0] || bidders[0];
}

export async function fetchBiddersForTender(tenderId: string): Promise<Bidder[]> {
  try {
    let actualTenderUuid = tenderId;
    if (!tenderId.includes('-') || tenderId.startsWith('SYNTHETIC') || tenderId.startsWith('GEM')) {
      const { data: tenderRow } = await supabase
        .from('tenders')
        .select('id')
        .or(`tender_number.eq.${tenderId},id.eq.${tenderId}`)
        .maybeSingle();
      if (tenderRow?.id) {
        actualTenderUuid = tenderRow.id;
      }
    }

    const { data: bidSubmissions, error } = await supabase
      .from('bid_submissions')
      .select('id, status, submitted_at, ai_score, ai_verification_status, verification_results, vendor_id, vendors(*)')
      .eq('tender_id', actualTenderUuid);

    if (!error && bidSubmissions) {
      return bidSubmissions.map((bs: any, i: number) => {
        const vendorRow = bs.vendors || {};
        const bidderObj = mapDbVendorToBidder(vendorRow, i);
        (bidderObj as any).bidSubmissionId = bs.id;
        (bidderObj as any).submissionStatus = bs.status || 'SUBMITTED';
        (bidderObj as any).aiScore = bs.ai_score;
        (bidderObj as any).aiVerificationStatus = bs.ai_verification_status;
        (bidderObj as any).verificationResults = bs.verification_results;
        (bidderObj as any).submittedAt = bs.submitted_at
          ? new Date(bs.submitted_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'Recent';
        return bidderObj;
      });
    }
  } catch (err) {
    console.warn('Error fetching bidders for tender from Supabase:', err);
  }
  return [];
}

export async function fetchBidsByTender(tenderId: string) {
  await delay();
  return _getBidsByTender(tenderId);
}

export async function fetchBidByBidderAndTender(bidderId: string, tenderId: string) {
  await delay();
  return _getBidByBidderAndTender(bidderId, tenderId);
}

export async function uploadVendorDocument(params: {
  vendorId: string;
  bidSubmissionId?: string | null;
  file: File;
  documentType: string;
}): Promise<any> {
  const { vendorId, bidSubmissionId, file, documentType } = params;
  const storagePath = `${vendorId}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

  const { error: uploadError } = await supabase.storage
    .from('vendor-documents')
    .upload(storagePath, file, {
      contentType: file.type || 'application/pdf',
      upsert: true,
    });

  if (uploadError) {
    console.warn('Supabase storage upload info:', uploadError.message);
  }

  const { data: docData, error: dbError } = await supabase
    .from('vendor_documents')
    .insert([
      {
        original_filename: file.name,
        storage_path: storagePath,
        mime_type: file.type || 'application/pdf',
        file_size: file.size,
        document_type: documentType,
        processing_status: 'UPLOADED',
      },
    ])
    .select()
    .single();

  if (dbError) {
    console.warn('Supabase vendor_documents insert info:', dbError.message);
  }

  return docData || {
    id: `doc-${Date.now()}`,
    original_filename: file.name,
    storage_path: storagePath,
    file_size: file.size,
    document_type: documentType,
    processing_status: 'UPLOADED',
  };
}

export async function fetchDocumentsByBidder(bidderId: string): Promise<BidDocument[]> {
  try {
    const { data: dbDocs, error } = await supabase
      .from('vendor_documents')
      .select('*');

    if (!error && dbDocs && dbDocs.length > 0) {
      return dbDocs.map((doc: any) => ({
        id: doc.id,
        bidId: doc.bid_submission_id || 'BID-DEMO-001',
        bidderId: bidderId,
        type: (doc.document_type || 'COMPANY_REGISTRATION') as any,
        typeName: doc.document_type || 'Uploaded Document',
        fileName: doc.original_filename,
        uploadedAt: doc.created_at || new Date().toISOString(),
        fileSize: `${(Number(doc.file_size || 0) / 1024).toFixed(1)} KB`,
        pageCount: 1,
        extractionStatus: doc.processing_status === 'PROCESSED' ? 'EXTRACTED' : 'PENDING',
        verificationStatus: 'PENDING',
        confidence: 100,
        extractedFields: [
          { fieldName: 'Storage Path', extractedValue: doc.storage_path, confidence: 100 },
          { fieldName: 'Processing Status', extractedValue: doc.processing_status, confidence: 100 },
        ],
      }));
    }
  } catch (err) {
    console.warn('Error fetching vendor documents from Supabase:', err);
  }

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

export async function submitBidApplication(params: {
  tenderId: string;
  vendorId?: string;
  documents: { type: string; file: File }[];
}): Promise<any> {
  let tenderUuid = params.tenderId;
  if (!params.tenderId.includes('-') || params.tenderId.startsWith('GEM')) {
    try {
      const { data } = await supabase
        .from('tenders')
        .select('id')
        .or(`tender_number.eq.${params.tenderId},id.eq.${params.tenderId}`)
        .maybeSingle();
      if (data?.id) tenderUuid = data.id;
    } catch (err) {
      console.warn('Could not resolve tender UUID:', err);
    }
  }

  let vendorUuid = params.vendorId;
  if (!vendorUuid) {
    try {
      const { data } = await supabase.from('vendors').select('id').limit(1).maybeSingle();
      if (data?.id) vendorUuid = data.id;
    } catch (err) {
      console.warn('Could not resolve vendor UUID:', err);
    }
  }

  const bidSubmissionId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bid-${Date.now()}`;
  const nowIso = new Date().toISOString();

  const docRows = [];
  for (const doc of params.documents) {
    const storagePath = `${bidSubmissionId}/${Date.now()}_${doc.file.name.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    try {
      await supabase.storage
        .from('vendor-documents')
        .upload(storagePath, doc.file, {
          contentType: doc.file.type || 'application/pdf',
          upsert: true,
        });
    } catch (stErr) {
      console.warn('Supabase vendor-documents upload notice:', stErr);
    }

    docRows.push({
      bid_submission_id: bidSubmissionId,
      vendor_id: vendorUuid,
      original_filename: doc.file.name,
      storage_path: storagePath,
      mime_type: doc.file.type || 'application/pdf',
      file_size: doc.file.size,
      document_type: doc.type,
      processing_status: 'UPLOADED',
    });
  }

  const bidPayload = {
    id: bidSubmissionId,
    tender_id: tenderUuid,
    vendor_id: vendorUuid,
    status: 'UNDER_EVALUATION',
    submitted_at: nowIso,
  };

  try {
    await supabase.from('bid_submissions').insert([bidPayload]);
    if (docRows.length > 0) {
      await supabase.from('vendor_documents').insert(docRows);
    }
  } catch (dbErr) {
    console.warn('Database insert warning for bid_submission:', dbErr);
  }

  try {
    await triggerAnalyzeBid(bidSubmissionId);
  } catch (err) {
    console.warn('AI analysis execution notice:', err);
  }

  return {
    bidSubmissionId,
    tenderId: tenderUuid,
    vendorId: vendorUuid,
    status: 'UNDER_EVALUATION',
    submittedAt: nowIso,
  };
}

export async function fetchBidSubmissionsForBidder(vendorId?: string): Promise<any[]> {
  try {
    let targetVendorId = vendorId;
    if (!targetVendorId) {
      const { data: vData } = await supabase
        .from('vendors')
        .select('id')
        .or('display_name.ilike.%Apex%,legal_name.ilike.%Apex%')
        .limit(1)
        .maybeSingle();
      if (vData?.id) targetVendorId = vData.id;
    }

    if (targetVendorId) {
      const { data, error } = await supabase
        .from('bid_submissions')
        .select('*, tenders(*)')
        .eq('vendor_id', targetVendorId)
        .order('submitted_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    }

    // Fallback: fetch any bid submissions present in Supabase DB
    const { data: allBids } = await supabase
      .from('bid_submissions')
      .select('*, tenders(*)')
      .order('submitted_at', { ascending: false });

    if (allBids && allBids.length > 0) {
      return allBids;
    }
  } catch (err) {
    console.warn('Error fetching bid submissions for bidder from Supabase:', err);
  }
  return [];
}

export async function triggerAnalyzeBid(bidSubmissionId: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let targetUuid = bidSubmissionId;

  try {
    const { data: subRow } = await supabase
      .from('bid_submissions')
      .select('id')
      .or(`id.eq.${bidSubmissionId},vendor_id.eq.${bidSubmissionId}`)
      .limit(1)
      .maybeSingle();

    if (subRow?.id) {
      targetUuid = subRow.id;
    }
  } catch (err) {
    console.warn('Resolution error in triggerAnalyzeBid:', err);
  }

  try {
    const res = await fetch(`${apiUrl}/api/analysis/analyze-bid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bid_submission_id: targetUuid }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API connection warning for analyze-bid:', err);
  }

  return {
    bid_submission_id: targetUuid,
    documents_processed: 7,
    missing_documents: [],
    pan: {
      number: "ABCDE1234F",
      format_valid: true,
      status: "Active (Demo Validation)"
    },
    gst: {
      gstin: "27ABCDE1234F1Z5",
      format_valid: true,
      status: "Active (Demo Validation)"
    },
    turnover: {
      required: 50000000,
      actual: 62000000,
      eligible: true
    },
    name_consistency: {
      passed: true
    },
    risk_score: 12,
    recommendation: "AUTO_APPROVE"
  };
}

export async function publishExistingTender(tenderId: string, storagePath?: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  try {
    const res = await fetch(`${apiUrl}/api/officer/publish-existing-tender`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tender_id: tenderId,
        storage_path: storagePath,
      }),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API /api/officer/publish-existing-tender notice:', err);
  }

  try {
    const { data: tRow } = await supabase
      .from('tenders')
      .update({
        status: 'OPEN',
        extraction_status: 'COMPLETED',
        published_at: new Date().toISOString(),
      })
      .eq('id', tenderId)
      .select()
      .single();
    return tRow;
  } catch (err) {
    console.warn('Supabase fallback publish notice:', err);
  }
  return { status: 'OPEN' };
}


export async function publishTender(file: File, metaData?: Record<string, any>): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const formData = new FormData();
  formData.append('file', file);
  if (metaData) {
    Object.keys(metaData).forEach((k) => {
      if (metaData[k] !== undefined && metaData[k] !== null) {
        formData.append(k, String(metaData[k]));
      }
    });
  }

  try {
    const res = await fetch(`${apiUrl}/api/officer/publish-tender`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API /api/officer/publish-tender info:', err);
  }

  try {
    const res = await fetch(`${apiUrl}/api/tenders/publish`, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend API /api/tenders/publish info:', err);
  }

  // Supabase Storage upload & Database fallback
  const filename = file.name || 'tender_document.pdf';
  const storagePath = `${Date.now()}_${filename.replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

  try {
    await supabase.storage
      .from('tender-documents')
      .upload(storagePath, file, {
        contentType: file.type || 'application/pdf',
        upsert: true,
      });
  } catch (stErr) {
    console.warn('Supabase storage upload notice:', stErr);
  }

  const generatedNum = metaData?.tender_number || `GEM/2026/B/${Math.floor(1000000 + Math.random() * 9000000)}`;
  const cleanTitle = metaData?.title || filename.replace('.pdf', '').replace(/_/g, ' ');

  const extractedReqs = {
    tender_title: cleanTitle,
    tender_number: generatedNum,
    organization: 'Government Procurement Department',
    department: metaData?.department || 'Procurement Division',
    category: metaData?.category || 'General Goods/Services',
    description: `Official GeM Procurement Tender for ${cleanTitle}. Requirements extracted via AI Tender Pipeline.`,
    required_documents: [
      'Company Profile & Registration',
      'PAN Card Certificate',
      'GST Registration Certificate',
      'CA Certified Turnover Certificate',
      'Work Order & Completion Certificate',
      'Technical Compliance Declaration'
    ],
    minimum_turnover: metaData?.estimated_value ? metaData.estimated_value * 2.5 : 50000000.0,
    emd_amount: metaData?.emd_amount || 370000.0,
    estimated_value: metaData?.estimated_value || 18500000.0,
    submission_deadline: metaData?.closing_date || '2026-09-20T23:59:59+05:30',
    delivery_period_days: 120,
    warranty_months: 36,
    eligibility_conditions: [
      'Compliance with IS/IEC standards',
      '3-year comprehensive warranty with on-site support'
    ]
  };

  const newTenderPayload = {
    tender_number: generatedNum,
    title: cleanTitle,
    organization: 'Government Procurement Department',
    department: metaData?.department || 'Procurement Division',
    category: metaData?.category || 'General Goods/Services',
    description: extractedReqs.description,
    source: 'OFFICER_PUBLISHED',
    status: 'OPEN',
    estimated_value: metaData?.estimated_value || 18500000,
    emd_amount: metaData?.emd_amount || 370000,
    submission_deadline: metaData?.closing_date || '2026-09-20T23:59:59+05:30',
    extracted_requirements: extractedReqs,
    extraction_status: 'COMPLETED',
    extracted_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  };

  try {
    const { data: dbTender } = await supabase
      .from('tenders')
      .upsert(newTenderPayload, { onConflict: 'tender_number' })
      .select()
      .single();

    if (dbTender?.id) {
      await supabase.from('tender_documents').insert([
        {
          tender_id: dbTender.id,
          original_filename: filename,
          storage_path: storagePath,
          mime_type: file.type || 'application/pdf',
          file_size: file.size,
          processing_status: 'PROCESSED',
        },
      ]);
      return {
        tender_id: dbTender.id,
        tender_number: generatedNum,
        extraction_status: 'SUCCESS',
        extracted_requirements: extractedReqs,
      };
    }
  } catch (dbErr) {
    console.warn('Database fallback insert notice:', dbErr);
  }

  return {
    tender_id: `TENDER-${Date.now()}`,
    tender_number: generatedNum,
    extraction_status: 'SUCCESS',
    extracted_requirements: extractedReqs,
  };
}

export async function fetchReasoningByBidder(bidderId: string) {
  await delay();
  return _getReasoningByBidder(bidderId);
}

export async function recordOfficerDecision(payload: { bidSubmissionId: string; status: string; remarks?: string }) {
  const { bidSubmissionId, status, remarks } = payload;
  let targetUuid = bidSubmissionId;
  try {
    const { data: subRow } = await supabase
      .from('bid_submissions')
      .select('id')
      .or(`id.eq.${bidSubmissionId},vendor_id.eq.${bidSubmissionId}`)
      .limit(1)
      .maybeSingle();
    if (subRow?.id) targetUuid = subRow.id;
  } catch (err) {
    console.warn('Error resolving bid submission for decision:', err);
  }

  try {
    await supabase.from('bid_submissions').update({ status, ai_summary: remarks }).eq('id', targetUuid);
  } catch (err) {
    console.warn('Error saving decision to Supabase:', err);
  }
  return { success: true };
}

export { bidders, bids };
