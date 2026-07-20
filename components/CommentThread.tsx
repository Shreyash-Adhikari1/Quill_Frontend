"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { commentAuthor, commentContent, listFrom } from "@/lib/normalizers";
import type { Comment } from "@/lib/types";
import { hasStoredXssPayload, plainTextOnlyMessage } from "@/lib/xss";

const schema = z.object({
  commentText: z
    .string()
    .min(1, "Write a comment first")
    .max(2000, "Keep the comment under 2,000 characters")
    .refine((value) => !hasStoredXssPayload(value), plainTextOnlyMessage("Comment")),
});
type Input = z.infer<typeof schema>;

export function CommentThread({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState("");
  const { register, handleSubmit, reset, formState } = useForm<Input>({ resolver: zodResolver(schema) });

  const loadComments = useCallback(async () => {
    const response = await api.get(`/comment/post/${postId}`);
    setComments(listFrom<Comment>(response.data, ["comments", "data"]));
  }, [postId]);

  useEffect(() => {
    if (postId) void loadComments().catch(() => setComments([]));
  }, [loadComments, postId]);

  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; the backend still validates and authorizes comments.
    await api.post(`/comment/create/${postId}`, values);
    reset();
    setMessage("Comment added.");
    await loadComments();
  }

  return (
    <section className="mt-12 border-t border-line pt-8">
      <h2 className="font-heading text-3xl font-semibold">The conversation</h2>
      <p className="mt-1 text-sm text-muted">Add something kind, useful, or curious.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 grid gap-3">
        <textarea className="field min-h-28" placeholder="Leave a thoughtful response..." {...register("commentText")} />
        {formState.errors.commentText ? <p className="text-sm text-red-700">{formState.errors.commentText.message}</p> : null}
        <button className="btn btn-primary w-fit" disabled={formState.isSubmitting}>Comment</button>
        {message ? <p className="text-sm text-accent">{message}</p> : null}
      </form>
      <div className="mt-8 grid gap-5">
        {comments.map((comment) => {
          const author = commentAuthor(comment);
          return (
            <article key={comment._id || comment.id} className="rounded-quill border border-line/80 bg-surface/60 p-5">
              <p className="text-sm text-muted">
                {/* SECURITY NOTE: commenter username/fullName is user-generated content rendered as escaped JSX text. */}
                {author?.username || author?.fullName || "writer"}
              </p>
              <p className="mt-2 leading-7">
                {/* SECURITY NOTE: comment content is user-generated content rendered as escaped JSX text.
                    NEVER use dangerouslySetInnerHTML for comments. */}
                {commentContent(comment)}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
