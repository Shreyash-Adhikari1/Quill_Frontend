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
    <article className="border-b border-line py-6">
      <div className="mb-2 flex items-center justify-between gap-4 text-sm text-muted">
        <Link className="flex items-center gap-2" href={authorProfileHref}>
          {avatarOf(author) ? <img src={avatarOf(author)} alt="" className="h-7 w-7 rounded-quill object-cover" /> : <span className="h-7 w-7 rounded-quill bg-accent-soft" />}
          <span>
            {/* SECURITY NOTE: username is user-generated content rendered by JSX text interpolation.
                React escapes it as text. NEVER use dangerouslySetInnerHTML for user content. */}
            {author?.username || "unknown writer"}
          </span>
        </Link>
        <span>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : ""}</span>
      </div>
      <Link href={`/post/${postId}`}>
        <h2 className="font-heading text-2xl text-ink">
          {/* SECURITY NOTE: post titles are user-generated content rendered as escaped JSX text. */}
          {postTitle(post)}
        </h2>
        <p className="mt-3 line-clamp-3 leading-7 text-muted">
          {/* SECURITY NOTE: post content is user-generated content rendered as escaped JSX text. */}
          {postContent(post)}
        </p>
      </Link>
      <div className="mt-5 flex items-center gap-3">
        <button
          className={`grid h-10 w-10 place-items-center rounded-quill border text-xl transition ${hasUpvoted ? "border-rose-400 bg-rose-100 text-rose-700" : "border-line text-muted hover:border-rose-300 hover:text-rose-700"} disabled:opacity-70`}
          aria-label="Upvote post"
          disabled={isVoting || hasUpvoted}
          onClick={() => void vote("up")}
        >
          ^
        </button>
        <button
          className={`grid h-10 w-10 place-items-center rounded-quill border text-xl transition ${downvotedFlash ? "border-sky-300 bg-sky-100 text-sky-700" : "border-line text-muted hover:border-sky-300 hover:text-sky-700"} disabled:opacity-70`}
          aria-label="Downvote post"
          disabled={isVoting || !hasUpvoted}
          onClick={() => void vote("down")}
        >
          v
        </button>
      </div>
      <p className="mt-2 text-sm text-muted">{upvotes} upvotes</p>
      {showActions ? (
        <div className="mt-4 flex gap-3 text-sm">
          <Link className="text-accent" href={`/post/${postId}/edit`}>Edit</Link>
          <button className="text-red-700" onClick={() => void deletePost()}>Delete</button>
        </div>
      ) : null}
    </article>
  );
}
