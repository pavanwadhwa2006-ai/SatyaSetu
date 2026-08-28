"use client";

import Link from "next/link";
import { tenders } from "@/data/tenders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, FileText, ArrowRight } from "lucide-react";
import { PreviousButton } from "@/components/shared/previous-button";

export default function OfficerReportsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <PreviousButton fallbackHref="/officer" />
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f] flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Evaluation Reports
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Select a tender to view and export its comprehensive compliance evaluation report
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {tenders.map((tender) => (
          <Card key={tender.id}>
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <span className="text-xs font-mono text-muted-foreground font-medium">{tender.id}</span>
                <h3 className="font-semibold text-sm leading-snug">{tender.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{tender.organization} · {tender.estimatedValueFormatted}</p>
              </div>
              <Link href={`/officer/tenders/${tender.id}/report`} className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1 text-xs whitespace-nowrap">
                  <FileText className="h-3.5 w-3.5" /> View Report <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
