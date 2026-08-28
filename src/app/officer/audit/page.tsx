"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollText, ArrowRight, Building2, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import { fetchGroundTruthBidders } from "@/lib/api-client";

export default function OfficerAuditPage() {
  const [biddersList, setBiddersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBidders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGroundTruthBidders();
      setBiddersList(data.items || []);
    } catch (err: any) {
      console.error("Failed to load bidders for audit:", err);
      setError(err.message || "Failed to load bidder entities from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBidders();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PreviousButton fallbackHref="/officer" />
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f] flex items-center gap-2">
              <ScrollText className="h-5 w-5" />
              Audit Logs &amp; Provenance Trails
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Select a canonical bidder entity to inspect complete verification, fact extraction, and decision audit trails
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadBidders} disabled={loading} className="text-xs gap-1">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
          <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            Backend Entities ({biddersList.length})
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadBidders} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
          <p className="text-sm text-muted-foreground">Loading bidder entities from backend API...</p>
        </div>
      ) : biddersList.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50 text-muted-foreground text-sm">
          No bidder audit records found.
        </div>
      ) : (
        <div className="space-y-3">
          {biddersList.map((bidder) => (
            <Card key={bidder.id}>
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {bidder.bidderCode}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {bidder.businessType}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{bidder.legalName}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {bidder.state} · PAN: {bidder.panNumber} · GSTIN: {bidder.gstin}
                  </p>
                </div>
                <Link href={`/officer/ground-truth`} className="w-full sm:w-auto">
                  <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1 text-xs whitespace-nowrap">
                    <ScrollText className="h-3.5 w-3.5" /> View Audit Trail <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
