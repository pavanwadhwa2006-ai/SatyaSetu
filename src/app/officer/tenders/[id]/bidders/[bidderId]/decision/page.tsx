"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useEvaluation } from "@/contexts/evaluation-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/compliance/status-badge";
import { DecisionType } from "@/types";
import {
  Gavel, CheckCircle2, XCircle, MessageSquare, AlertTriangle, ArrowRight, Loader2, AlertCircle,
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchGroundTruthBidders,
  fetchGroundTruthBenchmarks,
} from "@/lib/api-client";

export default function FinalDecisionPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const decodedId = decodeURIComponent(id);
  const decodedBidderId = decodeURIComponent(bidderId);

  const [tender, setTender] = useState<any>(null);
  const [bidder, setBidder] = useState<any>(null);
  const [benchmark, setBenchmark] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { makeDecision, getDecision } = useEvaluation();
  const existingDecision = getDecision(decodedBidderId);

  const [selectedDecision, setSelectedDecision] = useState<DecisionType | null>(
    existingDecision?.decision ?? null
  );
  const [remarks, setRemarks] = useState(existingDecision?.remarks ?? "");
  const [confirmed, setConfirmed] = useState(!!existingDecision);

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
        console.error("Failed to load decision context:", err);
        setError(err.message || "Failed to load decision data from backend.");
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
        <p className="text-sm text-muted-foreground">Loading decision workspace from backend...</p>
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

  const handleConfirm = () => {
    if (!selectedDecision) return;
    makeDecision(decodedBidderId, {
      bidderId: decodedBidderId,
      bidId: `bid-${decodedBidderId}`,
      tenderId: tender?.tender_number || decodedId,
      decision: selectedDecision,
      decisionLabel:
        selectedDecision === "APPROVE"
          ? "Approved / Qualified"
          : selectedDecision === "REJECT"
          ? "Rejected / Disqualified"
          : "Sent for Clarification",
      remarks,
      decidedBy: "Procurement Officer",
      decidedAt: new Date().toISOString(),
    });
    setConfirmed(true);
  };

  const decisions: { type: DecisionType; label: string; icon: React.ElementType; color: string; bg: string }[] = [
    { type: "APPROVE", label: "Approve / Qualify", icon: CheckCircle2, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100" },
    { type: "REJECT", label: "Reject / Disqualify", icon: XCircle, color: "text-red-700", bg: "bg-red-50 border-red-200 hover:bg-red-100" },
    { type: "CLARIFICATION", label: "Send Clarification", icon: MessageSquare, color: "text-amber-700", bg: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  ];

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
          <span className="font-medium text-foreground">Final Decision</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} />
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Gavel className="h-5 w-5 text-[#1e3a5f]" />
          Officer Procurement Decision
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      {/* Decision Card */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-800">Select Procurement Decision Action</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {decisions.map((d) => (
                <button
                  key={d.type}
                  onClick={() => setSelectedDecision(d.type)}
                  className={`p-3 rounded-lg border text-left text-xs font-medium transition-all ${
                    selectedDecision === d.type
                      ? "ring-2 ring-[#1e3a5f] bg-[#1e3a5f]/5 border-[#1e3a5f]"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <d.icon className={`h-4 w-4 ${d.color}`} />
                    <span className="font-semibold">{d.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-800">Officer Remarks &amp; Audit Trail Notes</Label>
            <Textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter official procurement justification or notes for this decision..."
              className="text-xs"
              rows={4}
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            {confirmed && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Decision Saved in Context
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button
                onClick={handleConfirm}
                disabled={!selectedDecision}
                className="bg-[#1e3a5f] hover:bg-[#152a45] text-white text-xs gap-1.5"
              >
                <Gavel className="w-3.5 h-3.5" /> Save Official Decision
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
