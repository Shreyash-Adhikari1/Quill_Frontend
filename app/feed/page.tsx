"use client";

import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    const endpoint = tab === "all" ? "/post/posts" : "/post/posts/following";
    void api.get(endpoint, { params: { page, search: query } }).then((res) => setPosts(listFrom<Post>(res.data, ["posts", "data"]))).catch(() => setPosts([]));
  }, [page, query, tab]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    if (!needle) return posts;
    return posts.filter((post) => `${postTitle(post)} ${postContent(post)}`.toLowerCase().includes(needle));
  }, [posts, query]);

  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-heading text-4xl">Notes</h1>
              <p className="mt-2 text-muted">Read what the community is writing.</p>
            </div>
            <input className="field sm:max-w-xs" placeholder="Search posts" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-6 flex gap-2">
            <button className={`btn ${tab === "all" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("all")}>All Posts</button>
            <button className={`btn ${tab === "following" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("following")}>Following</button>
          </div>
          <section className="mt-4">
            {filtered.map((post) => <PostCard key={post._id || post.id} post={post} />)}
            {filtered.length === 0 ? <p className="py-12 text-muted">No posts found.</p> : null}
          </section>
          <div className="mt-8 flex items-center justify-between">
            <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
            <span className="text-sm text-muted">Page {page}</span>
            <button className="btn btn-secondary" onClick={() => setPage((value) => value + 1)}>Next</button>
          </div>
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
