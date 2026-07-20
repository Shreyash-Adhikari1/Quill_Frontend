"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import api from "@/lib/api";
import { postSchema } from "@/lib/schemas";
import type { Post } from "@/lib/types";

type Input = z.infer<typeof postSchema>;

export function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<Input>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      postTitle: post?.postTitle || post?.title || post?.caption || "",
      postContent: post?.postContent || post?.content || "",
      visibility: post?.visibility === "private" || post?.isPrivate ? "private" : "public",
    },
  });

  async function onSubmit(values: Input) {
    // Client-side validation here is for UX ONLY; backend Zod schemas and auth checks remain authoritative.
    if (post?._id || post?.id) {
      await api.patch(`/post/edit/${post._id || post.id}`, values);
      router.push(`/post/${post._id || post.id}`);
    } else {
      const response = await api.post("/post/create", values);
      const created = response.data?.post || response.data?.data || response.data;
      router.push(created?._id ? `/post/${created._id}` : "/feed");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
      <input className="field border-0 bg-transparent px-1 font-heading text-3xl shadow-none placeholder:text-[#aaa095] focus:shadow-none" aria-label="Note title" placeholder="Give it a title…" {...register("postTitle")} />
      <textarea className="field min-h-80 border-0 bg-transparent px-1 text-lg leading-8 shadow-none placeholder:text-[#aaa095] focus:shadow-none" aria-label="Note content" placeholder="Start writing here…" {...register("postContent")} />
      <div className="h-px bg-line/80" />
      <label className="grid w-fit gap-2 text-sm text-muted">
        Visibility
        <select className="field w-auto py-2" {...register("visibility")}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </label>
      {Object.values(formState.errors).map((error) => <p key={error.message} className="text-sm text-red-700">{error.message}</p>)}
      <button className="btn btn-primary w-fit" disabled={formState.isSubmitting}>{post ? "Save changes" : "Publish note"}</button>
    </form>
  );
}
