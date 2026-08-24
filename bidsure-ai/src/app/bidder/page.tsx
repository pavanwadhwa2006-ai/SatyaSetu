"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/compliance/status-badge";
import { tenders } from "@/data/tenders";
import {
  FileText,
  Send,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Available Tenders", value: "5", icon: FileText, color: "text-[#1e3a5f]", bg: "bg-[#1e3a5f]/10" },
  { label: "Submitted Bids", value: "1", icon: Send, color: "text-emerald-700", bg: "bg-emerald-50" },
  { label: "Under Evaluation", value: "1", icon: Clock, color: "text-amber-700", bg: "bg-amber-50" },
  { label: "Pending Actions", value: "2", icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
];

export default function BidderDashboard() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">
          Welcome, <span className="text-[#1e3a5f]">ABC Engineering Pvt. Ltd.</span>
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Bidder Dashboard · Manage your tenders and bids
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-3 p-3.5 sm:p-4">
              <div className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold leading-tight">{stat.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground truncate">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Available Tenders */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base sm:text-lg font-semibold">Available Tenders</h2>
          <Badge variant="outline" className="text-[10px] sm:text-xs">
            Prototype Tender Data
          </Badge>
        </div>

        <div className="space-y-3">
          {tenders.filter(t => t.status !== 'CLOSED').map((tender) => (
            <Card key={tender.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-mono text-muted-foreground font-medium">
                        {tender.id}
                      </span>
                      <StatusBadge status={tender.status} size="sm" showIcon={false} />
                    </div>
                    <h3 className="font-semibold text-sm leading-snug">
                      {tender.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{tender.organization}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        Deadline: {new Date(tender.submissionDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                        {tender.estimatedValueFormatted}
                      </span>
                    </div>
                  </div>
                  <Link href={`/bidder/tenders/${tender.id}`} className="w-full sm:w-auto">
                    <Button size="sm" variant="outline" className="w-full sm:w-auto shrink-0 gap-1 mt-1 sm:mt-0">
                      View Tender
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
