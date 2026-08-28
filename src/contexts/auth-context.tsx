"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";
import { supabase } from "@/lib/supabase";

export interface StaticUserAccount {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  dbRole: "PROCUREMENT_OFFICER" | "BIDDER";
  organization: string;
  designation: string;
  vendorDisplayName?: string;
  vendorLegalName?: string;
  vendorId?: string;
}

export const PRESET_ACCOUNTS: StaticUserAccount[] = [
  {
    id: "usr-officer-001",
    email: "officer@satyasetu.com",
    name: "Ananya Mehta",
    role: "officer",
    dbRole: "PROCUREMENT_OFFICER",
    organization: "Government Procurement Department",
    designation: "Senior Procurement Officer",
  },
  {
    id: "usr-bidder-001",
    email: "apex@satyasetu.com",
    name: "Apex Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "Apex Creative Solutions",
    designation: "Authorized Representative",
    vendorDisplayName: "Apex Creative Solutions",
    vendorLegalName: "Apex Creative Solutions Pvt. Ltd.",
  },
  {
    id: "usr-bidder-002",
    email: "astraedge@satyasetu.com",
    name: "AstraEdge Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "AstraEdge Technology",
    designation: "Authorized Representative",
    vendorDisplayName: "AstraEdge Technology",
    vendorLegalName: "AstraEdge Technology Pvt. Ltd.",
  },
  {
    id: "usr-bidder-003",
    email: "creovista@satyasetu.com",
    name: "CreoVista Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "CreoVista Digital Services",
    designation: "Authorized Representative",
    vendorDisplayName: "CreoVista Digital Services",
    vendorLegalName: "CreoVista Digital Services Pvt. Ltd.",
  },
  {
    id: "usr-bidder-004",
    email: "innovasphere@satyasetu.com",
    name: "InnovaSphere Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "InnovaSphere Technologies",
    designation: "Authorized Representative",
    vendorDisplayName: "InnovaSphere Technologies",
    vendorLegalName: "InnovaSphere Technologies Pvt. Ltd.",
  },
  {
    id: "usr-bidder-005",
    email: "nexora@satyasetu.com",
    name: "Nexora Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "Nexora Digital Consulting",
    designation: "Authorized Representative",
    vendorDisplayName: "Nexora Digital Consulting",
    vendorLegalName: "Nexora Digital Consulting Pvt. Ltd.",
  },
  {
    id: "usr-bidder-006",
    email: "nova@satyasetu.com",
    name: "Nova Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "Nova Media Services",
    designation: "Authorized Representative",
    vendorDisplayName: "Nova Media Services",
    vendorLegalName: "Nova Media Services Pvt. Ltd.",
  },
  {
    id: "usr-bidder-007",
    email: "pixelspring@satyasetu.com",
    name: "PixelSpring Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "PixelSpring Labs",
    designation: "Authorized Representative",
    vendorDisplayName: "PixelSpring Labs",
    vendorLegalName: "PixelSpring Labs Pvt. Ltd.",
  },
  {
    id: "usr-bidder-008",
    email: "vertex@satyasetu.com",
    name: "Vertex Representative",
    role: "bidder",
    dbRole: "BIDDER",
    organization: "Vertex Digital Solutions",
    designation: "Authorized Representative",
    vendorDisplayName: "Vertex Digital Solutions",
    vendorLegalName: "Vertex Digital Solutions Pvt. Ltd.",
  },
];

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  activeAccount: StaticUserAccount | null;
  vendorId: string | null;
  linkedVendor: { id?: string; display_name?: string; legal_name?: string } | null;
  login: (role: UserRole) => void;
  loginWithAccount: (email: string, password?: string) => Promise<{ success: boolean; role: UserRole; error?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [activeAccount, setActiveAccount] = useState<StaticUserAccount | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const router = useRouter();

  // Load linked vendor record from Supabase by user_id
  const fetchLinkedVendor = useCallback(async (userId: string, vendorDisplayName?: string) => {
    try {
      const { data: vendor } = await supabase
        .from("vendors")
        .select("id, legal_name, display_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (vendor?.id) {
        setVendorId(vendor.id);
        return vendor.id;
      }

      if (vendorDisplayName) {
        const { data: fallbackVendor } = await supabase
          .from("vendors")
          .select("id")
          .or(`display_name.eq.${vendorDisplayName},legal_name.ilike.%${vendorDisplayName}%`)
          .maybeSingle();

        if (fallbackVendor?.id) {
          setVendorId(fallbackVendor.id);
          return fallbackVendor.id;
        }
      }
    } catch (err) {
      console.warn("Could not fetch linked vendor from Supabase:", err);
    }
    return null;
  }, []);

  // Restore authenticated session from localStorage or active route
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("satya_active_email");
      const matched = PRESET_ACCOUNTS.find((a) => a.email === savedEmail);

      if (matched) {
        setActiveAccount(matched);
        setUser({
          id: matched.id,
          name: matched.name,
          role: matched.role,
          organization: matched.organization,
          designation: matched.designation,
        });

        if (matched.role === "bidder") {
          fetchLinkedVendor(matched.id, matched.vendorDisplayName);
        }
      } else {
        const savedRole = localStorage.getItem("satya_user_role") as UserRole | null;
        if (savedRole) {
          const fallbackAccount = PRESET_ACCOUNTS.find((a) => a.role === savedRole) || PRESET_ACCOUNTS[0];
          setActiveAccount(fallbackAccount);
          setUser({
            id: fallbackAccount.id,
            name: fallbackAccount.name,
            role: fallbackAccount.role,
            organization: fallbackAccount.organization,
            designation: fallbackAccount.designation,
          });
          if (fallbackAccount.role === "bidder") {
            fetchLinkedVendor(fallbackAccount.id, fallbackAccount.vendorDisplayName);
          }
        }
      }
    } catch {
      // ignore storage errors
    }
  }, [fetchLinkedVendor]);

  const loginWithAccount = useCallback(
    async (email: string, password?: string): Promise<{ success: boolean; role: UserRole; error?: string }> => {
      const matched = PRESET_ACCOUNTS.find((a) => a.email.toLowerCase() === email.toLowerCase());
      const account = matched || PRESET_ACCOUNTS[0];

      // Execute Supabase Auth signInWithPassword
      try {
        const { data: authData } = await supabase.auth.signInWithPassword({
          email: account.email,
          password: password || "Password123!",
        });

        if (authData?.user) {
          const authUserId = authData.user.id;

          // Fetch user_profiles.role
          const { data: profile } = await supabase
            .from("user_profiles")
            .select("role, full_name, organization, designation")
            .eq("id", authUserId)
            .maybeSingle();

          const dbRole = profile?.role || account.dbRole;
          const roleName: UserRole = dbRole === "PROCUREMENT_OFFICER" ? "officer" : "bidder";

          const updatedUser: User = {
            id: authUserId,
            name: profile?.full_name || account.name,
            role: roleName,
            organization: profile?.organization || account.organization,
            designation: profile?.designation || account.designation,
          };

          setUser(updatedUser);
          setActiveAccount({
            ...account,
            id: authUserId,
            name: updatedUser.name,
            role: roleName,
            dbRole: dbRole,
          });

          if (roleName === "bidder") {
            await fetchLinkedVendor(authUserId, account.vendorDisplayName);
          }

          localStorage.setItem("satya_active_email", account.email);
          localStorage.setItem("satya_user_role", roleName);
          return { success: true, role: roleName };
        }
      } catch (err) {
        console.warn("Supabase Auth sign in notice, applying static pre-created profile:", err);
      }

      // Pre-created static fallback profile
      const roleName = account.role;
      setUser({
        id: account.id,
        name: account.name,
        role: roleName,
        organization: account.organization,
        designation: account.designation,
      });
      setActiveAccount(account);

      if (roleName === "bidder") {
        await fetchLinkedVendor(account.id, account.vendorDisplayName);
      }

      try {
        localStorage.setItem("satya_active_email", account.email);
        localStorage.setItem("satya_user_role", roleName);
      } catch {
        // ignore storage errors
      }

      return { success: true, role: roleName };
    },
    [fetchLinkedVendor]
  );

  const login = useCallback(
    (role: UserRole) => {
      const account = PRESET_ACCOUNTS.find((a) => a.role === role) || PRESET_ACCOUNTS[0];
      setUser({
        id: account.id,
        name: account.name,
        role: account.role,
        organization: account.organization,
        designation: account.designation,
      });
      setActiveAccount(account);
      try {
        localStorage.setItem("satya_active_email", account.email);
        localStorage.setItem("satya_user_role", role);
      } catch {
        // ignore storage errors
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setActiveAccount(null);
    setVendorId(null);
    try {
      localStorage.removeItem("satya_active_email");
      localStorage.removeItem("satya_user_role");
    } catch {
      // ignore storage errors
    }
    supabase.auth.signOut().catch(() => {});
    router.push("/");
  }, [router]);

  const switchRole = useCallback((role: UserRole) => {
    const account = PRESET_ACCOUNTS.find((a) => a.role === role) || PRESET_ACCOUNTS[0];
    setUser({
      id: account.id,
      name: account.name,
      role: account.role,
      organization: account.organization,
      designation: account.designation,
    });
    setActiveAccount(account);
    try {
      localStorage.setItem("satya_active_email", account.email);
      localStorage.setItem("satya_user_role", role);
    } catch {
      // ignore storage errors
    }
  }, []);

  const linkedVendor = activeAccount?.vendorDisplayName
    ? {
        id: vendorId || activeAccount.vendorId,
        display_name: activeAccount.vendorDisplayName,
        legal_name: activeAccount.vendorLegalName,
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        activeAccount,
        vendorId,
        linkedVendor,
        login,
        loginWithAccount,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
