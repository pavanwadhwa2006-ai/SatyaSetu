"use client";

import { use } from "react";
import Link from "next/link";
import { getBidderById } from "@/data/bidders";
import { getAuditByBidder } from "@/data/audit";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ScrollText, Send, Upload, ScanSearch, ShieldCheck, AlertTriangle,
  Brain, Lightbulb, UserCheck, Gavel, CheckCircle2,
} from "lucide-react";
import { AuditEventType } from "@/types";

const eventIcons: Record<AuditEventType, { icon: React.ElementType; color: string; bg: string }> = {
  BID_SUBMITTED: { icon: Send, color: "text-blue-700", bg: "bg-blue-50" },
  DOCUMENTS_UPLOADED: { icon: Upload, color: "text-slate-700", bg: "bg-slate-50" },
  EXTRACTION_COMPLETED: { icon: ScanSearch, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  VERIFICATION_COMPLETED: { icon: ShieldCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
  MISMATCH_DETECTED: { icon: AlertTriangle, color: "text-amber-700", bg: "bg-amber-50" },
  COMPLIANCE_ANALYZED: { icon: Brain, color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  RECOMMENDATION_GENERATED: { icon: Lightbulb, color: "text-purple-700", bg: "bg-purple-50" },
  OFFICER_REVIEWED: { icon: UserCheck, color: "text-slate-700", bg: "bg-slate-50" },
  DECISION_RECORDED: { icon: Gavel, color: "text-emerald-700", bg: "bg-emerald-50" },
};

export default function AuditTrailPage({ params }: { params: Promise<{ id: string; bidderId: string }> }) {
  const { id, bidderId } = use(params);
  const bidder = getBidderById(bidderId);
  const events = getAuditByBidder(bidderId);

  if (!bidder) return <div className="p-6">Not found.</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/officer" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
        <span className="text-muted-foreground">/</span>
        <Link href={`/officer/tenders/${id}/bidders/${bidderId}`} className="text-muted-foreground hover:text-foreground">{bidder.shortName}</Link>
        <span className="text-muted-foreground">/</span>
        <span className="font-medium">Audit Trail</span>
      </div>

      <div>
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-[#1e3a5f]" />
          Audit Trail
        </h1>
        <p className="text-sm text-muted-foreground">{bidder.legalName}</p>
      </div>

      {/* Timeline */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />

            <div className="space-y-6">
              {events.map((event, i) => {
                const config = eventIcons[event.eventType];
                const Icon = config.icon;
                return (
                  <div key={event.id} className="relative flex gap-4">
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white ${config.bg}`}>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{event.description}</p>
                        <span className="text-xs text-muted-foreground font-mono">
                          {event.timeFormatted}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="outline" className="text-[10px]">{event.actor}</Badge>
                        {event.details && (
                          <p className="text-xs text-muted-foreground">{event.details}</p>
                        )}
                      </div>
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
