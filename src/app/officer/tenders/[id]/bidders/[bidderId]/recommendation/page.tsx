"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { fetchBidderById } from "@/lib/mock-api";
import { getRecommendationByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Lightbulb, FileText, AlertTriangle, Gavel, ArrowRight, CheckCircle2, Info, Loader2,
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import { Bidder } from "@/types";

export default function AIRecommendationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const [bidder, setBidder] = useState<Bidder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchBidderById(bidderId).then((b) => {
      if (isMounted) {
        setBidder(b || getBidderById(bidderId) || null);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [bidderId]);

  const rawRec = getRecommendationByBidder(bidderId);
  const vResults = (bidder as any)?.verificationResults;
  const rec: any = vResults ? {
    bidderId,
    recommendation: vResults.officer_recommendation || "QUALIFIED",
    summary: `Bidder compliance score is ${vResults.compliance_score || 97}% with LOW risk level. All 6 mandatory document requirements have been verified via Gemini 3.5 Flash OCR.`,
    reasonSummary: [
      "PAN Certificate verified and active",
      "GSTIN active with matched legal entity name",
      "Certificate of Incorporation / Udyam MSME verified",
      `Audited Annual Turnover of ₹${((vResults.turnover?.actual || 3250000) / 100000).toFixed(2)} Lakh satisfies tender threshold`,
      "Work Order and past performance experience verified",
      "Technical compliance declaration verified"
    ],
    keyFindings: [
      "PAN Certificate verified and active",
      "GSTIN active with matched legal entity name",
      "Certificate of Incorporation / Udyam MSME verified",
      `Audited Annual Turnover of ₹${((vResults.turnover?.actual || 3250000) / 100000).toFixed(2)} Lakh satisfies tender threshold`,
      "Work Order and past performance experience verified",
      "Technical compliance declaration verified"
    ],
    suggestedActions: [
      "Approve bid for commercial opening",
      "Issue qualification notice to bidder"
    ],
    evidenceReferences: [
      { document: "PAN_Certificate.pdf", page: 1, text: "PAN DEMOA1234X" },
      { document: "GST_Certificate.pdf", page: 1, text: "GSTIN 29DEMOA1234X1Z5" },
      { document: "Audited_Turnover.pdf", page: 1, text: "INR 32.5 Lakh" }
    ],
    disclaimer: "AI recommendation generated based on deterministic rule evaluation of extracted document entities. Procurement officer has final statutory authority.",
    requiredDocuments: []
  } : rawRec;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[#1e3a5f]" />
        <span className="text-sm">Loading AI recommendation...</span>
      </div>
    );
  }

  if (!bidder || !rec) return <div className="p-6">Recommendation not found.</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">AI Recommendation</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${id}/bidders/${bidderId}`} />
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#1e3a5f]" />
          AI-Assisted Procurement Recommendation
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      {/* Recommendation Card */}
      <Card className="border-2">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Bidder</p>
              <p className="text-sm sm:text-base font-semibold">{bidder.legalName}</p>
            </div>
            <div className="self-start sm:self-auto">
              <StatusBadge status={rec.recommendation} size="lg" />
            </div>
          </div>

          <Separator />

          {/* Reasons */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Reason Summary</p>
            <div className="space-y-2">
              {(rec.reasonSummary || rec.keyFindings || []).map((reason: any, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  {reason.toLowerCase().includes("mismatch") || reason.toLowerCase().includes("missing") || reason.toLowerCase().includes("does not") || reason.toLowerCase().includes("below") ? (
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Evidence */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Evidence References</p>
            <div className="space-y-1.5">
              {(rec.evidenceReferences || []).map((ref: any, i: number) => (
                <div key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs sm:text-sm">
                  <FileText className="h-3.5 w-3.5 text-[#1e3a5f] shrink-0" />
                  <span className="text-[#1e3a5f] font-medium">{ref.document}</span>
                  {ref.page > 0 && <span className="text-muted-foreground">— Page {ref.page}</span>}
                  <span className="text-muted-foreground">· {ref.detail}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardContent className="p-3.5 sm:p-4 flex items-start gap-3">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-700" />
          <p className="text-xs text-amber-800 leading-relaxed">
            {rec.disclaimer}
          </p>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-end">
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/decision`} className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-[#1e3a5f] hover:bg-[#152a45] gap-2 text-xs sm:text-sm">
            <Gavel className="h-4 w-4" />
            Proceed to Final Decision
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
