"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText, IndianRupee, CheckCircle2,
  Send, Shield, Loader2, AlertCircle,
} from "lucide-react";
import {
  fetchBackendTenderById,
  fetchTenderRequirements,
  createOrResumeBidSubmission,
  BackendTender,
  StructuredRequirement,
} from "@/lib/api-client";

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const decodedId = decodeURIComponent(id);

  const [tender, setTender] = useState<BackendTender | null>(null);
  const [requirements, setRequirements] = useState<StructuredRequirement[]>([]);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTender() {
      setLoading(true);
      setError(null);
      try {
        const [liveTender, reqData] = await Promise.all([
          fetchBackendTenderById(decodedId),
          fetchTenderRequirements(decodedId).catch(() => ({ items: [], total: 0 })),
        ]);
        setTender(liveTender);
        setRequirements(reqData.items || []);
      } catch (err: any) {
        console.error("Failed to load tender specifications:", err);
        setError(err.message || "Failed to fetch tender from backend API.");
      } finally {
        setLoading(false);
      }
    }
    loadTender();
  }, [decodedId]);

  const handleStartSubmission = async () => {
    if (!tender) return;
    setStarting(true);
    try {
      const sub = await createOrResumeBidSubmission(tender.tender_number || tender.id);
      router.push(`/bidder/tenders/${encodeURIComponent(tender.tender_number || tender.id)}/bid?submission_id=${sub.id}`);
    } catch (err: any) {
      console.error("Bid submission start error:", err);
      // Still navigate to workspace with tender identifier
      router.push(`/bidder/tenders/${encodeURIComponent(tender.tender_number || tender.id)}/bid`);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading tender specifications from backend...</p>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || "Tender not found in database."}</span>
        </div>
        <Link href="/bidder/tenders">
          <Button variant="outline" size="sm">Back to Available Tenders</Button>
        </Link>
      </div>
    );
  }

  const estValue = `₹${(tender.estimated_value / 100000).toFixed(2)} Lakh`;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <Link href="/bidder" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/bidder/tenders" className="text-muted-foreground hover:text-foreground">Tenders</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{tender.tender_number}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {tender.tender_number}
            </span>
            <Badge
              variant="outline"
              className={`text-xs ${
                tender.status === "OPEN"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200"
              }`}
            >
              {tender.status}
            </Badge>
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
              GeM Live Database
            </Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold leading-snug">{tender.title}</h1>
          {tender.description && (
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">{tender.description}</p>
          )}
        </div>
        <Button
          onClick={handleStartSubmission}
          disabled={starting}
          className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152a45] gap-2 shrink-0 text-white font-medium"
        >
          {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Start Bid Submission
        </Button>
      </div>

      {/* Tender Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#1e3a5f]" />
              Tender Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Bid Number", value: tender.tender_number },
              { label: "Organization / Buyer", value: tender.organization },
              { label: "Department", value: tender.department || "Procurement Wing" },
              { label: "Category", value: tender.category },
              { label: "Evaluation Type", value: tender.evaluation_type || "Technical & Financial Evaluation" },
              { label: "Delivery Location", value: tender.delivery_location || "As specified in GeM tender" },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-medium text-right break-words">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[#1e3a5f]" />
              Commercial &amp; Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Estimated Value", value: estValue },
              {
                label: "EMD Amount",
                value: tender.emd_amount ? `₹${tender.emd_amount.toLocaleString("en-IN")}` : "Exempted / Not specified",
              },
              {
                label: "Submission Deadline",
                value: new Date(tender.submission_deadline).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }),
              },
              { label: "Bid Validity", value: `${tender.bid_validity_days || 90} days` },
              { label: "Delivery Period", value: `${tender.delivery_period_days || 30} days` },
              { label: "Warranty Required", value: `${tender.warranty_months || 12} months` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-medium text-right break-words">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Structured Requirements from Phase 5 Tender Intelligence */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1e3a5f]" />
            Tender Requirements &amp; Evidence Criteria ({requirements.length})
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Bidders must upload valid documentary evidence in PDF format corresponding to each requirement.
          </p>
        </CardHeader>
        <CardContent>
          {requirements.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground border rounded-md">
              General documentary evidence required (Turnover certificate, POs, CRAC, and Declarations).
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requirements.map((req) => (
                <div key={req.id} className="flex items-start gap-2.5 rounded-md border p-3 bg-card">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[11px] font-bold text-[#1e3a5f]">{req.requirementCode}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          req.isMandatory
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {req.isMandatory ? "MANDATORY" : "OPTIONAL"}
                      </Badge>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-0.5">{req.requirementName}</p>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">{req.rawText}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-600">
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                        {req.operator} {JSON.stringify(req.threshold)} {req.unit || ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
