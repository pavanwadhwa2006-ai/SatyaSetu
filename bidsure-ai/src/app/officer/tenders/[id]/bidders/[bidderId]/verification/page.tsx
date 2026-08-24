"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getReasoningByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Brain, FileText } from "lucide-react";

export default function AIVerificationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const reasonings = getReasoningByBidder(bidderId);

  if (!bidder) return <div className="p-6">Bidder not found.</div>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium text-foreground">AI Verification</span>
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#1e3a5f]" />
          AI Verification Reasoning
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800 leading-relaxed">
          The following shows evidence-based verification results. Each requirement is evaluated against extracted document data and applicable rules. This does not expose internal reasoning chains.
        </p>
      </div>

      {/* Reasoning Cards */}
      <div className="space-y-3 sm:space-y-4">
        {reasonings.map((r) => (
          <Card key={r.requirementId}>
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Requirement</p>
                  <p className="text-xs sm:text-sm font-medium mt-0.5">{r.requirementText}</p>
                </div>
                <div className="self-start sm:self-auto shrink-0">
                  <StatusBadge status={r.result} size="md" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {r.evidenceDocument && (
                  <div>
                    <p className="text-xs text-muted-foreground">Evidence</p>
                    <p className="text-xs sm:text-sm flex items-center gap-1 mt-0.5">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-[#1e3a5f]" />
                      <span className="truncate">{r.evidenceDocument}</span>
                      {r.evidencePage ? <span className="text-muted-foreground"> — Page {r.evidencePage}</span> : ""}
                    </p>
                  </div>
                )}
                {r.extractedValue && (
                  <div>
                    <p className="text-xs text-muted-foreground">Extracted Value</p>
                    <p className="text-xs sm:text-sm font-medium mt-0.5 break-words">{r.extractedValue}</p>
                  </div>
                )}
              </div>

              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="text-xs font-semibold text-muted-foreground">Rule</p>
                  <Badge variant="outline" className="text-[10px]">Confidence: {r.confidence}%</Badge>
                </div>
                <p className="text-xs sm:text-sm">{r.rule}</p>
              </div>

              <div className="rounded-md bg-slate-50 border p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Result Explanation</p>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{r.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
