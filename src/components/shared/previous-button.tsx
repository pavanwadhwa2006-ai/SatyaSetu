"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PreviousButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
  variant?: "outline" | "ghost" | "default" | "secondary";
  size?: "sm" | "xs" | "default";
}

export function PreviousButton({
  fallbackHref = "/officer",
  label = "Previous",
  className,
  variant = "outline",
  size = "sm",
}: PreviousButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={cn(
        "gap-1.5 text-xs text-[#1e3a5f] border-slate-200 hover:bg-[#1e3a5f]/5 hover:text-[#1e3a5f] cursor-pointer transition-colors shadow-2xs",
        className
      )}
      title="Go to previous page"
      aria-label="Go to previous page"
    >
      <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
      <span>{label}</span>
    </Button>
  );
}
