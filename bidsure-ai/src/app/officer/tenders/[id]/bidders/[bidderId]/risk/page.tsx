"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getRiskByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/compliance/status-badge";
import {
  AlertTriangle, CheckCircle2, Shield, ArrowRight,
} from "lucide-react";

export default function RiskAnalysisPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const risk = getRiskByBidder(bidderId);

  if (!bidder || !risk) return <div className="p-6">Not found.</div>;

  const scoreColor =
    risk.riskScore <= 20 ? "text-emerald-600" :
    risk.riskScore <= 50 ? "text-amber-600" :
    "text-red-600";

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Risk Analysis</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-[#1e3a5f]" />
          Risk Analysis
        </h1>
        <p className="text-sm text-muted-foreground">{bidder.legalName}</p>
      </div>

      {/* Risk Score Card */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
            <StatusBadge status={risk.riskLevel} size="lg" showIcon={false} />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Score</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>{risk.riskScore}</p>
            <p className="text-xs text-muted-foreground">/ {risk.maxScore}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-xs text-muted-foreground mb-1">Risk Flags</p>
            <p className="text-3xl font-bold">{risk.flags.length}</p>
            <p className="text-xs text-muted-foreground">identified</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Flags */}
      <Card>
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Risk Flags</h2>
        </div>
        <CardContent className="p-4 space-y-3">
          {risk.flags.map((flag) => (
            <div key={flag.id} className="flex items-start gap-3 rounded-md border p-3">
              {flag.severity === "LOW" ? (
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-emerald-500" />
              ) : (
                <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                  flag.severity === "HIGH" ? "text-red-500" : "text-amber-500"
                }`} />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{flag.description}</p>
                  <StatusBadge status={flag.severity} size="sm" showIcon={false} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Category: {flag.category}
                  {flag.relatedDocument && ` · ${flag.relatedDocument}`}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommended Action */}
      <Card className="border-[#1e3a5f]/20 bg-[#1e3a5f]/5">
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase text-[#1e3a5f] mb-1">
            Recommended Officer Action
          </p>
          <p className="text-sm font-medium">{risk.recommendedAction}</p>
        </CardContent>
      </Card>
    </div>
  );
}
