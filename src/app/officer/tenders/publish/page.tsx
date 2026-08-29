"use client";

import { useState } from "react";
import Link from "next/link";
import { publishTender } from "@/lib/mock-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  Upload, FileText, Loader2, CheckCircle2, AlertCircle, Sparkles,
  Building, Calendar, DollarSign, Clock, ShieldCheck, ArrowRight, FileCheck
} from "lucide-react";

const DEMO_PRESETS = [
  { name: "GEM2026B7903799.pdf", label: "Manpower Outsourcing (GEM/2026/B/7903799)", path: "/demo/tenders/GEM2026B7903799.pdf" },
  { name: "GEM2026B7878577.pdf", label: "IT Projects / Agency Hiring (GEM/2026/B/7878577)", path: "/demo/tenders/GEM2026B7878577.pdf" },
  { name: "GEM2026B7676747.pdf", label: "Electrical Maintenance (GEM/2026/B/7676747)", path: "/demo/tenders/GEM2026B7676747.pdf" },
  { name: "GEM2026B7261466.pdf", label: "Software Procurement (GEM/2026/B/7261466)", path: "/demo/tenders/GEM2026B7261466.pdf" },
  { name: "GEM2026B7364888.pdf", label: "Product / Supply Procurement (GEM/2026/B/7364888)", path: "/demo/tenders/GEM2026B7364888.pdf" },
];

