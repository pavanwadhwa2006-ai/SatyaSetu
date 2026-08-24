"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function BidSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-4 sm:p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-5 sm:p-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-emerald-600" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-emerald-800">Bid Submitted Successfully</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 mb-5 sm:mb-6">
            Your bid has been submitted successfully and is now available for procurement evaluation.
          </p>

          <div className="space-y-2.5 text-left bg-muted/50 rounded-lg p-3.5 sm:p-4 mb-5 sm:mb-6 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bid ID</span>
              <span className="font-mono font-medium">BID-DEMO-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tender</span>
              <span className="font-mono font-medium">GEM-DEMO-2026-001</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
              </span>
            </div>
          </div>

          <Link href="/bidder" className="block w-full">
            <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45] gap-2 text-xs sm:text-sm">
              Return to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
