"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchTenderById, submitBidApplication } from "@/lib/mock-api";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles,
  Loader2, Trash2, ShieldCheck, ArrowRight, FileCheck, Building2
} from "lucide-react";

const REQUIRED_DOC_TYPES = [
  { id: "GST_CERTIFICATE", label: "GST Certificate", required: true, description: "Valid GST Registration Certificate (PDF)" },
  { id: "PAN_CERTIFICATE", label: "PAN Card", required: true, description: "Company PAN Card Certificate (PDF)" },
  { id: "COMPANY_REGISTRATION", label: "Company Registration / Udyam", required: true, description: "Certificate of Incorporation or MSME Udyam (PDF)" },
  { id: "TURNOVER_CERTIFICATE", label: "CA Turnover Certificate", required: true, description: "CA Certified Audited Annual Turnover for 3 Financial Years (PDF)" },
  { id: "WORK_ORDER", label: "Experience / Work Order", required: true, description: "Previous Similar Contract Work Orders & Completion Certificates (PDF)" },
  { id: "ADDITIONAL_SUPPORTING", label: "Additional Supporting Document", required: false, description: "Optional technical specifications or compliance declarations (PDF)" },
];

export default function BidderApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { linkedVendor } = useAuth();
  const [tender, setTender] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload state map: docTypeId -> File
  const [filesMap, setFilesMap] = useState<Record<string, File>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<string | null>(null);

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

  const handleFileSelect = (docTypeId: string, selectedFile: File) => {
    if (!selectedFile.type.includes("pdf") && !selectedFile.name.endsWith(".pdf")) {
      setError(`Only PDF files are allowed for ${docTypeId}.`);
      return;
    }
    setError(null);
    setFilesMap((prev) => ({ ...prev, [docTypeId]: selectedFile }));
  };

  const handleRemoveFile = (docTypeId: string) => {
    setFilesMap((prev) => {
      const next = { ...prev };
      delete next[docTypeId];
      return next;
    });
  };

  const handleDragOver = (e: React.DragEvent, docTypeId: string) => {
    e.preventDefault();
    setDragActive(docTypeId);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(null);
  };

  const handleDrop = (e: React.DragEvent, docTypeId: string) => {
    e.preventDefault();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(docTypeId, e.dataTransfer.files[0]);
    }
  };

  const handleAutoFillDemoFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const demoDocs = [
        { id: "GST_CERTIFICATE", name: "GST_Certificate_2026.pdf" },
        { id: "PAN_CERTIFICATE", name: "Company_PAN_Certificate.pdf" },
        { id: "COMPANY_REGISTRATION", name: "Incorporation_Certificate.pdf" },
        { id: "TURNOVER_CERTIFICATE", name: "CA_Audited_Turnover_Certificate.pdf" },
        { id: "WORK_ORDER", name: "Government_Work_Order_Experience.pdf" },
      ];

      const newMap: Record<string, File> = { ...filesMap };
      for (const item of demoDocs) {
        const dummyBlob = new Blob([`SIH Demo PDF Content for ${item.name}`], { type: "application/pdf" });
        const file = new File([dummyBlob], item.name, { type: "application/pdf" });
        newMap[item.id] = file;
      }
      setFilesMap(newMap);
    } catch (err) {
      console.warn("Could not autofill demo files:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApplication = async () => {
    // Check mandatory required documents
    const missingRequired = REQUIRED_DOC_TYPES.filter((d) => d.required && !filesMap[d.id]);
    if (missingRequired.length > 0) {
      setError(`Please upload all mandatory documents (${missingRequired.map((m) => m.label).join(", ")}) before submitting.`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      setUploadProgress("Uploading documents to Supabase Storage bucket 'vendor-documents'...");
      await new Promise((r) => setTimeout(r, 600));

      const docArray = Object.entries(filesMap).map(([type, file]) => ({ type, file }));

      setUploadProgress("Creating bid_submission & vendor_documents records in Supabase...");
      const result = await submitBidApplication({
        tenderId: tender?.id || id,
        vendorId: linkedVendor?.id,
        documents: docArray,
      });

      setUploadProgress("Executing AI verification & Rule Engine evaluation...");
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
        <span className="text-sm">Loading Tender Details...</span>
      </div>
    );
  }

  const uploadedCount = Object.keys(filesMap).length;
  const mandatoryCount = REQUIRED_DOC_TYPES.filter((d) => d.required).length;

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
              <Badge className="bg-amber-400 text-slate-950 font-bold hover:bg-amber-400">Apply for Tender</Badge>
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
            <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Auto-Fill SIH Demo PDFs
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
      <div className="flex items-center justify-between bg-white p-3.5 rounded-lg border text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-emerald-600" />
          <span className="font-semibold text-slate-800">
            Document Upload Progress: <strong className="text-emerald-700">{uploadedCount}</strong> / {REQUIRED_DOC_TYPES.length} Uploaded
          </span>
        </div>
        <Badge variant="outline" className={uploadedCount >= mandatoryCount ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-amber-50 text-amber-700 border-amber-300"}>
          {uploadedCount >= mandatoryCount ? "Mandatory Uploads Complete" : `${mandatoryCount - uploadedCount} Mandatory Pending`}
        </Badge>
      </div>

      {/* Document Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_DOC_TYPES.map((docType) => {
          const file = filesMap[docType.id];
          const isDrag = dragActive === docType.id;

          return (
            <Card
              key={docType.id}
              onDragOver={(e) => handleDragOver(e, docType.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, docType.id)}
              className={`p-4 border-2 transition-all bg-white ${
                file
                  ? "border-emerald-400 bg-emerald-50/20"
                  : isDrag
                  ? "border-[#1e3a5f] bg-blue-50/50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col h-full justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-[#1e3a5f]" /> {docType.label}
                    </h3>
                    {docType.required ? (
                      <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] font-bold">REQUIRED</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">OPTIONAL</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{docType.description}</p>
                </div>

                {file ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-950 truncate">{file.name}</p>
                        <p className="text-[10px] text-emerald-700">{(file.size / 1024).toFixed(1)} KB | Ready for upload</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={() => handleRemoveFile(docType.id)}
                      className="text-red-600 hover:bg-red-100 h-8 w-8 p-0 shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 rounded-md bg-slate-50/50 hover:bg-slate-100/50 text-center">
                    <Upload className="h-6 w-6 text-slate-400 mb-1" />
                    <p className="text-xs font-medium text-slate-700">Drag & Drop PDF or Browse</p>
                    <input
                      type="file"
                      accept=".pdf"
                      id={`file-input-${docType.id}`}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(docType.id, e.target.files[0]);
                        }
                      }}
                    />
                    <label
                      htmlFor={`file-input-${docType.id}`}
                      className="mt-2.5 inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1e3a5f] hover:border-[#1e3a5f] cursor-pointer transition-all shadow-sm gap-1.5"
                    >
                      <FileText className="h-3.5 w-3.5 text-[#1e3a5f]" />
                      Select PDF
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
              <p className="font-semibold text-amber-900">Submitting Bid Application & Triggering AI Compliance Verification</p>
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
          disabled={submitting || uploadedCount < mandatoryCount}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm gap-2 px-6"
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
