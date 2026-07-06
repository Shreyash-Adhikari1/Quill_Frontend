import { PostForm } from "@/components/PostForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";

export default function NewPostPage() {
  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-3xl px-6 py-10">
          <h1 className="mb-8 font-heading text-4xl">Write a note</h1>
          <PostForm />
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
