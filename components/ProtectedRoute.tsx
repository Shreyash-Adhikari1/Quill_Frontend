"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const { user, isLoading, refreshUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Route protection is based on /user/me because the JWT is httpOnly and
    // impossible to inspect in client code. The backend is the source of truth.
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    // If the backend later adds real email-verification routes, this is the place
    // to redirect unverified users. The current backend does not expose OTP
    // verification endpoints, so blocking here would trap every new account.
    if (adminOnly && user.role !== "admin") {
      router.replace("/feed");
    }
  }, [adminOnly, isLoading, router, user]);

  if (isLoading || !user || (adminOnly && user.role !== "admin")) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-muted">Checking your session...</main>;
  }

  return <>{children}</>;
}
