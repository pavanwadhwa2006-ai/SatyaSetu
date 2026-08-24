"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Send,
  ClipboardCheck,
  BarChart3,
  ScrollText,
  Info,
} from "lucide-react";
import { useState } from "react";
import { ArchitectureModal } from "@/components/shared/architecture-modal";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const bidderNav: NavItem[] = [
  { label: "Dashboard", href: "/bidder", icon: LayoutDashboard },
  { label: "Available Tenders", href: "/bidder/tenders", icon: FileText },
  { label: "My Bids", href: "/bidder/bids", icon: Send },
];

const officerNav: NavItem[] = [
  { label: "Dashboard", href: "/officer", icon: LayoutDashboard },
  { label: "Tender Evaluations", href: "/officer/tenders", icon: ClipboardCheck },
  { label: "Reports", href: "/officer/reports", icon: BarChart3 },
  { label: "Audit Log", href: "/officer/audit", icon: ScrollText },
];

export function Sidebar() {
  const { role } = useAuth();
  const pathname = usePathname();
  const [architectureOpen, setArchitectureOpen] = useState(false);
  const navItems = role === "officer" ? officerNav : bidderNav;

  return (
    <>
      <aside className="hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)] w-56 shrink-0 border-r bg-white flex-col">
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/bidder" &&
                item.href !== "/officer" &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#1e3a5f]/10 text-[#1e3a5f]"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="border-t px-3 py-3 space-y-1">
          <button
            onClick={() => setArchitectureOpen(true)}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Info className="h-4 w-4 shrink-0" />
            System Architecture
          </button>
          <div className="px-3 py-2">
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              Prototype for SIH 2026
            </p>
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              v1.0.0-demo
            </p>
          </div>
        </div>
      </aside>
      <ArchitectureModal open={architectureOpen} onOpenChange={setArchitectureOpen} />
    </>
  );
}
