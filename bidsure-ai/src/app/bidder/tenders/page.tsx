"use client";

import Link from "next/link";
import { tenders } from "@/data/tenders";
import { StatusBadge } from "@/components/compliance/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, Calendar, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TendersPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Available Tenders</h1>
          <p className="text-sm text-muted-foreground">Browse and participate in open tenders</p>
        </div>
        <Badge variant="outline" className="text-xs">Prototype Tender Data</Badge>
      </div>

      <div className="space-y-3">
        {tenders.map((tender) => (
          <Card key={tender.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{tender.id}</span>
                    <StatusBadge status={tender.status} size="sm" showIcon={false} />
                  </div>
                  <h3 className="font-semibold text-sm">{tender.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tender.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{tender.organization}</span>
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" />{tender.estimatedValueFormatted}</span>
                  </div>
                </div>
                <Link href={`/bidder/tenders/${tender.id}`}>
                  <Button size="sm" variant="outline" className="shrink-0 gap-1">
                    View <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
