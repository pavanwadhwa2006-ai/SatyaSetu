"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getReasoningByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Brain, FileText, ArrowRight } from "lucide-react";

export default function AIVerificationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const reasonings = getReasoningByBidder(bidderId);

  if (!bidder) return <div className="p-6">Bidder not found.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">AI Verification</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#1e3a5f]" />
          AI Verification Reasoning
        </h1>
        <p className="text-sm text-muted-foreground">{bidder.legalName}</p>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800">
          The following shows evidence-based verification results. Each requirement is evaluated against extracted document data and applicable rules. This does not expose internal reasoning chains.
        </p>
      </div>

      {/* Reasoning Cards */}
      <div className="space-y-4">
        {reasonings.map((r) => (
          <Card key={r.requirementId}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">Requirement</p>
                  <p className="text-sm font-medium mt-0.5">{r.requirementText}</p>
                </div>
                <StatusBadge status={r.result} size="md" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {r.evidenceDocument && (
                  <div>
                    <p className="text-xs text-muted-foreground">Evidence</p>
                    <p className="text-sm flex items-center gap-1 mt-0.5">
                      <FileText className="h-3 w-3 text-[#1e3a5f]" />
                      {r.evidenceDocument}
                      {r.evidencePage ? ` — Page ${r.evidencePage}` : ""}
                    </p>
                  </div>
                )}
                {r.extractedValue && (
                  <div>
                    <p className="text-xs text-muted-foreground">Extracted Value</p>
                    <p className="text-sm font-medium mt-0.5">{r.extractedValue}</p>
                  </div>
                )}
              </div>

              <div className="rounded-md bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-muted-foreground">Rule</p>
                  <Badge variant="outline" className="text-[10px]">Confidence: {r.confidence}%</Badge>
                </div>
                <p className="text-sm">{r.rule}</p>
              </div>

              <div className="rounded-md bg-slate-50 border p-3">
                <p className="text-xs font-semibold text-muted-foreground mb-1">Result Explanation</p>
                <p className="text-sm text-muted-foreground">{r.reasoning}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
