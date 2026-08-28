"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Calendar, IndianRupee, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { fetchBackendTenders, BackendTender } from "@/lib/api-client";

export default function TendersPage() {
  const [tendersList, setTendersList] = useState<BackendTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBackendTenders();
      setTendersList(data.items || []);
    } catch (err: any) {
      console.error("Failed to load bidder tenders:", err);
      setError(err.message || "Failed to fetch available tenders from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f]">Available Tenders</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Browse and participate in active GeM procurement tenders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadTenders} disabled={loading} className="text-xs gap-1">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
          <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            GeM Live Database ({tendersList.length} Tenders)
          </Badge>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={loadTenders} className="text-xs">
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-[#1e3a5f]" />
          <p className="text-sm text-muted-foreground">Loading tenders from backend API...</p>
        </div>
      ) : tendersList.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50 text-muted-foreground text-sm">
          No tenders currently available.
        </div>
      ) : (
        <div className="space-y-3">
          {tendersList.map((tender) => {
            const tenderId = tender.tender_number || tender.id;
            const estValue = `₹${(tender.estimated_value / 100000).toFixed(2)} Lakh`;

            return (
              <Card key={tender.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {tender.tender_number}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            tender.status === "OPEN"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {tender.status}
                        </Badge>
                        {tender.category && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {tender.category}
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm leading-snug">{tender.title}</h3>
                      {tender.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tender.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 shrink-0" />
                          {tender.organization}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Deadline:{" "}
                          {new Date(tender.submission_deadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                          {estValue}
                        </span>
                      </div>
                    </div>
                    <Link href={`/bidder/tenders/${encodeURIComponent(tenderId)}`} className="w-full sm:w-auto">
                      <Button size="sm" variant="default" className="w-full sm:w-auto shrink-0 gap-1.5 mt-1 sm:mt-0 bg-[#1e3a5f] hover:bg-[#152a45]">
                        Participate &amp; Submit Bid <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
