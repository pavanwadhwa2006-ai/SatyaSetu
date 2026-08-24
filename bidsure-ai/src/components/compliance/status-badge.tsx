import { cn } from "@/lib/utils";
import { ComplianceStatus, RiskLevel } from "@/types";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface StatusBadgeProps {
  status: ComplianceStatus | RiskLevel | string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ElementType | null; label?: string }> = {
  PASS: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "PASS" },
  FAIL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "FAIL" },
  REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle, label: "REVIEW" },
  LOW: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: null, label: "LOW" },
  MEDIUM: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: null, label: "MEDIUM" },
  HIGH: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: null, label: "HIGH" },
  CRITICAL: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", icon: null, label: "CRITICAL" },
  COMPLIANT: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "COMPLIANT" },
  OPEN: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: null, label: "OPEN" },
  EVALUATION: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: null, label: "EVALUATION" },
  CLOSED: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: null, label: "CLOSED" },
  AWARDED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: null, label: "AWARDED" },
  SUBMITTED: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: null, label: "SUBMITTED" },
  UNDER_EVALUATION: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: null, label: "UNDER EVALUATION" },
  QUALIFIED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "QUALIFIED" },
  DISQUALIFIED: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "DISQUALIFIED" },
  EXTRACTED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: null, label: "EXTRACTED" },
  PENDING: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", icon: null, label: "PENDING" },
  REVIEW_BEFORE_DECISION: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle, label: "REVIEW REQUIRED" },
  QUALIFY: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "QUALIFY" },
  DISQUALIFY: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "DISQUALIFY" },
  APPROVE: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "APPROVED" },
  REJECT: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle, label: "REJECTED" },
  CLARIFICATION: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertTriangle, label: "CLARIFICATION SENT" },
};

const sizeClasses = {
  sm: "px-1.5 py-0.5 text-[10px] gap-1",
  md: "px-2 py-1 text-xs gap-1.5",
  lg: "px-3 py-1.5 text-sm gap-1.5",
};

export function StatusBadge({ status, size = "md", showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig["PENDING"];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-semibold whitespace-nowrap",
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && <Icon className={cn(size === "sm" ? "h-3 w-3" : size === "md" ? "h-3.5 w-3.5" : "h-4 w-4")} />}
      {config.label || status}
    </span>
  );
}
