"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import api from "@/lib/api";
import type { User } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileView } from "@/components/ProfileView";
import { Shell } from "@/components/Shell";

export default function OtherProfilePage() {
  const params = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setUser(null);
    void api.get(`/user/username/${encodeURIComponent(params.username)}`).then((res) => {
      setUser((res.data?.user || null) as User | null);
    }).catch((err: unknown) => {
      setUser(null);
      const responseMessage = axios.isAxiosError(err) ? err.response?.data?.message : undefined;
      setError(responseMessage || "Could not load this profile.");
    });
  }, [params.username]);

  return (
    <ProtectedRoute>
      <Shell>
        {user ? <ProfileView user={user} /> : <main className="mx-auto max-w-4xl px-6 py-10 text-muted">{error || "Loading profile..."}</main>}
      </Shell>
    </ProtectedRoute>
  );
}
