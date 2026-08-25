"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Brain,
  ClipboardList,
  Upload,
  ScanSearch,
  ShieldCheck,
  GitCompare,
  Scale,
  BarChart3,
  Lightbulb,
  UserCheck,
  Gavel,
  ScrollText,
  ArrowDown,
} from "lucide-react";

interface ArchitectureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const steps = [
  { icon: FileText, label: "Tender PDFs", layer: "input", color: "text-slate-600", bg: "bg-slate-50" },
  { icon: Brain, label: "Tender AI Engine", layer: "ai", color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  { icon: ClipboardList, label: "Tender Requirements", layer: "system", color: "text-slate-600", bg: "bg-slate-50" },
  { icon: Upload, label: "Bidder Portal / Bid Submission", layer: "input", color: "text-slate-600", bg: "bg-slate-50" },
  { icon: ScanSearch, label: "Document AI / OCR", layer: "ai", color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  { icon: ShieldCheck, label: "Prototype Verification Sources", layer: "verification", color: "text-amber-700", bg: "bg-amber-50" },
  { icon: GitCompare, label: "Cross-Verification Engine", layer: "system", color: "text-slate-600", bg: "bg-slate-50" },
  { icon: Scale, label: "Compliance Rule Engine", layer: "rule", color: "text-purple-700", bg: "bg-purple-50" },
  { icon: BarChart3, label: "Risk & Score Engine", layer: "system", color: "text-slate-600", bg: "bg-slate-50" },
  { icon: Lightbulb, label: "AI Recommendation", layer: "ai", color: "text-[#1e3a5f]", bg: "bg-blue-50" },
  { icon: UserCheck, label: "Procurement Officer", layer: "human", color: "text-emerald-700", bg: "bg-emerald-50" },
  { icon: Gavel, label: "Final Decision", layer: "human", color: "text-emerald-700", bg: "bg-emerald-50" },
  { icon: ScrollText, label: "Audit Trail / Report", layer: "system", color: "text-slate-600", bg: "bg-slate-50" },
];

const layerLabels: Record<string, { label: string; color: string }> = {
  ai: { label: "AI Layer", color: "bg-blue-100 text-blue-800 border-blue-200" },
  rule: { label: "Rule Engine", color: "bg-purple-100 text-purple-800 border-purple-200" },
  verification: { label: "Verification Layer", color: "bg-amber-100 text-amber-800 border-amber-200" },
  human: { label: "Human Decision", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  input: { label: "Input / Data", color: "bg-slate-100 text-slate-700 border-slate-200" },
  system: { label: "System", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

export function ArchitectureModal({ open, onOpenChange }: ArchitectureModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="text-left">
          <DialogTitle className="text-base sm:text-lg font-semibold text-[#1e3a5f]">
            System Architecture
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            SatyaSetu — End-to-End Compliance Verification Pipeline
          </p>
        </DialogHeader>

        {/* Legend */}
        <div className="flex flex-wrap gap-1.5 my-2">
          {Object.entries(layerLabels)
            .filter(([key]) => ["ai", "rule", "verification", "human"].includes(key))
            .map(([key, val]) => (
              <Badge key={key} variant="outline" className={`text-[10px] ${val.color}`}>
                {val.label}
              </Badge>
            ))}
        </div>

        {/* Pipeline */}
        <div className="space-y-0 py-1">
          {steps.map((step, i) => (
            <div key={i}>
              <div className={`flex items-center gap-2.5 sm:gap-3 rounded-lg px-2.5 sm:px-3 py-2 border ${step.bg} border-transparent`}>
                <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-md ${step.bg} border`}>
                  <step.icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${step.color}`} />
                </div>
                <span className={`text-xs sm:text-sm font-medium ${step.color} truncate flex-1`}>
                  {step.label}
                </span>
                {step.layer === "verification" && (
                  <Badge variant="outline" className="text-[9px] bg-amber-50 text-amber-700 border-amber-200 shrink-0">
                    Mock
                  </Badge>
                )}
              </div>
              {i < steps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/40" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-md bg-muted/50 p-3 border">
          <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
            <strong>Note:</strong> This architecture diagram represents the intended
            system design. Government verification sources shown are prototype/mock
            implementations. AI components use pre-computed analysis for this
            demonstration. The architecture is designed for future integration with
            LLM APIs, OCR services, and authorized Government API connectors.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
