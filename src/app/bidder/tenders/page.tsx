"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchTenders } from "@/lib/mock-api";
import { Tender } from "@/types";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Calendar, IndianRupee, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TendersPage() {
  const [tenderList, setTenderList] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchTenders().then((data) => {
      if (isMounted) {
        setTenderList(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold">Available Tenders</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Browse and participate in open government tenders</p>
        </div>
        <Badge variant="outline" className="text-[10px] sm:text-xs">Live Supabase Data</Badge>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading live tenders...</span>
          </div>
        ) : (
          tenderList.map((tender) => (
            <Card key={tender.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground font-medium">{tender.id}</span>
                      <StatusBadge status={tender.status} size="sm" showIcon={false} />
                    </div>
                    <h3 className="font-semibold text-sm leading-snug">{tender.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tender.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 shrink-0" />{tender.organization}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 shrink-0" />{new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1 font-medium text-foreground"><IndianRupee className="h-3.5 w-3.5 shrink-0" />{tender.estimatedValueFormatted}</span>
                    </div>
                  </div>
                  <Link href={`/bidder/tenders/${tender.id}`} className="w-full sm:w-auto">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 gap-1 mt-1 sm:mt-0">
                      View <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
