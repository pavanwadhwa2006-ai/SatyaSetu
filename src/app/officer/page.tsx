"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, ClipboardCheck, AlertTriangle, BarChart3, ArrowRight,
} from "lucide-react";

const stats = [
  { label: "Active Tenders", value: "8", icon: FileText, color: "text-[#1e3a5f]", bg: "bg-[#1e3a5f]/10" },
  { label: "Bids Received", value: "27", icon: ClipboardCheck, color: "text-emerald-700", bg: "bg-emerald-50" },
  { label: "Pending Reviews", value: "6", icon: BarChart3, color: "text-amber-700", bg: "bg-amber-50" },
  { label: "High Risk Bids", value: "3", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
];

const tenderRows = [
  { id: "GEM-DEMO-2026-001", title: "Supply and Installation of Industrial Temperature Monitoring Equipment", bids: 4, status: "Pending Evaluation", deadline: "20 Sep 2026", isShowcase: true },
  { id: "GEM-DEMO-2026-002", title: "Procurement of Network Security Appliances", bids: 6, status: "Under Review", deadline: "30 Sep 2026", isShowcase: false },
  { id: "GEM-DEMO-2026-004", title: "Supply of Laboratory Chemical Reagents and Glassware", bids: 3, status: "Pending", deadline: "15 Sep 2026", isShowcase: false },
  { id: "GEM-DEMO-2026-005", title: "Development of Citizen Grievance Portal", bids: 8, status: "Shortlisted", deadline: "05 Oct 2026", isShowcase: false },
];

export default function OfficerDashboard() {
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-[#1e3a5f]">Procurement Evaluation Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Monitor tenders, evaluate bids, and manage procurement decisions</p>
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

      {/* Tender Table */}
      <Card>
        <div className="p-3.5 sm:p-4 border-b flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-sm sm:text-base">Tender Evaluations</h2>
          <Badge variant="outline" className="text-[10px] sm:text-xs">Prototype Tender Data</Badge>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[220px]">Tender</TableHead>
                <TableHead className="w-[70px] sm:w-[80px]">Bids</TableHead>
                <TableHead className="w-[120px] sm:w-[140px]">Evaluation Status</TableHead>
                <TableHead className="w-[100px] sm:w-[110px]">Deadline</TableHead>
                <TableHead className="w-[120px] sm:w-[140px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenderRows.map((row) => (
                <TableRow key={row.id} className={row.isShowcase ? "bg-blue-50/50" : ""}>
                  <TableCell>
                    <div className="min-w-0">
                      <span className="text-xs font-mono text-muted-foreground font-medium">{row.id}</span>
                      <p className="text-xs sm:text-sm font-medium leading-snug">{row.title}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold text-xs">{row.bids}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200 whitespace-nowrap">
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{row.deadline}</TableCell>
                  <TableCell>
                    {row.isShowcase ? (
                      <Link href={`/officer/tenders/${row.id}`}>
                        <Button size="sm" className="bg-[#1e3a5f] hover:bg-[#152a45] gap-1 text-xs whitespace-nowrap">
                          Analyze Bids <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    ) : (
                      <Button size="sm" variant="outline" disabled className="gap-1 text-xs whitespace-nowrap">
                        View <ArrowRight className="h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
