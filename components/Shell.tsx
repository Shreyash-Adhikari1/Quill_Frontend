"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface/80">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/feed" className="font-heading text-2xl text-ink">
            Quill
          </Link>
          <div className="flex items-center gap-4 text-sm text-muted">
            <Link href="/feed">Feed</Link>
            <Link href="/post/new">Write</Link>
            <Link href="/profile">Profile</Link>
            {user?.role === "admin" ? <Link href="/admin">Admin</Link> : null}
            <button
              className="text-accent"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}
