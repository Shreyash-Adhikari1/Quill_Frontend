"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
        <main className="mx-auto max-w-3xl px-6 py-10">
          {!post ? <p className="text-muted">Loading note...</p> : (
            <article>
              <div className="flex items-center gap-3 text-sm text-muted">
                {avatarOf(author) ? <img src={avatarOf(author)} alt="" className="h-9 w-9 rounded-quill object-cover" /> : <span className="h-9 w-9 rounded-quill bg-accent-soft" />}
                <span>
                  {/* SECURITY NOTE: username/fullName is user-generated content rendered as escaped JSX text. */}
                  {author?.username || author?.fullName || "writer"}
                </span>
              </div>
              <h1 className="mt-3 font-heading text-5xl leading-tight">
                {/* SECURITY NOTE: post title is user-generated content rendered as escaped JSX text. */}
                {postTitle(post)}
              </h1>
              <p className="mt-8 whitespace-pre-wrap text-lg leading-9">
                {/* SECURITY NOTE: post content is user-generated content rendered as escaped JSX text.
                    React escapes it; NEVER use dangerouslySetInnerHTML for user-generated notes. */}
                {postContent(post)}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <button className={`grid h-11 w-11 place-items-center rounded-quill border text-xl transition ${hasUpvoted ? "border-rose-400 bg-rose-100 text-rose-700" : "border-line text-muted hover:border-rose-300 hover:text-rose-700"} disabled:opacity-70`} aria-label="Upvote post" disabled={isUpvoting || hasUpvoted} onClick={() => void vote("up")}>^</button>
                <button className={`grid h-11 w-11 place-items-center rounded-quill border text-xl transition ${downvotedFlash ? "border-sky-300 bg-sky-100 text-sky-700" : "border-line text-muted hover:border-sky-300 hover:text-sky-700"} disabled:opacity-70`} aria-label="Downvote post" disabled={isUpvoting || !hasUpvoted} onClick={() => void vote("down")}>v</button>
              </div>
              <p className="mt-2 text-sm text-muted">{post.likeCount ?? 0} upvotes</p>
              <CommentThread postId={params.id} />
            </article>
          )}
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
