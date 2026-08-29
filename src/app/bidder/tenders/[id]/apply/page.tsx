"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchTenderById, submitBidApplication } from "@/lib/mock-api";
import { getDynamicTenderRequirements, DynamicRequirement } from "@/lib/tender-requirements";
import { useAuth } from "@/contexts/auth-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles,
  Loader2, Trash2, ShieldCheck, ArrowRight, FileCheck, Building2,
  Info, HelpCircle, Key, FileType
} from "lucide-react";

export default function BidderApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { linkedVendor } = useAuth();
  const [tender, setTender] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload state map: requirementId -> File
  const [filesMap, setFilesMap] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [activeTooltipId, setActiveTooltipId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchTenderById(id).then((data) => {
      if (isMounted) {
        setTender(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [id]);

  const dynamicRequirements: DynamicRequirement[] = getDynamicTenderRequirements(tender);

  const handleFileSelect = (reqId: string, selectedFile: File) => {
    if (!selectedFile.type.includes("pdf") && !selectedFile.name.toLowerCase().endsWith(".pdf")) {
      setError(`Only PDF documents are accepted for submission.`);
      return;
    }
    setError(null);
    setFilesMap((prev) => ({ ...prev, [reqId]: selectedFile }));
  };

  const handleRemoveFile = (reqId: string) => {
    setFilesMap((prev) => {
      const next = { ...prev };
      delete next[reqId];
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent, reqId: string) => {
    e.preventDefault();
    setDragActive(reqId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };

  const handleDrop = (e: React.DragEvent, reqId: string) => {
    e.preventDefault();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(reqId, e.dataTransfer.files[0]);
    }
  };

  const handleAutoFillDemoFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const newMap: Record<string, File> = { ...filesMap };
      for (const req of dynamicRequirements) {
        const cleanName = req.acceptedAliases[0] || `${req.title.replace(/[^a-zA-Z0-9]/g, '_')}_Certified.pdf`;
        const dummyBlob = new Blob([
          `%PDF-1.4\nSatyaSetu AI Procurement Document for ${req.title}\n` +
          `Bidder: ${linkedVendor?.display_name || 'Apex Creative Solutions'}\n` +
          `Expected Document: ${req.expectedDocument}\n` +
          `Verification Keywords: ${req.verificationKeywords.join(', ')}\n` +
          `Official Certified Compliance Document.`
        ], { type: "application/pdf" });
        const file = new File([dummyBlob], cleanName, { type: "application/pdf" });
        newMap[req.id] = file;
      }
      setFilesMap(newMap);
    } catch (err) {
      console.warn("Could not autofill demo files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    const missingMandatory = dynamicRequirements.filter((req) => req.mandatory && !filesMap[req.id]);
    if (missingMandatory.length > 0) {
      setError(`Please upload all mandatory documents (${missingMandatory.map((m) => m.title).join(", ")}) before submitting.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      setUploadProgress("Uploading requirement documents to Supabase Storage bucket 'vendor-documents'...");
      await new Promise((r) => setTimeout(r, 600));

      const docArray = dynamicRequirements
        .filter((req) => filesMap[req.id])
        .map((req) => ({
          requirementId: req.id,
          requirementTitle: req.title,
          type: req.title,
          file: filesMap[req.id],
        }));

      setUploadProgress("Creating bid_submission & vendor_documents records in Supabase...");
      const result = await submitBidApplication({
        tenderId: tender?.id || id,
        vendorId: linkedVendor?.id,
        documents: docArray,
      });

      setUploadProgress("Executing Gemini OCR entity extraction & Rule Engine verification...");
      await new Promise((r) => setTimeout(r, 800));

      const bidId = result.bidSubmissionId || "BID-DEMO-001";
      router.push(`/bidder/bids/${bidId}/success`);
    } catch (err: any) {
      setError(err?.message || "An error occurred while submitting your application.");
      setSubmitting(false);
      setUploadProgress("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <span className="text-sm">Loading Tender Details & Dynamic Requirements...</span>
      </div>
    );
  }

  const uploadedCount = dynamicRequirements.filter((req) => Boolean(filesMap[req.id])).length;
  const mandatoryCount = dynamicRequirements.filter((req) => req.mandatory).length;
  const uploadedMandatoryCount = dynamicRequirements.filter((req) => req.mandatory && Boolean(filesMap[req.id])).length;
  const allMandatoryUploaded = uploadedMandatoryCount >= mandatoryCount;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Link href="/bidder" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <Link href={`/bidder/tenders/${id}`} className="hover:text-foreground">Tender Details</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Apply & Upload Documents</span>
        </div>
        <PreviousButton fallbackHref={`/bidder/tenders/${id}`} />
      </div>

      {/* Tender Banner */}
      <Card className="bg-[#1e3a5f] text-white p-4 sm:p-5 border-none shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-400">AI Bidder Assistant Active</Badge>
              <span className="text-xs font-mono text-blue-200 font-medium">{tender?.id || id}</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold leading-snug">{tender?.title || "Tender Application"}</h1>
            <p className="text-xs text-blue-200 mt-1 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5" /> {tender?.organization || "Government Procurement Department"}
              {linkedVendor && <span>| Vendor: <strong>{linkedVendor.display_name}</strong></span>}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoFillDemoFiles}
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5 self-start sm:self-auto shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Auto-Fill Valid SIH Demo PDFs
          </Button>
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-800 text-xs sm:text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Progress Summary Header */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border text-xs sm:text-sm shadow-sm">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-slate-800">
            Upload Progress: <strong className="text-emerald-700">{uploadedCount}</strong> / {dynamicRequirements.length} Uploaded
          </span>
        </div>
        <Badge variant="outline" className={allMandatoryUploaded ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold" : "bg-amber-50 text-amber-700 border-amber-300 font-semibold"}>
          {allMandatoryUploaded ? "Mandatory Uploads Complete" : `${mandatoryCount - uploadedMandatoryCount} Mandatory Pending`}
        </Badge>
      </div>

      {/* Dynamic Document Upload Grid with AI Bidder Guidance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {dynamicRequirements.map((reqItem) => {
          const file = filesMap[reqItem.id];
          const isDrag = dragActive === reqItem.id;
          const isTooltipOpen = activeTooltipId === reqItem.id;

          return (
            <Card
              key={reqItem.id}
              onDragOver={(e) => handleDragOver(e, reqItem.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, reqItem.id)}
              className={`p-4 border-2 transition-all bg-white shadow-sm ${
                file
                  ? "border-emerald-400 bg-emerald-50/20"
                  : isDrag
                  ? "border-[#1e3a5f] bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col h-full justify-between space-y-3">
                {/* Header & Guidance */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-[#1e3a5f] shrink-0" />
                        <span>{reqItem.title}</span>
                      </h3>
                      <button
                        type="button"
                        onClick={() => setActiveTooltipId(isTooltipOpen ? null : reqItem.id)}
                        className="text-slate-400 hover:text-[#1e3a5f] transition-colors p-0.5 rounded"
                        title="Click for AI document guidance"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {reqItem.mandatory ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] font-bold shrink-0">MANDATORY</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0">OPTIONAL</Badge>
                    )}
                  </div>

                  {/* AI Expected Document Guidance */}
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                      <FileType className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      <span>Expected Document:</span>
                      <strong className="text-[#1e3a5f] font-semibold">{reqItem.expectedDocument}</strong>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">{reqItem.tooltip}</p>
                  </div>

                  {/* Collapsible / Clickable Tooltip Info */}
                  {isTooltipOpen && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded text-[11px] text-blue-900 space-y-1.5 animate-in fade-in">
                      <div className="flex items-center gap-1 font-semibold text-blue-950">
                        <Key className="h-3 w-3 text-blue-700" />
                        <span>AI Verification Keywords:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {reqItem.verificationKeywords.map((kw, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-white border border-blue-200 rounded text-[10px] text-blue-800">
                            {kw}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-blue-700">
                        Accepted Filenames: {reqItem.acceptedAliases.slice(0, 2).join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Action / Uploaded File Status */}
                {file ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-950 truncate">{file.name}</p>
                        <p className="text-[10px] text-emerald-700">{(file.size / 1024).toFixed(1)} KB | Ready for AI Verification</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => handleRemoveFile(reqItem.id)}
                      className="text-red-600 hover:bg-red-100 h-8 w-8 p-0 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3.5 border border-dashed border-slate-300 rounded-md bg-slate-50/50 hover:bg-slate-100/50 text-center">
                    <Upload className="h-5 w-5 text-slate-400 mb-1" />
                    <p className="text-xs font-medium text-slate-700">Drag & Drop PDF or Browse</p>
                    <input
                      type="file"
                      accept=".pdf"
                      id={`file-input-${reqItem.id}`}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(reqItem.id, e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor={`file-input-${reqItem.id}`}
                      className="mt-2 inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1e3a5f] hover:border-[#1e3a5f] cursor-pointer transition-all shadow-sm gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#1e3a5f]" />
                      Select {reqItem.expectedDocument.replace(' (PDF)', '')}
                    </label>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress Box during Submission */}
      {submitting && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-amber-700 animate-spin shrink-0" />
            <div className="space-y-0.5 text-xs sm:text-sm">
              <p className="font-semibold text-amber-900">Submitting Bid Application & Executing AI Document Verification</p>
              <p className="text-amber-700">{uploadProgress}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-2">
        <Link href={`/bidder/tenders/${id}`}>
          <Button variant="outline" size="sm" type="button" className="text-xs">
            Cancel
          </Button>
        </Link>

        <Button
          onClick={handleSubmitApplication}
          disabled={submitting || !allMandatoryUploaded}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm gap-2 px-6 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-sm"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing Application...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              <span>Submit Application for AI Verification</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