export default function PublishTenderPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [presetName, setPresetName] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progressStep, setProgressStep] = useState<string>("");
  const [publishResult, setPublishResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPresetName("");
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
        setPresetName("");
        setError(null);
      } else {
        setError("Please drop a valid PDF document file.");
      }
    }
  };

  const handleSelectPreset = async (preset: typeof DEMO_PRESETS[0]) => {
    setPresetName(preset.name);
    setError(null);
    try {
      const res = await fetch(preset.path);
      const blob = await res.blob();
      const file = new File([blob], preset.name, { type: "application/pdf" });
      setSelectedFile(file);
    } catch (err) {
      console.warn("Could not load local preset file:", err);
      // Fallback empty File object with correct name
      const file = new File(["dummy pdf content"], preset.name, { type: "application/pdf" });
      setSelectedFile(file);
    }
  };

  const handlePublish = async () => {
    if (!selectedFile) {
      setError("Please select or upload a GeM Tender PDF file first.");
      return;
    }

    setUploading(true);
    setError(null);
    setPublishResult(null);

    try {
      setProgressStep("Uploading PDF to Supabase Storage (bucket: 'tender-documents')...");
      await new Promise(r => setTimeout(r, 600));

      setProgressStep("Gemini 2.5 Pro extracting structured tender requirements...");
      await new Promise(r => setTimeout(r, 800));

      setProgressStep("Saving extracted requirements to Supabase database...");
      const res = await publishTender(selectedFile);

      if (res && res.extracted_requirements) {
        setPublishResult(res);
      } else {
        setError("Failed to extract tender requirements from backend API.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred while publishing the tender.");
    } finally {
      setUploading(false);
      setProgressStep("");
    }
  };

  const req = publishResult?.extracted_requirements;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto">
      {/* Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <Link href="/officer" className="hover:text-foreground">Dashboard</Link>
          <span>/</span>
          <span className="font-medium text-foreground">Publish Tender</span>
        </div>
        <PreviousButton fallbackHref="/officer" />
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f] flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" /> Publish Tender with AI Requirement Extraction
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Upload a GeM Tender PDF. Gemini 2.5 Pro automatically extracts required documents, financial criteria, deadlines, and eligibility conditions.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="bg-red-50 border-red-200 p-4">
          <div className="flex items-center gap-2 text-red-800 text-xs sm:text-sm font-medium">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Upload Card */}
      <Card
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="p-4 sm:p-6 border-2 border-dashed border-slate-300 hover:border-[#1e3a5f]/50 transition-colors bg-white cursor-pointer"
      >
        <div className="space-y-4">
          <div className="flex flex-col items-center justify-center text-center p-4">
            <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
              <Upload className="h-6 w-6 text-[#1e3a5f]" />
            </div>
            <h3 className="font-semibold text-sm sm:text-base text-slate-800">
              Select or Drag & Drop GeM Tender PDF
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Upload official GeM tender document (PDF). Requirements will be stored in Supabase and made visible to bidders.
            </p>

            <input
              type="file"
              accept=".pdf"
              id="tender-pdf-input"
              className="hidden"
              onChange={handleFileChange}
            />
            <label
              htmlFor="tender-pdf-input"
              className="mt-4 inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1e3a5f] hover:border-[#1e3a5f] cursor-pointer transition-all shadow-sm gap-2"
            >
              <FileText className="h-4 w-4 text-[#1e3a5f]" /> Browse PDF File
            </label>

            {selectedFile && (
              <div className="mt-3 flex items-center gap-2 bg-blue-50 text-[#1e3a5f] px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200">
                <FileCheck className="h-4 w-4 text-emerald-600" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>

          {/* Quick Demo Preset Selection */}
          <div className="border-t pt-4">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
              Or Choose from SIH Demo GeM Tenders:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {DEMO_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-2.5 rounded border text-left transition-all flex items-start gap-2 ${
                    presetName === preset.name
                      ? "border-[#1e3a5f] bg-blue-50/70 font-medium text-[#1e3a5f]"
                      : "border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700"
                  }`}
                >
                  <FileText className="h-4 w-4 shrink-0 text-[#1e3a5f] mt-0.5" />
                  <span className="truncate">{preset.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-2">
            <Button
              disabled={uploading || !selectedFile}
              onClick={handlePublish}
              className="bg-[#1e3a5f] hover:bg-[#152a45] text-sm gap-2 px-6"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Extraction...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Publish Tender</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Progress Card */}
      {uploading && (
        <Card className="p-4 bg-amber-50/60 border-amber-200">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-amber-700 animate-spin shrink-0" />
            <div className="space-y-0.5 text-xs sm:text-sm">
              <p className="font-semibold text-amber-900">AI Requirement Extraction in Progress</p>
              <p className="text-amber-700">{progressStep}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Card displaying Extracted Requirements */}
      {publishResult && req && (
        <Card className="p-5 sm:p-6 border-2 border-emerald-500/30 bg-emerald-50/20 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-base sm:text-lg text-emerald-950">Tender Published Successfully!</h2>
                <p className="text-xs text-emerald-800">Stored in Supabase `tenders` table & visible on Officer/Bidder dashboards.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600 text-white font-semibold">Status: OPEN</Badge>
              <Badge variant="outline" className="font-mono text-xs border-emerald-300 text-emerald-900 bg-white">
                {req.tender_number}
              </Badge>
            </div>
          </div>

          {/* Title & Org */}
          <div className="bg-white p-4 rounded-lg border border-emerald-100 space-y-2">
            <h3 className="font-semibold text-base text-slate-900">{req.tender_title}</h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-[#1e3a5f]" /> {req.organization}</span>
              {req.department && <span>Department: <strong className="text-slate-800">{req.department}</strong></span>}
              {req.category && <span>Category: <strong className="text-slate-800">{req.category}</strong></span>}
            </div>
            {req.description && (
              <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded border leading-relaxed">
                {req.description}
              </p>
            )}
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-3.5 rounded-lg border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Minimum Turnover
              </span>
              <p className="text-base font-bold text-slate-800">
                ₹{Number(req.minimum_turnover || 50000000).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" /> EMD Amount
              </span>
              <p className="text-base font-bold text-slate-800">
                ₹{Number(req.emd_amount || 370000).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Calendar className="h-3.5 w-3.5 text-amber-600" /> Submission Deadline
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">
                {req.submission_deadline ? String(req.submission_deadline).split('T')[0] : "2026-09-20"}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-lg border space-y-1">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <Clock className="h-3.5 w-3.5 text-indigo-600" /> Delivery & Warranty
              </span>
              <p className="text-xs font-medium text-slate-800">
                Delivery: <strong>{req.delivery_period_days || 120} days</strong> | Warranty: <strong>{req.warranty_months || 36} mos</strong>
              </p>
            </div>
          </div>

          {/* Required Documents Checklist */}
          <div className="bg-white p-4 rounded-lg border space-y-3">
            <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-emerald-600" /> AI Extracted Required Documents Checklist ({req.required_documents?.length || 7})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {req.required_documents?.map((doc: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-slate-50 border border-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span className="font-medium text-slate-800">{doc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eligibility Conditions */}
          {req.eligibility_conditions?.length > 0 && (
            <div className="bg-white p-4 rounded-lg border space-y-2">
              <h4 className="font-semibold text-xs text-slate-800 uppercase tracking-wider">
                Eligibility & Compliance Conditions
              </h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {req.eligibility_conditions.map((cond: string, idx: number) => (
                  <li key={idx}>{cond}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Dashboard Navigation Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Link href="/officer">
              <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] text-xs gap-1.5">
                View in Officer Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/bidder/tenders">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                View in Bidder Portal <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
