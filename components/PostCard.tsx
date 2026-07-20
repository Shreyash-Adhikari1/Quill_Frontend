"use client";

import Link from "next/link";
import { useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Post } from "@/lib/types";
import { avatarOf, getId, postAuthor, postContent, postTitle } from "@/lib/normalizers";

export function PostCard({
  post,
  showActions = false,
  onDeleted,
}: {
  post: Post;
  showActions?: boolean;
  onDeleted?: (postId: string) => void;
}) {
  const { user } = useAuth();
  const author = postAuthor(post);
  const authorId = getId(author) || getId(post.userId);
  const ownProfile = Boolean(authorId && authorId === getId(user));
  const authorProfileHref = ownProfile
    ? "/profile"
    : author?.username
      ? `/profile/${author.username}`
      : "/profile";
  const postId = post._id || post.id || "";
  const [upvotes, setUpvotes] = useState(post.likeCount ?? 0);
  const [hasUpvoted, setHasUpvoted] = useState(Boolean(post.likedBy?.some((item) => getId(item) === getId(user))));
  const [downvotedFlash, setDownvotedFlash] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  async function vote(direction: "up" | "down") {
    if (!postId || isVoting) return;
    if (direction === "up" && hasUpvoted) return;
    if (direction === "down" && !hasUpvoted) return;
    setIsVoting(true);
    try {
      await api.post(`/post/${direction === "up" ? "like" : "unlike"}/${postId}`);
      setUpvotes((value) => direction === "up" ? value + 1 : Math.max(0, value - 1));
      setHasUpvoted(direction === "up");
      setDownvotedFlash(direction === "down");
    } finally {
      setIsVoting(false);
    }
  }

  async function deletePost() {
    if (!postId) return;
    await api.delete(`/post/delete/${postId}`);
    onDeleted?.(postId);
  }

  return (
    <article className="group relative rounded-[24px] border border-line/80 bg-surface/70 p-5 shadow-[0_1px_2px_rgba(63,51,39,.04)] transition duration-300 hover:-translate-y-0.5 hover:border-[#cdbdaf] hover:bg-surface hover:shadow-[0_18px_45px_rgba(72,57,42,.08)] sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-4 text-sm text-muted">
        <Link className="flex items-center gap-3 font-medium transition hover:text-accent" href={authorProfileHref}>
          {avatarOf(author) ? <img src={avatarOf(author)} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-surface" /> : <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-heading font-bold text-accent">{(author?.username || "W").slice(0, 1).toUpperCase()}</span>}
          <span className="text-ink">
            {/* SECURITY NOTE: username is user-generated content rendered by JSX text interpolation.
                React escapes it as text. NEVER use dangerouslySetInnerHTML for user content. */}
            {author?.username || "unknown writer"}
          </span>
        </Link>
        <span className="text-xs">{post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : ""}</span>
      </div>
      <Link href={`/post/${postId}`}>
        <h2 className="font-heading text-[1.65rem] font-semibold leading-tight text-ink transition group-hover:text-accent">
          {/* SECURITY NOTE: post titles are user-generated content rendered as escaped JSX text. */}
          {postTitle(post)}
        </h2>
        <p className="mt-3 line-clamp-3 leading-7 text-muted">
          {/* SECURITY NOTE: post content is user-generated content rendered as escaped JSX text. */}
          {postContent(post)}
        </p>
      </Link>
      <div className="mt-6 flex items-center gap-2 border-t border-line/70 pt-4">
        <button
          className={`grid h-9 w-9 place-items-center rounded-full border text-lg transition ${hasUpvoted ? "border-[#d69b86] bg-accent-soft text-accent" : "border-line text-muted hover:border-[#d69b86] hover:bg-accent-soft hover:text-accent"} disabled:opacity-70`}
          aria-label="Upvote post"
          disabled={isVoting || hasUpvoted}
          onClick={() => void vote("up")}
        >
          &uarr;
        </button>
        <button
          className={`grid h-9 w-9 place-items-center rounded-full border text-lg transition ${downvotedFlash ? "border-[#aeb99f] bg-[#e4e8dc] text-[#66705d]" : "border-line text-muted hover:border-[#aeb99f] hover:bg-[#e4e8dc] hover:text-[#66705d]"} disabled:opacity-70`}
          aria-label="Downvote post"
          disabled={isVoting || !hasUpvoted}
          onClick={() => void vote("down")}
        >
          &darr;
        </button>
        <p className="ml-1 text-sm font-medium text-muted">{upvotes} {upvotes === 1 ? "appreciation" : "appreciations"}</p>
      </div>
      {showActions ? (
        <div className="mt-4 flex gap-4 text-sm font-semibold">
          <Link className="text-accent" href={`/post/${postId}/edit`}>Edit</Link>
          <button className="text-red-700" onClick={() => void deletePost()}>Delete</button>
        </div>
      ) : null}
    </article>
  );
}
