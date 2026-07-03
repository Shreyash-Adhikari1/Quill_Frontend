"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import type { User } from "@/lib/types";

type LoginInput = { email: string; password: string };
type LoginResult = { user: User | null; requiresOtp: boolean };

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  login: (input: LoginInput & { captchaId?: string; captchaAnswer?: string }) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractUser(payload: unknown): User | null {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  return (record.user || record.data || record.profile || payload) as User;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      // The JWT is in an httpOnly cookie, so the frontend cannot and should not
      // read it. Login status is checked by asking the backend to read the cookie
      // server-side and return the current user, or 401 when unauthenticated.
      const response = await api.get("/user/me");
      const currentUser = extractUser(response.data);
      setUser(currentUser);
      return currentUser;
    } catch {
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (input: LoginInput & { captchaId?: string; captchaAnswer?: string }) => {
      // Never store JWTs or auth state in localStorage/sessionStorage. The backend
      // sets the httpOnly auth cookie, and the context only mirrors /user/me.
      const response = await api.post("/user/login", input);
      if (response.data?.requiresOtp) {
        setUser(null);
        return { user: null, requiresOtp: true };
      }
      const currentUser = await refreshUser();
      return { user: currentUser, requiresOtp: false };
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
    try {
      // Logout must hit the backend so it can clear the httpOnly cookie. Clearing
      // React state alone would leave the browser authenticated on later requests.
      await api.post("/user/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, login, logout, refreshUser }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
