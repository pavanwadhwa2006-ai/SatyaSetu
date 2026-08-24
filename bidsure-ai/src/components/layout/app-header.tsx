"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  LogOut,
  Building2,
  LayoutDashboard,
} from "lucide-react";

export function AppHeader() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-white">
      <div className="flex h-14 items-center gap-4 px-6">
        {/* Logo */}
        <Link href={user?.role === "officer" ? "/officer" : "/bidder"} className="flex items-center gap-2.5 mr-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1e3a5f]">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-[#1e3a5f] leading-none">
              BidSure AI
            </span>
            <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
              Bid Compliance Verification
            </span>
          </div>
        </Link>

        <div className="flex-1" />

        {/* Role Badge */}
        {user && (
          <div className="flex items-center gap-3">
            {user.role === "officer" ? (
              <Badge variant="secondary" className="bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20 gap-1.5 font-medium">
                <LayoutDashboard className="h-3 w-3" />
                Procurement Officer
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-medium">
                <Building2 className="h-3 w-3" />
                Bidder Portal
              </Badge>
            )}

            <div className="h-5 w-px bg-border" />

            <div className="text-right mr-1">
              <p className="text-xs font-medium leading-none">{user.name}</p>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                {user.organization}
              </p>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
