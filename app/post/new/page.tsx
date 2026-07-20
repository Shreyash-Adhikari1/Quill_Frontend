import { PostForm } from "@/components/PostForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Shell } from "@/components/Shell";

export default function NewPostPage() {
  return (
    <ProtectedRoute>
      <Shell>
        <main className="mx-auto max-w-3xl px-5 py-10 sm:px-6 sm:py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-[.2em] text-accent">A fresh page</p>
          <h1 className="mb-3 font-heading text-4xl font-semibold sm:text-5xl">What’s on your mind?</h1>
          <p className="mb-8 text-muted">No pressure. Just begin with one honest sentence.</p>
          <div className="surface-panel p-5 sm:p-8">
          <PostForm />
          </div>
        </main>
      </Shell>
    </ProtectedRoute>
  );
}
