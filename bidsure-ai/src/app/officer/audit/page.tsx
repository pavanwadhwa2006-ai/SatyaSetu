"use client";

import Link from "next/link";
import { bidders } from "@/data/bidders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollText, ArrowRight, Building2 } from "lucide-react";

export default function OfficerAuditPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f] flex items-center gap-2">
          <ScrollText className="h-5 w-5" />
          Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Select a bidder to inspect complete verification and decision audit trails
        </p>
      </div>

      <div className="space-y-3">
        {bidders.map((bidder) => (
          <Card key={bidder.id}>
            <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="min-w-0">
                <span className="text-xs font-mono text-muted-foreground font-medium">{bidder.id}</span>
                <h3 className="font-semibold text-sm leading-snug">{bidder.legalName}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {bidder.state} · PAN: {bidder.pan}
                </p>
              </div>
              <Link href={`/officer/tenders/GEM-DEMO-2026-001/bidders/${bidder.id}/audit`} className="w-full sm:w-auto">
                <Button size="sm" variant="outline" className="w-full sm:w-auto gap-1 text-xs whitespace-nowrap">
                  <ScrollText className="h-3.5 w-3.5" /> View Audit Trail <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
