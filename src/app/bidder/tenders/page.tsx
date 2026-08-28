"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { tenders as staticTenders } from "@/data/tenders";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Calendar, IndianRupee, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchBackendTenders } from "@/lib/api-client";

export default function TendersPage() {
  const [tendersList, setTendersList] = useState<any[]>(staticTenders);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<"LIVE_BACKEND" | "LOCAL_FALLBACK">("LOCAL_FALLBACK");

  useEffect(() => {
    async function loadTenders() {
      try {
        const data = await fetchBackendTenders();
        if (data && data.items && data.items.length > 0) {
          setTendersList(data.items);
          setDataSource("LIVE_BACKEND");
        }
      } catch (err) {
        console.warn("Using fallback static tender dataset:", err);
      } finally {
        setLoading(false);
      }
    }
    loadTenders();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Available Tenders</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Browse and participate in active GeM procurement tenders
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          <Badge variant="outline" className={`text-[10px] sm:text-xs ${dataSource === "LIVE_BACKEND" ? "border-emerald-300 text-emerald-700 bg-emerald-50" : ""}`}>
            {dataSource === "LIVE_BACKEND" ? "GeM Live Database" : "Prototype Tender Data"}
          </Badge>
        </div>
      </div>

      <div className="space-y-3">
        {tendersList.map((tender) => {
          const tenderId = tender.tender_number || tender.id;
          const displayTitle = tender.title;
          const displayOrg = tender.organization;
          const displayDesc = tender.description;
          const displayStatus = tender.status;
          const deadlineDate = tender.submission_deadline || tender.submissionDeadline;
          const estValue = tender.estimated_value
            ? `₹${(tender.estimated_value / 100000).toFixed(2)} Lakh`
            : tender.estimatedValueFormatted || "N/A";

          return (
            <Card key={tender.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground font-semibold">
                        {tender.tender_number || tender.id}
                      </span>
                      <StatusBadge status={displayStatus} size="sm" showIcon={false} />
                      {tender.category && (
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {tender.category}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm leading-snug">{displayTitle}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{displayDesc}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        {displayOrg}
                      </span>
                      {deadlineDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          {new Date(deadlineDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      )}
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                        {estValue}
                      </span>
                    </div>
                  </div>
                  <Link href={`/bidder/tenders/${encodeURIComponent(tenderId)}`} className="w-full sm:w-auto">
                    <Button size="sm" variant="default" className="w-full sm:w-auto shrink-0 gap-1.5 mt-1 sm:mt-0 bg-[#1e3a5f] hover:bg-[#152a45]">
                      Participate & Submit Bid <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
