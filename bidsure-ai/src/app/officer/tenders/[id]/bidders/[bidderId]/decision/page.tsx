"use client";

import { use, useState } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getComplianceByBidder } from "@/data/compliance";
import { getRiskByBidder, getRecommendationByBidder } from "@/data/risk-and-recommendations";
import { getAuditByBidder } from "@/data/audit";
import { useEvaluation } from "@/contexts/evaluation-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Separator } from "@/components/ui/separator";
import { DecisionType } from "@/types";
import {
  Gavel, CheckCircle2, XCircle, MessageSquare, AlertTriangle, ArrowRight,
} from "lucide-react";

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

  const handleConfirm = () => {
    if (!selectedDecision) return;
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
    { type: "CLARIFICATION", label: "Send for Clarification", icon: MessageSquare, color: "text-amber-700", bg: "bg-amber-50 border-amber-200 hover:bg-amber-100" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Final Decision</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Gavel className="h-5 w-5 text-[#1e3a5f]" />
          Final Officer Decision
        </h1>
        <p className="text-sm text-muted-foreground">{bidder.legalName}</p>
      </div>

      {/* Pre-Decision Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Compliance</p>
            <p className="text-2xl font-bold">{compliance.complianceScore}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Risk</p>
            <StatusBadge status={risk.riskLevel} size="md" showIcon={false} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Mandatory Failures</p>
            <p className="text-2xl font-bold text-red-600">{compliance.failedRequirements}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">AI Recommendation</p>
            <StatusBadge status={rec.recommendation} size="sm" />
          </CardContent>
        </Card>
      </div>

      {/* Review Flags */}
      {compliance.reviewRequirements > 0 && (
        <Card className="bg-amber-50/50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-amber-800 mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Review Flags
            </p>
            {compliance.items.filter(i => i.status === "REVIEW").map(item => (
              <p key={item.requirementId} className="text-sm text-amber-700">
                • {item.requirementName}: {item.reason}
              </p>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Decision */}
      {!confirmed ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm font-semibold">Select Your Decision</p>
            <div className="grid grid-cols-3 gap-3">
              {decisions.map(({ type, label, icon: Icon, color, bg }) => (
                <button
                  key={type}
                  onClick={() => setSelectedDecision(type)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedDecision === type ? `${bg} border-current` : "border-transparent hover:border-muted"
                  }`}
                >
                  <Icon className={`h-5 w-5 mb-2 ${color}`} />
                  <p className={`text-sm font-semibold ${color}`}>{label}</p>
                </button>
              ))}
            </div>

            <div>
              <Label>Officer Remarks</Label>
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
              className="bg-[#1e3a5f] hover:bg-[#152a45] w-full gap-2"
            >
              <Gavel className="h-4 w-4" /> Confirm Final Decision
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-emerald-200 bg-emerald-50/30">
          <CardContent className="p-6 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-600" />
            <h2 className="text-lg font-bold">Decision Recorded</h2>
            <StatusBadge status={selectedDecision ?? "APPROVE"} size="lg" />
            {remarks && (
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                &ldquo;{remarks}&rdquo;
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Decision by: Ananya Mehta, Senior Procurement Officer
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Link href={`/officer/tenders/${id}/bidders/${bidderId}/audit`}>
                <Button variant="outline" size="sm" className="gap-1">
                  View Audit Trail <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Link href={`/officer/tenders/${id}/report`}>
                <Button variant="outline" size="sm" className="gap-1">
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
