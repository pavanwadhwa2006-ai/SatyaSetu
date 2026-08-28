"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Shield, AlertTriangle, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchGroundTruthBidders,
  fetchGroundTruthBenchmarks,
} from "@/lib/api-client";

export default function RiskAnalysisPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const decodedId = decodeURIComponent(id);
  const decodedBidderId = decodeURIComponent(bidderId);

  const [tender, setTender] = useState<any>(null);
  const [bidder, setBidder] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tenderData, biddersData, benchData] = await Promise.all([
          fetchBackendTenderById(decodedId).catch(() => null),
          fetchGroundTruthBidders(),
          fetchGroundTruthBenchmarks(),
        ]);

        setTender(tenderData);
        const bList = biddersData.items || [];
        const matchedBidder = bList.find(
          (b: any) => b.id === decodedBidderId || b.bidderCode === decodedBidderId
        ) || bList[0];
        setBidder(matchedBidder);

        if (matchedBidder) {
          const matchedBench = (benchData.items || []).find(
            (bm: any) => bm.bidderId === matchedBidder.id || bm.bidderCode === matchedBidder.bidderCode
          );
          setBenchmark(matchedBench);
        }
      } catch (err: any) {
        console.error("Failed to load risk analysis:", err);
        setError(err.message || "Failed to load risk analysis from backend API.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [decodedId, decodedBidderId]);

  if (loading) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
        <p className="text-sm text-muted-foreground">Loading risk intelligence from backend...</p>
      </div>
    );
  }

  if (error || !bidder) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(decodedId)}/bidders/${encodeURIComponent(decodedBidderId)}`} />
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-sm p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error || "Bidder entity not found."}</span>
        </div>
      </div>
    );
  }

  const riskLevel = benchmark?.expectedRiskLevel || "MEDIUM";
  const riskScore = riskLevel === "LOW" ? 15 : riskLevel === "MEDIUM" ? 45 : 85;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
          <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}`} className="text-muted-foreground hover:text-foreground">
            Evaluation
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} className="text-muted-foreground hover:text-foreground">
            {bidder.shortName}
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Risk Analysis</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} />
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1e3a5f]" />
          Risk Analysis &amp; Entity Integrity
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      {/* Risk Score Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
            <div className="flex justify-center">
              <StatusBadge status={riskLevel} size="lg" showIcon={false} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
            <p className={`text-2xl sm:text-3xl font-bold ${riskScore <= 25 ? "text-emerald-700" : riskScore <= 60 ? "text-amber-700" : "text-rose-700"}`}>
              {riskScore}
            </p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">/ 100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Ground Truth Standard</p>
            <p className="text-sm font-semibold text-slate-900 mt-1">{benchmark?.expectedOverallStatus || "REVIEW"}</p>
            <p className="text-[11px] sm:text-xs text-muted-foreground">{benchmark?.totalRequirementsCount || 0} Clauses Evaluated</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Rationale */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <h2 className="font-semibold text-sm sm:text-base text-slate-900">Benchmark Risk &amp; Compliance Rationale</h2>
          <div className="p-3 bg-slate-50 rounded-lg border text-xs sm:text-sm text-slate-700 leading-relaxed">
            {benchmark?.rationale || "Evaluated against canonical ground truth benchmark standard."}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
