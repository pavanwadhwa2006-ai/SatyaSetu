"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function BidSuccessPage() {
  return (
    <div className="flex items-center justify-center min-h-[70vh] p-6">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="text-xl font-bold text-emerald-800">Bid Submitted Successfully</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-6">
            Your bid has been submitted successfully and is now available for procurement evaluation.
          </p>

          <div className="space-y-3 text-left bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Bid ID</span>
              <span className="font-mono font-medium">BID-DEMO-001</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tender</span>
              <span className="font-mono font-medium">GEM-DEMO-2026-001</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5" /> Submitted
              </span>
            </div>
          </div>

          <Link href="/bidder">
            <Button className="w-full bg-[#1e3a5f] hover:bg-[#152a45] gap-2">
              Return to Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
