"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";
import { fetchBackendTenders, BackendTender } from "@/lib/api-client";

export default function OfficerReportsPage() {
  const [tenders, setTenders] = useState<BackendTender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBackendTenders();
      setTenders(data.items || []);
    } catch (err: any) {
      console.error("Failed to load tenders for reports:", err);
      setError(err.message || "Failed to load tenders from backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenders();
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <PreviousButton fallbackHref="/officer" />
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f] flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evaluation Reports
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Select an active GeM tender to view its comprehensive compliance evaluation report
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={loadTenders} disabled={loading} className="text-xs gap-1">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </Button>
          <Badge variant="outline" className="text-[10px] sm:text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
            Database ({tenders.length} Tenders)
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
      ) : tenders.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed rounded-xl bg-slate-50 text-muted-foreground text-sm">
          No tenders found in the database.
        </div>
      ) : (
        <div className="space-y-3">
          {tenders.map((tender) => (
            <Card key={tender.id}>
              <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {tender.tender_number}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        tender.status === "OPEN"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {tender.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-sm leading-snug">{tender.title}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tender.organization} · ₹{(tender.estimated_value / 100000).toFixed(2)} Lakh
                  </p>
                </div>
                <Link
                  href={`/officer/tenders/${encodeURIComponent(tender.tender_number || tender.id)}/report`}
                  className="w-full sm:w-auto"
                >
                  <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1 text-xs whitespace-nowrap">
                    <FileText className="h-3.5 w-3.5" /> View Report <ArrowRight className="h-3.5 w-3.5" />
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
