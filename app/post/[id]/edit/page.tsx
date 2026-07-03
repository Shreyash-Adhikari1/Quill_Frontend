"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { listFrom } from "@/lib/normalizers";
import type { Post } from "@/lib/types";
import { PostForm } from "@/components/PostForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";

export default function EditPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    void api.get("/post/posts/my-posts").then((res) => {
      const posts = listFrom<Post>(res.data, ["posts", "data"]);
      setPost(posts.find((item) => (item._id || item.id) === params.id) || null);
    }).catch(() => setPost(null));
  }, [params.id]);

  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="mb-8 font-heading text-4xl">Edit note</h1>
          {post ? <PostForm post={post} /> : <p className="text-muted">Loading note...</p>}
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
