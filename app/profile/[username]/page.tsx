"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { listFrom } from "@/lib/normalizers";
import type { User } from "@/lib/types";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ProfileView } from "@/components/ProfileView";
import { Shell } from "@/components/Shell";

export default function OtherProfilePage() {
  const params = useParams<{ username: string }>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void api.get("/user/users").then((res) => {
      const users = listFrom<User>(res.data, ["users", "data"]);
      setUser(users.find((item) => item.username === params.username) || null);
    }).catch(() => setUser(null));
  }, [params.username]);

  return (
    <ProtectedRoute>
      <Shell>
        {user ? <ProfileView user={user} /> : <main className="mx-auto max-w-4xl px-6 py-10 text-muted">Loading profile...</main>}
      </Shell>
    </ProtectedRoute>
  );
}
