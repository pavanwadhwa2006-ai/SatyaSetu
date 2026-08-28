"use client";

import { use, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  FileText, Upload, CheckCircle2,
  ArrowLeft, Send, Loader2, Trash2,
  Lock, AlertTriangle, Download, Building2,
  Cpu, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  fetchBackendTenderById,
  createOrResumeBidSubmission,
  fetchBidSubmissionById,
  uploadBidDocument,
  deleteBidDocument,
  finalizeBidSubmission,
  processDocument,
  processSubmissionDocuments,
  StoredBidSubmission,
  StoredVendorDocument,
  DocumentFact,
  DocumentProcessResult,
} from "@/lib/api-client";
import { groundTruthBidders, groundTruthTenders } from "@/data/ground-truth";

const CANONICAL_DOC_TYPES = [
  { value: "TURNOVER_CERTIFICATE", label: "CA Audited Turnover Certificate" },
  { value: "MAF", label: "Manufacturer Authorization Form (MAF)" },
  { value: "PURCHASE_ORDER", label: "Past Work Order / Purchase Order" },
  { value: "CRAC_CERTIFICATE", label: "CRAC / Client Acceptance Certificate" },
  { value: "UDYAM_CERTIFICATE", label: "Udyam / MSME Registration Certificate" },
  { value: "DPIIT_RECOGNITION_CERT", label: "DPIIT Startup Recognition Certificate" },
  { value: "ELECTRICAL_LICENSE", label: "Class-A Electrical Contractor License" },
  { value: "GSTR3B_RETURN", label: "GSTR-3B Tax Filing Return" },
  { value: "MII_DECLARATION", label: "Make in India (MII) Local Content Declaration" },
  { value: "NOTARIZED_AFFIDAVIT", label: "Notarized Non-Blacklisting Affidavit" },
  { value: "BANK_SOLVENCY_CERT", label: "Bank Solvency Certificate" },
  { value: "TECHNICAL_PROPOSAL", label: "Technical Specifications & Delivery Proposal" },
  { value: "OTHER", label: "Other Supporting Document" },
];

