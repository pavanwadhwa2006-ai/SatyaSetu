"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getComplianceByBidder } from "@/data/compliance";
import { getRiskByBidder, getRecommendationByBidder } from "@/data/risk-and-recommendations";
import { useEvaluation } from "@/contexts/evaluation-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/compliance/status-badge";
import { DecisionType } from "@/types";
import {
  Gavel, CheckCircle2, XCircle, MessageSquare, AlertTriangle, ArrowRight,
} from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";

export default function FinalDecisionPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const compliance = getComplianceByBidder(bidderId);
  const risk = getRiskByBidder(bidderId);
  const rec = getRecommendationByBidder(bidderId);
  const { makeDecision, getDecision } = useEvaluation();
  const existingDecision = getDecision(bidderId);

  const [selectedDecision, setSelectedDecision] = useState<DecisionType | null>(
    existingDecision?.decision ?? null
  );
  const [remarks, setRemarks] = useState(existingDecision?.remarks ?? "");
  const [confirmed, setConfirmed] = useState(!!existingDecision);

  if (!bidder || !compliance || !risk || !rec) return <div className="p-6">Not found.</div>;

  const handleConfirm = async () => {
    if (!selectedDecision) return;
    
    // Map decision to database status string
    const dbStatus = selectedDecision === "APPROVE" ? "QUALIFIED" : selectedDecision === "REJECT" ? "DISQUALIFIED" : "CLARIFICATION_REQUESTED";

    // 1. Call Backend Officer Decision API
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      await fetch(`${apiUrl}/api/analysis/officer-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bid_submission_id: bidderId,
          decision: dbStatus,
          notes: remarks,
        }),
      });
    } catch (err) {
      console.warn("Officer decision API call warning:", err);
    }

    // 2. Evaluation context update
    makeDecision(bidderId, {
      bidderId,
      bidId: compliance.bidId,
      tenderId: id,
      decision: selectedDecision,
      decisionLabel: selectedDecision === "APPROVE" ? "Approved / Qualified" : selectedDecision === "REJECT" ? "Rejected / Disqualified" : "Sent for Clarification",
      remarks,
      decidedBy: "Ananya Mehta, Senior Procurement Officer",
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
          <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Final Decision</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${id}/bidders/${bidderId}`} />
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Gavel className="h-5 w-5 text-[#1e3a5f]" />
          Final Officer Decision
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      {/* Pre-Decision Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Compliance</p>
            <p className="text-xl sm:text-2xl font-bold">{compliance.complianceScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Risk</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={risk.riskLevel} size="md" showIcon={false} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">Mandatory Failures</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">{compliance.failedRequirements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3.5 sm:p-4 text-center">
            <p className="text-xs text-muted-foreground">AI Recommendation</p>
            <div className="mt-1 flex justify-center">
              <StatusBadge status={rec.recommendation} size="sm" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Review Flags */}
      {compliance.reviewRequirements > 0 && (
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-3.5 sm:p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Review Flags
            </p>
            {compliance.items.filter(i => i.status === "REVIEW").map(item => (
              <p key={item.requirementId} className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                • {item.requirementName}: {item.reason}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Decision Card */}
      {!confirmed ? (
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-4">
            <p className="text-sm font-semibold">Select Your Decision</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {decisions.map(({ type, label, icon: Icon, color, bg }) => (
                <button
                  key={type}
                  onClick={() => setSelectedDecision(type)}
                  className={`rounded-lg border-2 p-3.5 sm:p-4 text-left transition-all ${
                    selectedDecision === type ? `${bg} border-current ring-2 ring-offset-1` : "border-muted/60 hover:border-muted bg-card"
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-1.5 ${color}`} />
                  <p className={`text-xs sm:text-sm font-semibold ${color}`}>{label}</p>
                </button>
              ))}
            </div>

            <div>
              <Label className="text-xs sm:text-sm">Officer Remarks</Label>
              <Textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter your remarks and justification for this decision..."
                className="mt-1"
                rows={3}
              />
            </div>

            <Button
              onClick={handleConfirm}
              disabled={!selectedDecision}
              className="bg-[#1e3a5f] hover:bg-[#152a45] w-full gap-2 text-xs sm:text-sm"
            >
              <Gavel className="h-4 w-4" /> Confirm Final Decision
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-5 sm:p-8 text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-emerald-600" />
            <h2 className="text-base sm:text-lg font-bold">Decision Recorded</h2>
            <div className="flex justify-center">
              <StatusBadge status={selectedDecision ?? "APPROVE"} size="lg" />
            </div>
            {remarks && (
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto italic px-2">
                &ldquo;{remarks}&rdquo;
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Decision by: Ananya Mehta, Senior Procurement Officer
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 pt-2">
              <Link href={`/officer/tenders/${id}/bidders/${bidderId}/audit`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1 text-xs">
                  View Audit Trail <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href={`/officer/tenders/${id}/report`} className="w-full sm:w-auto">
                <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1 text-xs">
                  Evaluation Report <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
