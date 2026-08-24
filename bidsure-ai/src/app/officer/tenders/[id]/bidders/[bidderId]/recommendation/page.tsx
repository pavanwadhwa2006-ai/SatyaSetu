"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getRecommendationByBidder } from "@/data/risk-and-recommendations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Separator } from "@/components/ui/separator";
import {
  Lightbulb, FileText, AlertTriangle, Gavel, ArrowRight, CheckCircle2, XCircle, Info,
} from "lucide-react";

export default function AIRecommendationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const rec = getRecommendationByBidder(bidderId);

  if (!bidder || !rec) return <div className="p-6">Not found.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">AI Recommendation</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#1e3a5f]" />
          AI-Assisted Procurement Recommendation
        </h1>
        <p className="text-sm text-muted-foreground">{bidder.legalName}</p>
      </div>

      {/* Recommendation Card */}
      <Card className="border-2">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Bidder</p>
              <p className="text-base font-semibold">{bidder.legalName}</p>
            </div>
            <StatusBadge status={rec.recommendation} size="lg" />
          </div>

          <Separator />

          {/* Reasons */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Reason Summary</p>
            <div className="space-y-2">
              {rec.reasonSummary.map((reason, i) => (
                <div key={i} className="flex items-start gap-2">
                  {reason.toLowerCase().includes("mismatch") || reason.toLowerCase().includes("missing") || reason.toLowerCase().includes("does not") || reason.toLowerCase().includes("below") ? (
                    <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-500" />
                  )}
                  <p className="text-sm">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Evidence */}
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Evidence References</p>
            <div className="space-y-1.5">
              {rec.evidenceReferences.map((ref, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <FileText className="h-3.5 w-3.5 text-[#1e3a5f]" />
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
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-amber-700" />
          <p className="text-xs text-amber-800 leading-relaxed">
            {rec.disclaimer}
          </p>
        </CardContent>
      </Card>

      {/* Action */}
      <div className="flex justify-end">
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}/decision`}>
          <Button className="bg-[#1e3a5f] hover:bg-[#152a45] gap-2">
            <Gavel className="h-4 w-4" />
            Proceed to Final Decision
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
