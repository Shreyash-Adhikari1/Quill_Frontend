"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { avatarOf, getId, listFrom, postAuthor, postContent, postTitle } from "@/lib/normalizers";
import type { Post } from "@/lib/types";
import { CommentThread } from "@/components/CommentThread";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";
import { useAuth } from "@/context/AuthContext";

export default function SinglePostPage() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [downvotedFlash, setDownvotedFlash] = useState(false);

  useEffect(() => {
    void api.get("/post/posts").then((res) => {
      const posts = listFrom<Post>(res.data, ["posts", "data"]);
      const found = posts.find((item) => (item._id || item.id) === params.id) || null;
      setPost(found);
      setHasUpvoted(Boolean(found?.likedBy?.some((item) => getId(item) === getId(user))));
    }).catch(() => setPost(null));
  }, [params.id, user]);

  const author = post ? postAuthor(post) : undefined;
  const authorHref = author?.username ? `/profile/${author.username}` : "/profile";

  async function vote(direction: "up" | "down") {
    if (!post || isUpvoting) return;
    if (direction === "up" && hasUpvoted) return;
    if (direction === "down" && !hasUpvoted) return;
    setIsUpvoting(true);
    try {
      await api.post(`/post/${direction === "up" ? "like" : "unlike"}/${post._id || post.id}`);
      setPost({
        ...post,
        likeCount: direction === "up" ? (post.likeCount ?? 0) + 1 : Math.max(0, (post.likeCount ?? 0) - 1),
      });
      setHasUpvoted(direction === "up");
      setDownvotedFlash(direction === "down");
    } finally {
      setIsUpvoting(false);
    }
  }

  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-5xl px-5 py-8 sm:px-6 sm:py-14">
          {!post ? <div className="surface-panel animate-pulse p-8 sm:p-14"><div className="h-10 w-40 rounded-full bg-accent-soft" /><div className="mt-8 h-14 max-w-xl rounded-quill bg-line/50" /><div className="mt-8 h-40 rounded-quill bg-line/30" /></div> : (
            <article className="overflow-hidden rounded-[28px] border border-line/80 bg-surface/80 shadow-[0_24px_70px_rgba(72,57,42,.09)]">
              <header className="border-b border-line/70 bg-gradient-to-br from-[#fffaf2] via-surface to-[#f1eee5] px-6 py-8 sm:px-12 sm:py-11 lg:px-16">
                <div className="mb-8 flex items-center justify-between gap-4">
                  <Link href="/feed" className="group flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-accent"><span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">&larr;</span> Back to notes</Link>
                  {post.visibility ? <span className="rounded-full border border-line bg-surface/70 px-3 py-1.5 text-xs font-semibold capitalize text-muted">{post.visibility} note</span> : null}
                </div>
                <Link href={authorHref} className="group flex w-fit items-center gap-3 text-sm font-medium text-muted">
                  {avatarOf(author) ? <img src={avatarOf(author)} alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-surface shadow-sm" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-accent-soft font-heading font-bold text-accent">{(author?.username || author?.fullName || "Q").slice(0, 1).toUpperCase()}</span>}
                  <span className="grid gap-0.5">
                    <strong className="font-semibold text-ink transition group-hover:text-accent">
                  {/* SECURITY NOTE: username/fullName is user-generated content rendered as escaped JSX text. */}
                  {author?.username || author?.fullName || "writer"}
                    </strong>
                    <span className="text-xs">{post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : ""}</span>
                  </span>
                </Link>
              <h1 className="mt-8 max-w-3xl font-heading text-4xl font-semibold leading-[1.06] sm:text-6xl lg:text-7xl">
                {/* SECURITY NOTE: post title is user-generated content rendered as escaped JSX text. */}
                {postTitle(post)}
              </h1>
              </header>
              <div className="px-6 py-9 sm:px-12 sm:py-12 lg:px-16">
              <p className="mx-auto max-w-3xl whitespace-pre-wrap text-[1.08rem] leading-9 text-[#403b35] sm:text-xl sm:leading-10">
                {/* SECURITY NOTE: post content is user-generated content rendered as escaped JSX text.
                    React escapes it; NEVER use dangerouslySetInnerHTML for user-generated notes. */}
                {postContent(post)}
              </p>
              <div className="mx-auto mt-12 flex max-w-3xl items-center gap-2 border-t border-line/70 pt-6">
                <button className={`grid h-11 w-11 place-items-center rounded-full border text-xl transition ${hasUpvoted ? "border-[#d69b86] bg-accent-soft text-accent" : "border-line text-muted hover:border-[#d69b86] hover:bg-accent-soft hover:text-accent"} disabled:opacity-70`} aria-label="Appreciate post" disabled={isUpvoting || hasUpvoted} onClick={() => void vote("up")}>&uarr;</button>
                <button className={`grid h-11 w-11 place-items-center rounded-full border text-xl transition ${downvotedFlash ? "border-[#aeb99f] bg-[#e4e8dc] text-[#66705d]" : "border-line text-muted hover:border-[#aeb99f] hover:bg-[#e4e8dc] hover:text-[#66705d]"} disabled:opacity-70`} aria-label="Remove appreciation" disabled={isUpvoting || !hasUpvoted} onClick={() => void vote("down")}>&darr;</button>
                <p className="ml-2 text-sm font-medium text-muted">{post.likeCount ?? 0} {(post.likeCount ?? 0) === 1 ? "appreciation" : "appreciations"}</p>
              </div>
              <div className="mx-auto max-w-3xl"><CommentThread postId={params.id} /></div>
              </div>
            </article>
          )}
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
