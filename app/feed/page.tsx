"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import api from "@/lib/api";
import { listFrom, postContent, postTitle } from "@/lib/normalizers";
import type { Post } from "@/lib/types";
import { PostCard } from "@/components/PostCard";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";

export default function FeedPage() {
  const [tab, setTab] = useState<"all" | "following">("all");
  const [posts, setPosts] = useState<Post[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
  }, [tab]);

  useEffect(() => {
    let cancelled = false;
    const endpoint = tab === "all" ? "/post/posts" : "/post/posts/following";
    setIsLoading(true);
    void api.get(endpoint, { params: { page, limit: 10 } }).then((res) => {
      if (cancelled) return;
      const incoming = listFrom<Post>(res.data, ["posts", "data"]);
      setPosts((current) => {
        const combined = page === 1 ? incoming : [...current, ...incoming];
        return combined.filter((post, index, items) => items.findIndex((item) => (item._id || item.id) === (post._id || post.id)) === index);
      });
      setHasMore(incoming.length === 10);
    }).catch(() => {
      if (!cancelled && page === 1) setPosts([]);
      if (!cancelled) setHasMore(false);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, [page, tab]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isLoading) setPage((value) => value + 1);
    }, { rootMargin: "300px 0px" });
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => `${postTitle(post)} ${postContent(post)}`.toLowerCase().includes(needle));
  }, [posts, query]);

  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent">A quiet corner of the internet</p>
              <h1 className="font-heading text-4xl font-semibold sm:text-5xl">Notes for slow moments.</h1>
              <p className="mt-3 text-muted">Ideas, observations, and stories from thoughtful people.</p>
            </div>
            <input className="field sm:max-w-xs" aria-label="Search notes" placeholder="Search by word or idea..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-8 flex gap-2">
            <button className={`btn ${tab === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("all")}>All Posts</button>
            <button className={`btn ${tab === "following" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("following")}>Following</button>
          </div>
          <section className="mt-6 grid gap-4">
            {filtered.map((post) => <PostCard key={post._id || post.id} post={post} />)}
            {filtered.length === 0 ? <div className="surface-panel py-16 text-center"><p className="font-heading text-2xl">Nothing on this page yet.</p><p className="mt-2 text-muted">Try another search or begin a note of your own.</p></div> : null}
          </section>
          <div ref={loadMoreRef} className="grid min-h-24 place-items-center py-8" aria-live="polite">
            {isLoading ? <div className="flex items-center gap-3 text-sm text-muted"><span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Gathering more notes...</div> : null}
            {!hasMore && posts.length > 0 ? <p className="text-sm text-muted">You&apos;re all caught up.</p> : null}
          </div>
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
