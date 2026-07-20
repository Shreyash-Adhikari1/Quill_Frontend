"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDiscover = pathname === "/feed" || (pathname.startsWith("/post/") && pathname !== "/post/new" && !pathname.endsWith("/edit"));
  const isProfile = pathname.startsWith("/profile");
  const isAdmin = pathname.startsWith("/admin");
  const isWriting = pathname === "/post/new" || pathname.endsWith("/edit");
  const desktopNavClass = (active: boolean) => `relative rounded-full px-4 py-2 transition ${active ? "bg-accent-soft text-accent shadow-[inset_0_0_0_1px_rgba(169,86,63,.08)]" : "hover:bg-accent-soft/60 hover:text-ink"}`;
  const mobileNavClass = (active: boolean) => `rounded-full px-4 py-2.5 transition ${active ? "bg-accent-soft text-accent" : "hover:bg-accent-soft/60"}`;

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/feed" className="group flex items-center gap-2.5 font-heading text-2xl font-bold text-ink" aria-label="Quill home">
            <span className="grid h-9 w-9 rotate-[-3deg] place-items-center rounded-full bg-accent text-surface transition-transform group-hover:rotate-3">Q</span>
            <span>Quill<span className="text-accent">.</span></span>
          </Link>
          <div className="hidden items-center gap-1 rounded-full border border-line/80 bg-surface/70 p-1.5 text-sm font-medium text-muted shadow-sm sm:flex">
            <Link className={desktopNavClass(isDiscover)} aria-current={isDiscover ? "page" : undefined} href="/feed">Discover</Link>
            <Link className={desktopNavClass(isProfile)} aria-current={isProfile ? "page" : undefined} href="/profile">My space</Link>
            {user?.role === "admin" ? <Link className={desktopNavClass(isAdmin)} aria-current={isAdmin ? "page" : undefined} href="/admin">Admin</Link> : null}
            <Link className={`btn btn-primary ml-1 min-h-9 px-4 py-1.5 ${isWriting ? "ring-4 ring-accent-soft" : ""}`} aria-current={isWriting ? "page" : undefined} href="/post/new">Write a note</Link>
            <button
              className="rounded-full px-3 py-2 text-muted transition hover:bg-accent-soft hover:text-accent"
              onClick={async () => {
                await logout();
                router.push("/login");
              }}
            >
              Log out
            </button>
          </div>
        </nav>
      </header>
      {children}
      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full border border-line bg-surface/95 p-1.5 text-xs font-semibold text-muted shadow-lg backdrop-blur-xl sm:hidden">
        <Link className={mobileNavClass(isDiscover)} aria-current={isDiscover ? "page" : undefined} href="/feed">Discover</Link>
        <Link className={`rounded-full px-5 py-2.5 transition ${isWriting ? "bg-accent text-surface shadow-sm" : "bg-accent-soft text-accent"}`} aria-current={isWriting ? "page" : undefined} href="/post/new">Write</Link>
        <Link className={mobileNavClass(isProfile)} aria-current={isProfile ? "page" : undefined} href="/profile">My space</Link>
        <button className="rounded-full px-3 py-2.5 hover:bg-accent-soft" onClick={async () => { await logout(); router.push("/login"); }}>Exit</button>
      </nav>
    </div>
  );
}
