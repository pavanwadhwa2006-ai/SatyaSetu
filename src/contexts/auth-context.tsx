"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, UserRole } from "@/types";

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USERS: Record<UserRole, User> = {
  bidder: {
    id: "USR-001",
    name: "Rajesh Kumar Sharma",
    role: "bidder",
    organization: "ABC Engineering Pvt. Ltd.",
    designation: "Authorized Representative",
  },
  officer: {
    id: "USR-002",
    name: "Ananya Mehta",
    role: "officer",
    organization: "Government Procurement Department",
    designation: "Senior Procurement Officer",
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Restore session from localStorage or auto-detect from active route
  useEffect(() => {
    try {
      const savedRole = localStorage.getItem("satya_user_role") as UserRole | null;
      if (savedRole && MOCK_USERS[savedRole]) {
        setUser(MOCK_USERS[savedRole]);
      } else if (typeof window !== "undefined") {
        const pathname = window.location.pathname;
        if (pathname.startsWith("/officer")) {
          setUser(MOCK_USERS.officer);
          localStorage.setItem("satya_user_role", "officer");
        } else if (pathname.startsWith("/bidder")) {
          setUser(MOCK_USERS.bidder);
          localStorage.setItem("satya_user_role", "bidder");
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const login = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role]);
    try {
      localStorage.setItem("satya_user_role", role);
    } catch {
      // ignore storage errors
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem("satya_user_role");
    } catch {
      // ignore storage errors
    }
    router.push("/");
  }, [router]);

  const switchRole = useCallback((role: UserRole) => {
    setUser(MOCK_USERS[role]);
    try {
      localStorage.setItem("satya_user_role", role);
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isAuthenticated: !!user,
        login,
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
