"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Brain, FileText, Loader2, AlertCircle } from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchGroundTruthBidders,
  fetchGroundTruthEvidence,
  fetchGroundTruthCompliance,
  fetchGroundTruthRequirements,
} from "@/lib/api-client";

export default function AIVerificationPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const decodedId = decodeURIComponent(id);
  const decodedBidderId = decodeURIComponent(bidderId);

  const [tender, setTender] = useState<any>(null);
  const [bidder, setBidder] = useState<any>(null);
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [complianceList, setComplianceList] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tenderData, biddersData, evData, compData, reqData] = await Promise.all([
          fetchBackendTenderById(decodedId).catch(() => null),
          fetchGroundTruthBidders(),
          fetchGroundTruthEvidence(),
          fetchGroundTruthCompliance(),
          fetchGroundTruthRequirements(),
        ]);

        setTender(tenderData);
        const bList = biddersData.items || [];
        const matchedBidder = bList.find(
          (b: any) => b.id === decodedBidderId || b.bidderCode === decodedBidderId
        ) || bList[0];
        setBidder(matchedBidder);

        if (matchedBidder) {
          const bidderEv = (evData.items || []).filter((e: any) => e.bidderId === matchedBidder.id);
          setEvidenceList(bidderEv);

          const bidderComp = (compData.items || []).filter((c: any) => c.bidderId === matchedBidder.id);
          setComplianceList(bidderComp);

          const tenderReqs = (reqData.items || []).filter(
            (r: any) => r.tenderId === matchedBidder.tenderId || (tenderData && (r.tenderId === tenderData.id || r.gemBidNumber === tenderData.tender_number))
          );
          setRequirements(tenderReqs);
        }
      } catch (err: any) {
        console.error("Failed to load verification reasoning:", err);
        setError(err.message || "Failed to load verification data from backend.");
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
        <p className="text-sm text-muted-foreground">Loading verification reasoning from backend...</p>
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
          <span className="font-medium text-foreground">AI Verification</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} />
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#1e3a5f]" />
          Verification &amp; Provenance Reasoning
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      <div className="rounded-md bg-blue-50 border border-blue-200 p-3">
        <p className="text-xs text-blue-800 leading-relaxed">
          The following displays evidence-based requirement evaluation. Each requirement is evaluated against extracted document facts, source page numbers, and verbatim text quotes from the synthetic PDF package.
        </p>
      </div>

      {/* Reasoning Cards */}
      <div className="space-y-3 sm:space-y-4">
        {requirements.map((req) => {
          const comp = complianceList.find((c) => c.requirementId === req.id);
          const ev = evidenceList.find((e) => e.requirementId === req.id);
          const status = comp?.status || "REVIEW";

          return (
            <Card key={req.id}>
              <CardContent className="p-4 sm:p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">{req.requirementCode} · {req.category}</p>
                    <p className="text-xs sm:text-sm font-medium mt-0.5">{req.requirementName}</p>
                    <p className="text-[11px] text-muted-foreground italic mt-0.5">{req.rawText}</p>
                  </div>
                  <div className="self-start sm:self-auto shrink-0">
                    <StatusBadge status={status} size="md" />
                  </div>
                </div>

                {ev ? (
                  <div className="bg-muted/50 rounded-lg p-3 sm:p-4 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Extracted Value:</span>
                      <span className="font-semibold text-slate-900">{ev.rawValue}</span>
                    </div>
                    {ev.rawQuote && (
                      <div className="p-2 bg-white rounded border text-slate-700 italic">
                        &ldquo;{ev.rawQuote}&rdquo;
                      </div>
                    )}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground pt-1 border-t">
                      <div className="flex items-center gap-1 text-[#1e3a5f]">
                        <FileText className="h-3 w-3" />
                        <span>{ev.documentName || "PDF Evidence"} (Page {ev.pageNumber || 1})</span>
                      </div>
                      <span>Confidence: {((ev.confidence || 0.95) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border rounded text-xs text-muted-foreground italic">
                    No documentary evidence provided by bidder for this requirement.
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