export default function BidSubmissionWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const decodedTenderId = decodeURIComponent(id);

  const [tender, setTender] = useState<any>(null);
  const [submission, setSubmission] = useState<StoredBidSubmission | null>(null);
  const [selectedVendorCode, setSelectedVendorCode] = useState<string>("T2-B1");
  const [selectedDocType, setSelectedDocType] = useState<string>("TURNOVER_CERTIFICATE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Document Intelligence state
  const [extractedFactsByDoc, setExtractedFactsByDoc] = useState<Record<string, DocumentFact[]>>({});
  const [expandedDocFacts, setExpandedDocFacts] = useState<Record<string, boolean>>({});
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [batchProcessing, setBatchProcessing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load tender and active submission
  useEffect(() => {
    async function initWorkspace() {
      setLoading(true);
      setErrorMessage(null);

      try {
        // 1. Resolve tender details
        let tData = null;
        try {
          tData = await fetchBackendTenderById(decodedTenderId);
        } catch {
          tData = groundTruthTenders.find(
            (t) => t.id === decodedTenderId || t.bidNumber === decodedTenderId
          );
        }
        setTender(tData);

        // 2. Resolve or load existing submission
        const existingSubId = searchParams.get("submission_id");
        if (existingSubId) {
          const subData = await fetchBidSubmissionById(existingSubId);
          setSubmission(subData);
        } else {
          // Find matching default vendor for this tender
          const matchedBidder = groundTruthBidders.find(
            (b) => b.tenderId === decodedTenderId || (tData && (b.tenderId === tData.id || b.tenderId === tData.tender_number))
          ) || groundTruthBidders[1]; // default Vanguard

          setSelectedVendorCode(matchedBidder.bidderCode);
          const newSub = await createOrResumeBidSubmission(
            tData?.tender_number || tData?.id || decodedTenderId,
            matchedBidder.legalName
          );
          setSubmission(newSub);
        }
      } catch (err: any) {
        console.error("Workspace initialization error:", err);
        setErrorMessage(err.message || "Could not initialize submission workspace.");
      } finally {
        setLoading(false);
      }
    }

    initWorkspace();
  }, [decodedTenderId, searchParams]);

  // Handle vendor switch
  const handleVendorSwitch = async (vendorName: string, code: string) => {
    setSelectedVendorCode(code);
    setLoading(true);
    setErrorMessage(null);
    try {
      const tenderRef = tender?.tender_number || tender?.id || decodedTenderId;
      const sub = await createOrResumeBidSubmission(tenderRef, vendorName);
      setSubmission(sub);
      router.replace(`/bidder/tenders/${encodeURIComponent(decodedTenderId)}/bid?submission_id=${sub.id}`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to switch vendor identity");
    } finally {
      setLoading(false);
    }
  };

  // Handle document upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !submission) return;

    if (submission.status !== "DRAFT") {
      setErrorMessage("Cannot upload files to a finalized/submitted bid.");
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const uploadedDoc = await uploadBidDocument(submission.id, selectedFile, selectedDocType);
      
      // Trigger automatic Document Intelligence extraction on upload
      try {
        const procResult = await processDocument(uploadedDoc.id);
        setExtractedFactsByDoc((prev) => ({ ...prev, [uploadedDoc.id]: procResult.facts }));
        setExpandedDocFacts((prev) => ({ ...prev, [uploadedDoc.id]: true }));
      } catch (procErr) {
        console.warn("Auto document intelligence note:", procErr);
      }

      // Refresh submission
      const refreshed = await fetchBidSubmissionById(submission.id);
      setSubmission(refreshed);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSuccessMessage(`Uploaded and processed '${uploadedDoc.original_filename}'.`);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  // Process a single document
  const handleProcessSingleDocument = async (docId: string) => {
    setProcessingDocId(docId);
    setErrorMessage(null);
    try {
      const res = await processDocument(docId);
      setExtractedFactsByDoc((prev) => ({ ...prev, [docId]: res.facts }));
      setExpandedDocFacts((prev) => ({ ...prev, [docId]: true }));
      setSuccessMessage(`Extracted ${res.extracted_facts_count} facts from '${res.original_filename}'.`);
      // Refresh submission to update badge
      if (submission) {
        const refreshed = await fetchBidSubmissionById(submission.id);
        setSubmission(refreshed);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Document Intelligence extraction failed.");
    } finally {
      setProcessingDocId(null);
    }
  };

  // Process all documents in submission
  const handleBatchProcessDocuments = async () => {
    if (!submission) return;
    setBatchProcessing(true);
    setErrorMessage(null);
    try {
      const res = await processSubmissionDocuments(submission.id);
      const newFactsMap: Record<string, DocumentFact[]> = {};
      const newExpandedMap: Record<string, boolean> = {};
      res.documents.forEach((d) => {
        newFactsMap[d.document_id] = d.facts;
        newExpandedMap[d.document_id] = true;
      });
      setExtractedFactsByDoc((prev) => ({ ...prev, ...newFactsMap }));
      setExpandedDocFacts((prev) => ({ ...prev, ...newExpandedMap }));
      setSuccessMessage(`Extracted ${res.total_facts_count} facts across ${res.documents_processed_count} documents.`);
      // Refresh submission
      const refreshed = await fetchBidSubmissionById(submission.id);
      setSubmission(refreshed);
    } catch (err: any) {
      setErrorMessage(err.message || "Batch document processing failed.");
    } finally {
      setBatchProcessing(false);
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (docId: string) => {
    if (!submission || submission.status !== "DRAFT") return;
    if (!confirm("Are you sure you want to remove this uploaded document?")) return;

    try {
      await deleteBidDocument(submission.id, docId);
      const refreshed = await fetchBidSubmissionById(submission.id);
      setSubmission(refreshed);
      setSuccessMessage("Document removed.");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete document.");
    }
  };

  // Handle finalize / submit
  const handleFinalizeSubmission = async () => {
    if (!submission) return;
    if (submission.documents.length === 0) {
      setErrorMessage("Please upload at least one required document before submitting your bid.");
      return;
    }

    if (!confirm("Are you sure you want to finalize and submit this bid? Once submitted, no further changes can be made.")) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await finalizeBidSubmission(submission.id);
      const refreshed = await fetchBidSubmissionById(submission.id);
      setSubmission(refreshed);
      setSuccessMessage(res.message || "Bid submitted successfully!");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to finalize bid submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Initializing Bid Submission Workspace...</p>
      </div>
    );
  }

  const isSubmitted = submission?.status === "SUBMITTED";

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <Link href="/bidder" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/bidder/tenders" className="text-muted-foreground hover:text-foreground">Tenders</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/bidder/tenders/${encodeURIComponent(decodedTenderId)}`} className="text-muted-foreground hover:text-foreground">
          {tender?.tender_number || tender?.bidNumber || decodedTenderId}
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">Bid Workspace</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white border rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {tender?.tender_number || tender?.bidNumber || decodedTenderId}
            </span>
            {isSubmitted ? (
              <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs">
                <Lock className="w-3 h-3" /> SUBMITTED &amp; LOCKED
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-300 gap-1 text-xs">
                <FileText className="w-3 h-3" /> DRAFT IN PROGRESS
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">
              {submission?.documents.length || 0} Documents Uploaded
            </span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
            {tender?.title}
          </h1>
          <p className="text-xs text-muted-foreground">
            Buyer: {tender?.organization || tender?.buyer} · Category: {tender?.category}
          </p>
        </div>

        {/* Action Button */}
        {!isSubmitted ? (
          <Button
            onClick={handleFinalizeSubmission}
            disabled={submitting || (submission?.documents.length || 0) === 0}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-medium shrink-0"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Finalize &amp; Submit Bid
          </Button>
        ) : (
          <div className="text-right">
            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Submitted for GeM Evaluation
            </div>
            {submission?.submitted_at && (
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {new Date(submission.submitted_at).toLocaleString("en-IN")}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-3 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm p-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Bidder Identity Selection */}
      <Card>
        <CardHeader className="py-3 px-4 sm:px-5 border-b bg-slate-50/50">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-slate-800">
            <Building2 className="w-4 h-4 text-[#1e3a5f]" />
            Bidding Entity / Vendor Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <div className="space-y-2">
            <Label className="text-xs text-slate-600 font-medium">
              Select Bidder Organization Profile (Phase 4 Synthetic Benchmark Bidders):
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {groundTruthBidders.map((b) => (
                <button
                  key={b.bidderCode}
                  disabled={isSubmitted}
                  onClick={() => handleVendorSwitch(b.legalName, b.bidderCode)}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    selectedVendorCode === b.bidderCode
                      ? "border-[#1e3a5f] bg-[#1e3a5f]/5 ring-1 ring-[#1e3a5f]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  } ${isSubmitted ? "opacity-75 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="font-semibold text-slate-900 truncate">{b.legalName}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Code: <span className="font-mono">{b.bidderCode}</span> · {b.businessType}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Document Uploader */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader className="py-3 px-4 border-b bg-slate-50/50">
              <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-slate-800">
                <Upload className="w-4 h-4 text-[#1e3a5f]" />
                Upload Bidder Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5">
              {isSubmitted ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-600">
                  <Lock className="w-5 h-5 mx-auto text-slate-400 mb-1" />
                  This bid has been submitted. Document uploads are locked.
                </div>
              ) : (
                <form onSubmit={handleFileUpload} className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-slate-700">Document Type Tag</Label>
                    <select
                      value={selectedDocType}
                      onChange={(e) => setSelectedDocType(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs border rounded-md bg-white focus:outline-hidden focus:ring-1 focus:ring-[#1e3a5f]"
                    >
                      {CANONICAL_DOC_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-slate-700">Select PDF File (Max 25MB)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full mt-1 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer border rounded-md p-1"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className="w-full bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs gap-1.5 py-2"
                  >
                    {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? "Uploading & Storing..." : "Upload Document"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Uploaded Documents List with Document Intelligence facts */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="py-3 px-4 sm:px-5 border-b bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-2 text-slate-800">
                <FileText className="w-4 h-4 text-[#1e3a5f]" />
                Uploaded Documents ({submission?.documents.length || 0})
              </CardTitle>
              {submission && submission.documents.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={batchProcessing}
                  onClick={handleBatchProcessDocuments}
                  className="text-xs gap-1.5 h-7 border-blue-200 text-blue-800 bg-blue-50/60 hover:bg-blue-100"
                >
                  {batchProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-blue-600" />}
                  Run Document Intelligence
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {(!submission?.documents || submission.documents.length === 0) ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs text-slate-600 font-medium">No documents uploaded yet</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Upload CA certificates, purchase orders, MAF, and statutory affidavits on the left.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {submission.documents.map((doc: StoredVendorDocument) => {
                    const docFacts = extractedFactsByDoc[doc.id] || [];
                    const isExpanded = expandedDocFacts[doc.id] ?? (docFacts.length > 0);
                    const isDocProcessing = processingDocId === doc.id;

                    return (
                      <div
                        key={doc.id}
                        className="rounded-lg border border-slate-200 bg-white overflow-hidden shadow-2xs"
                      >
                        <div className="p-3 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                              <span className="text-xs font-semibold text-slate-900 truncate">
                                {doc.original_filename}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                              {doc.document_type && (
                                <span className="bg-blue-50 text-blue-700 border border-blue-200 font-mono px-1.5 py-0.2 rounded text-[10px]">
                                  {doc.document_type}
                                </span>
                              )}
                              <span>
                                {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : "PDF"}
                              </span>
                              <span>·</span>
                              <Badge
                                variant="outline"
                                className={`text-[10px] ${
                                  doc.processing_status === "PROCESSED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {doc.processing_status === "PROCESSED" ? "Intelligence Processed" : "Uploaded"}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isDocProcessing}
                              onClick={() => handleProcessSingleDocument(doc.id)}
                              className="text-[11px] h-7 px-2 text-blue-700 hover:bg-blue-50 gap-1"
                              title="Run Phase 7 Document Intelligence"
                            >
                              {isDocProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cpu className="w-3 h-3" />}
                              Extract Facts
                            </Button>
                            {doc.download_url && (
                              <a
                                href={doc.download_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                              >
                                <Download className="w-3 h-3" /> Download
                              </a>
                            )}
                            {!isSubmitted && (
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                                title="Delete document"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => setExpandedDocFacts((prev) => ({ ...prev, [doc.id]: !isExpanded }))}
                              className="text-slate-500 hover:text-slate-800 p-1 rounded"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Extracted Facts Section */}
                        {isExpanded && (
                          <div className="p-3 border-t bg-white space-y-2 text-xs">
                            <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium border-b pb-1">
                              <span>Structured Facts Extracted ({docFacts.length})</span>
                              <span>Method: Phase 7 Deterministic Parser</span>
                            </div>
                            {docFacts.length === 0 ? (
                              <div className="text-[11px] text-slate-500 py-2 text-center">
                                Click &quot;Extract Facts&quot; above to run Document Intelligence on this document.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {docFacts.map((fact) => (
                                  <div
                                    key={fact.id}
                                    className="p-2.5 rounded-md border border-slate-100 bg-slate-50/50 space-y-1.5"
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                                      <span className="font-mono font-semibold text-slate-800 text-[11px]">
                                        {fact.field_name}
                                      </span>
                                      <div className="flex items-center gap-2 text-[10px]">
                                        <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
                                          Page {fact.source_page}
                                        </span>
                                        <span className="text-emerald-700 font-medium">
                                          {(fact.confidence * 100).toFixed(0)}% Conf
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-slate-900 font-medium text-xs">
                                      {fact.value}{" "}
                                      {fact.normalized_value !== undefined && (
                                        <span className="text-[11px] text-muted-foreground font-normal">
                                          (Normalized: <code>{JSON.stringify(fact.normalized_value)}</code>)
                                        </span>
                                      )}
                                    </div>
                                    {fact.raw_quote && (
                                      <div className="text-[11px] text-slate-600 italic bg-white p-1.5 rounded border border-slate-200/60">
                                        &ldquo;{fact.raw_quote}&rdquo;
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
