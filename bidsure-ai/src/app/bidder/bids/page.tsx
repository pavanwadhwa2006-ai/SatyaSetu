"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function MyBidsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">My Bids</h1>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground">BID-DEMO-001</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Submitted
                </Badge>
              </div>
              <p className="text-sm font-medium">Supply and Installation of Industrial Temperature Monitoring Equipment</p>
              <p className="text-xs text-muted-foreground mt-0.5">Tender: GEM-DEMO-2026-001 · Submitted: 14 Sep 2026</p>
            </div>
            <Link href="/bidder/tenders/GEM-DEMO-2026-001">
              <Button size="sm" variant="outline" className="gap-1">
                View <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
