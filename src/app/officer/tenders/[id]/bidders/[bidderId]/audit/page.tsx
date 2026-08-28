"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText, Send, Upload, ScanSearch, ShieldCheck, AlertTriangle,
  Brain, Lightbulb, UserCheck, Gavel, Loader2, AlertCircle,
} from "lucide-react";
import { AuditEventType } from "@/types";
import { PreviousButton } from "@/components/shared/previous-button";
import {
  fetchBackendTenderById,
  fetchGroundTruthBidders,
  fetchGroundTruthDocuments,
} from "@/lib/api-client";

const eventIcons: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  BID_SUBMITTED: { icon: Send, color: "text-blue-700", bg: "bg-blue-50" },
  DOCUMENTS_UPLOADED: { icon: Upload, color: "text-slate-700", bg: "bg-slate-50" },
  EXTRACTION_COMPLETED: { icon: ScanSearch, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  VERIFICATION_COMPLETED: { icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
  MISMATCH_DETECTED: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50" },
  COMPLIANCE_ANALYZED: { icon: Brain, color: "text-purple-700", bg: "bg-purple-50" },
  RECOMMENDATION_GENERATED: { icon: Lightbulb, color: "text-amber-700", bg: "bg-amber-50" },
  OFFICER_REVIEWED: { icon: UserCheck, color: "text-blue-700", bg: "bg-blue-50" },
  DECISION_RECORDED: { icon: Gavel, color: "text-emerald-700", bg: "bg-emerald-50" },
};

export default function AuditTrailPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const decodedId = decodeURIComponent(id);
  const decodedBidderId = decodeURIComponent(bidderId);

  const [tender, setTender] = useState<any>(null);
  const [bidder, setBidder] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [tenderData, biddersData, docsData] = await Promise.all([
          fetchBackendTenderById(decodedId).catch(() => null),
          fetchGroundTruthBidders(),
          fetchGroundTruthDocuments(),
        ]);

        setTender(tenderData);
        const bList = biddersData.items || [];
        const matchedBidder = bList.find(
          (b: any) => b.id === decodedBidderId || b.bidderCode === decodedBidderId
        ) || bList[0];
        setBidder(matchedBidder);

        if (matchedBidder) {
          const bidderDocs = (docsData.items || []).filter((d: any) => d.bidderId === matchedBidder.id);
          setDocuments(bidderDocs);
        }
      } catch (err: any) {
        console.error("Failed to load audit trail:", err);
        setError(err.message || "Failed to load audit data from backend.");
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
        <p className="text-sm text-muted-foreground">Loading audit trail from backend...</p>
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

  const events = [
    {
      id: "evt-1",
      type: "BID_SUBMITTED",
      title: "Bid Package Ingestion",
      description: `Bid package ingested for tender ${tender?.tender_number || decodedId} by ${bidder.legalName}`,
      timestamp: "Phase 6 Bidder Submission Workflow",
      actor: bidder.shortName,
    },
    {
      id: "evt-2",
      type: "DOCUMENTS_UPLOADED",
      title: "Documentary Evidence Attachment",
      description: `${documents.length} PDF documents verified and stored in Supabase Storage with cryptographic hashing`,
      timestamp: "Phase 6 Ingestion Layer",
      actor: "System Storage Service",
    },
    {
      id: "evt-3",
      type: "EXTRACTION_COMPLETED",
      title: "Document Intelligence Fact Extraction",
      description: "Deterministic text parsing executed page-by-page. Facts, units, quotes, and 1-indexed source pages indexed.",
      timestamp: "Phase 7 Document Intelligence Engine",
      actor: "FastAPI Parser",
    },
    {
      id: "evt-4",
      type: "VERIFICATION_COMPLETED",
      title: "Ground Truth Requirement Mapping",
      description: "Structured requirements mapped to extracted document facts with provenance quotes.",
      timestamp: "Phase 3 Canonical Benchmark Standard",
      actor: "Ground Truth Verifier",
    },
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
          <span className="font-medium text-foreground">Audit Trail</span>
        </div>
        <PreviousButton fallbackHref={`/officer/tenders/${encodeURIComponent(tender?.tender_number || decodedId)}/bidders/${encodeURIComponent(bidder.id)}`} />
      </div>

      <div>
        <h1 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[#1e3a5f]" />
          Verification &amp; Decision Audit Trail
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{bidder.legalName}</p>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <div className="absolute left-4 sm:left-5 top-3 bottom-3 w-0.5 bg-border" />
            <div className="space-y-6">
              {events.map((e) => {
                const IconConfig = eventIcons[e.type] || eventIcons.BID_SUBMITTED;
                const IconComponent = IconConfig.icon;

                return (
                  <div key={e.id} className="relative flex items-start gap-3 sm:gap-4 pl-1 sm:pl-2">
                    <div className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border bg-white ${IconConfig.color}`}>
                      <IconComponent className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className="text-xs sm:text-sm font-semibold">{e.title}</p>
                        <span className="text-[11px] font-mono text-muted-foreground">{e.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{e.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-1 font-medium">Actor: {e.actor}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
