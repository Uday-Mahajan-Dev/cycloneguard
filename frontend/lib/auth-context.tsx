"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { UserProfile, UserRole } from "./types";

interface AuthContextType {
  user: UserProfile | null;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  admin: {
    email: "admin@cycloneguard.in",
    role: "admin",
    name: "General V. K. Patnaik",
    title: "State Incident Commander",
    badge: "🔴 OSDMA Incident Command",
  },
  collector: {
    email: "collector.puri@cycloneguard.in",
    role: "collector",
    name: "Dr. Siddharth Swain, IAS",
    title: "District Magistrate & Collector",
    badge: "🟠 Puri District Administration",
    district: "Puri",
  },
  responder: {
    email: "field.team3@cycloneguard.in",
    role: "responder",
    name: "Commander Rajesh Nayak",
    title: "NDRF 3rd Battalion Chief",
    badge: "🟡 NDRF Fast-Response Unit",
    district: "Puri",
  },
  authority: {
    email: "collector.puri@cycloneguard.in",
    role: "authority",
    name: "Dr. Siddharth Swain, IAS",
    title: "District Magistrate & Collector",
    badge: "🟠 Puri District Administration",
    district: "Puri",
  },
  underwriter: {
    email: "analyst@insureco.in",
    role: "underwriter",
    name: "Dr. Elena Rostova",
    title: "Parametric Disaster Risk Lead",
    badge: "🟢 Munich Re / Swiss Re Syndicate",
  },
  analyst: {
    email: "analyst@insureco.in",
    role: "analyst",
    name: "Dr. Elena Rostova",
    title: "Parametric Disaster Risk Lead",
    badge: "🟢 Munich Re / Swiss Re Syndicate",
  },
};

const AuthContext = createContext<AuthContextType>({
  user: DEMO_PROFILES.admin,
  loginAsRole: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load from local storage or set default to Admin
    const stored = localStorage.getItem("cycloneguard_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(DEMO_PROFILES.admin);
      }
    } else {
      setUser(DEMO_PROFILES.admin);
      localStorage.setItem("cycloneguard_user", JSON.stringify(DEMO_PROFILES.admin));
    }
  }, []);

  const loginAsRole = (role: UserRole) => {
    const profile = DEMO_PROFILES[role];
    setUser(profile);
    localStorage.setItem("cycloneguard_user", JSON.stringify(profile));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("cycloneguard_user");
  };

  return (
    <AuthContext.Provider value={{ user, loginAsRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
