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
      <input className="field text-xl" placeholder="Title" {...register("postTitle")} />
      <textarea className="field min-h-80 leading-7" placeholder="Write your note..." {...register("postContent")} />
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
