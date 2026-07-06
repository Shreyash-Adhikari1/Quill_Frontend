"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileView } from "@/components/ProfileView";
import { Shell } from "@/components/Shell";
import { useAuth } from "@/context/AuthContext";

export default function OwnProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Shell>
        {user ? <ProfileView user={user} own /> : <main className="mx-auto max-w-4xl px-6 py-10 text-muted">Loading profile...</main>}
      </Shell>
    </ProtectedRoute>
  );
}
