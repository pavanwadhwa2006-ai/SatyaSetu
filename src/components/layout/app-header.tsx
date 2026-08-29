"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Shield,
  LogOut,
  Building2,
  LayoutDashboard,
  Menu,
  FileText,
  Send,
  ClipboardCheck,
  BarChart3,
  ScrollText,
  Info,
} from "lucide-react";
import { useState } from "react";
import { ArchitectureModal } from "@/components/shared/architecture-modal";
import { cn } from "@/lib/utils";

import { PreviousButton } from "@/components/shared/previous-button";

const bidderNav = [
  { label: "Dashboard", href: "/bidder", icon: LayoutDashboard },
  { label: "Available Tenders", href: "/bidder/tenders", icon: FileText },
  { label: "My Bids", href: "/bidder/bids", icon: Send },
];

const officerNav = [
  { label: "Dashboard", href: "/officer", icon: LayoutDashboard },
  { label: "Tender Evaluations", href: "/officer/tenders", icon: ClipboardCheck },
  { label: "Reports", href: "/officer/reports", icon: BarChart3 },
  { label: "Audit Log", href: "/officer/audit", icon: ScrollText },
];

export function AppHeader() {
  const { user, logout, role } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(false);

  const navItems = role === "officer" ? officerNav : bidderNav;

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
        <div className="flex h-14 items-center justify-between gap-2 px-3 sm:px-6">
          {/* Left: Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 md:hidden text-foreground shrink-0"
                      aria-label="Open Navigation Menu"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  }
                />
                <SheetContent side="left" className="w-[280px] p-0 flex flex-col bg-white">
                  <SheetHeader className="p-4 border-b text-left">
                    <SheetTitle className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 shrink-0">
                        <Image
                          src="/satyaseetu-logo.png"
                          alt="Satyaseetu Logo"
                          fill
                          sizes="32px"
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1e3a5f] leading-none">SatyaSetu</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Government Procurement</p>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  {/* User Profile in Drawer */}
                  {user && (
                    <div className="p-4 bg-muted/40 border-b space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{user.name}</p>
                        {user.role === "officer" ? (
                          <Badge variant="secondary" className="bg-[#1e3a5f]/10 text-[#1e3a5f] text-[10px] py-0">
                            Officer
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px] py-0">
                            Bidder
                          </Badge>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">{user.organization}</p>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
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
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

                  {/* Drawer Footer */}
                  <div className="border-t p-3 space-y-2">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setArchitectureOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Info className="h-4 w-4 shrink-0" />
                      System Architecture
                    </button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </Button>
                    <div className="px-3 pt-1 text-center">
                      <p className="text-[10px] text-muted-foreground/60">Prototype for SIH 2026</p>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            )}

            {/* Logo */}
            <Link
              href={user?.role === "officer" ? "/officer" : user ? "/bidder" : "/"}
              className="flex items-center gap-2 sm:gap-2.5"
            >
              <div className="relative h-8 w-8 shrink-0">
                <Image
                  src="/satyaseetu-logo.png"
                  alt="Satyaseetu Logo"
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-[#1e3a5f] leading-none">
                  SatyaSetu
                </span>
                <span className="text-[10px] text-muted-foreground leading-none mt-0.5 hidden xs:inline sm:inline">
                  Bid Compliance Verification
                </span>
              </div>
            </Link>

            {/* Officer Previous Site / Page Button */}
            {pathname.startsWith("/officer") && pathname !== "/officer" && (
              <div className="flex items-center ml-1 sm:ml-2 pl-1 sm:pl-2 border-l">
                <PreviousButton fallbackHref="/officer" className="h-7 px-2 text-xs" />
              </div>
            )}
          </div>

          {/* Right: Role, User info & Logout */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Role Badge & Portal Switcher */}
              {user.role === "officer" ? (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-[#1e3a5f]/10 text-[#1e3a5f] border-[#1e3a5f]/20 gap-1.5 font-medium text-xs px-2 py-0.5 sm:px-2.5 sm:py-1"
                  >
                    <LayoutDashboard className="h-3 w-3 shrink-0" />
                    <span className="hidden sm:inline">Procurement Officer</span>
                    <span className="sm:hidden">Officer</span>
                  </Badge>
                  <Link href="/bidder">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer">
                      Bidder Portal →
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5 font-medium text-xs px-2 py-0.5 sm:px-2.5 sm:py-1"
                  >
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="hidden sm:inline">Bidder Portal</span>
                    <span className="sm:hidden">Bidder</span>
                  </Badge>
                  <Link href="/officer">
                    <Button variant="outline" size="sm" className="h-7 px-2 text-[11px] font-semibold text-[#1e3a5f] bg-blue-50 border-blue-200 hover:bg-blue-100 cursor-pointer">
                      Officer Portal →
                    </Button>
                  </Link>
                </div>
              )}

              <div className="hidden sm:block h-5 w-px bg-border" />

              {/* User details */}
              <div className="hidden md:block text-right">
                <p className="text-xs font-medium leading-none truncate max-w-[140px]">{user.name}</p>
                <p className="text-[10px] text-muted-foreground leading-none mt-0.5 truncate max-w-[140px]">
                  {user.organization}
                </p>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors shrink-0"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </header>
      <ArchitectureModal open={architectureOpen} onOpenChange={setArchitectureOpen} />
    </>
  );
}
