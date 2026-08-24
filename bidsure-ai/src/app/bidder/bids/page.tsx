"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MyBidsPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold">My Bids</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Track your submitted bids and evaluation status</p>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-mono text-muted-foreground font-medium">BID-DEMO-001</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
                </Badge>
              </div>
              <p className="text-sm font-medium leading-snug">Supply and Installation of Industrial Temperature Monitoring Equipment</p>
              <p className="text-xs text-muted-foreground mt-1">Tender: GEM-DEMO-2026-001 · Submitted: 14 Sep 2026</p>
            </div>
            <Link href="/bidder/tenders/GEM-DEMO-2026-001" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 gap-1">
                View <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
