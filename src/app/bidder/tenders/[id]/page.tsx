"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getTenderById as getStaticTender } from "@/data/tenders";
import { groundTruthTenders } from "@/data/ground-truth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  FileText, IndianRupee, CheckCircle2,
  Send, Shield, Loader2,
} from "lucide-react";
import { fetchBackendTenderById, createOrResumeBidSubmission } from "@/lib/api-client";

export default function TenderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [tender, setTender] = useState<any>(null);
  const [starting, setStarting] = useState(false);
  const [loading, setLoading] = useState(true);

  const decodedId = decodeURIComponent(id);

  useEffect(() => {
    async function loadTender() {
      try {
        const liveTender = await fetchBackendTenderById(decodedId);
        if (liveTender) {
          setTender(liveTender);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn("Backend tender fetch fallback:", err);
      }

      // Fallback to local ground truth or static dataset
      const gtTender = groundTruthTenders.find(
        (t) => t.id === decodedId || t.bidNumber === decodedId
      );
      if (gtTender) {
        setTender({
          id: gtTender.id,
          tender_number: gtTender.bidNumber,
          title: gtTender.title,
          organization: gtTender.buyer,
          category: gtTender.category,
          status: "OPEN",
          estimated_value: gtTender.estimatedValue,
          estimatedValueFormatted: gtTender.estimatedValueFormatted,
          submission_deadline: "2026-09-30T17:00:00+05:30",
          delivery_period_days: 45,
          warranty_months: 24,
          description: `Government procurement tender for ${gtTender.title}`,
        });
      } else {
        const fallback = getStaticTender(decodedId);
        setTender(fallback);
      }
      setLoading(false);
    }
    loadTender();
  }, [decodedId]);

  const handleStartSubmission = async () => {
    setStarting(true);
    try {
      const tenderIdentifier = tender?.tender_number || tender?.id || decodedId;
      const sub = await createOrResumeBidSubmission(tenderIdentifier);
      router.push(`/bidder/tenders/${encodeURIComponent(decodedId)}/bid?submission_id=${sub.id}`);
    } catch (err) {
      console.warn("API creation error, navigating to local workspace:", err);
      router.push(`/bidder/tenders/${encodeURIComponent(decodedId)}/bid`);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading tender specifications...</p>
      </div>
    );
  }

  if (!tender) {
    return <div className="p-6">Tender not found.</div>;
  }

  const estValue = tender.estimated_value
    ? `₹${(tender.estimated_value / 100000).toFixed(2)} Lakh`
    : tender.estimatedValueFormatted || "N/A";

  const deadlineDate = tender.submission_deadline || tender.submissionDeadline;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <Link href="/bidder" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href="/bidder/tenders" className="text-muted-foreground hover:text-foreground">Tenders</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">{tender.tender_number || tender.id}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground font-semibold">{tender.tender_number || tender.id}</span>
            <StatusBadge status={tender.status || "OPEN"} size="sm" showIcon={false} />
            <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
              Active GeM Tender
            </Badge>
          </div>
          <h1 className="text-lg sm:text-xl font-semibold leading-snug">{tender.title}</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">{tender.description}</p>
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
              { label: "Bid Number", value: tender.tender_number || tender.id },
              { label: "Organization / Buyer", value: tender.organization },
              { label: "Department", value: tender.department || "Procurement Wing" },
              { label: "Category", value: tender.category || "General Procurement" },
              { label: "Evaluation Type", value: tender.evaluation_type || tender.evaluationType || "L1 / QCBS" },
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
              Commercial & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {[
              { label: "Estimated Value", value: estValue },
              { label: "EMD Amount", value: tender.emd_amount ? `₹${(tender.emd_amount / 1000).toFixed(2)} K` : (tender.emdAmountFormatted || "Exempted / Not specified") },
              { label: "Submission Deadline", value: deadlineDate ? new Date(deadlineDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : "Open" },
              { label: "Bid Validity", value: `${tender.bid_validity_days || tender.bidValidityDays || 90} days` },
              { label: "Delivery Period", value: `${tender.delivery_period_days || tender.deliveryPeriodDays || 30} days` },
              { label: "Warranty Required", value: `${tender.warranty_months || tender.warrantyMonths || 12} months` },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-start text-xs sm:text-sm gap-2">
                <span className="text-muted-foreground shrink-0">{item.label}</span>
                <span className="font-medium text-right break-words">{item.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Required Evidence Documents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#1e3a5f]" />
            Required Bidder Submission Documents
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Bidders must upload valid documentary evidence in PDF format to complete bid submission.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Annual Turnover Certificate", desc: "CA Certified turnover statement with UDIN", tag: "FINANCIAL", mandatory: true },
              { name: "Past Experience / Work Order", desc: "Government/PSU contract completion certificate", tag: "EXPERIENCE", mandatory: true },
              { name: "OEM Authorization Form (MAF)", desc: "Manufacturer Authorization directly executed for this tender", tag: "OEM", mandatory: true },
              { name: "Udyam / MSME Registration", desc: "For claiming statutory turnover or EMD exemption", tag: "STATUTORY", mandatory: false },
              { name: "Make in India (MII) Declaration", desc: "Class-I local content declaration certificate", tag: "PREFERENTIAL", mandatory: false },
              { name: "Non-Blacklisting Affidavit", desc: "Executed on notarized non-judicial stamp paper", tag: "STATUTORY", mandatory: true },
            ].map((doc, i) => (
              <div key={i} className="flex items-start gap-2.5 rounded-md border p-3 bg-card">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-blue-600" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium">{doc.name}</p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                  <div className="mt-1.5">
                    {doc.mandatory ? (
                      <Badge variant="outline" className="text-[9px] bg-red-50 text-red-700 border-red-200">MANDATORY</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-200">OPTIONAL</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
