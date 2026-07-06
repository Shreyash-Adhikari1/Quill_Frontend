import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto grid min-h-screen max-w-5xl content-center px-6 py-16">
        <p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-accent">Quill</p>
        <h1 className="max-w-3xl font-heading text-5xl leading-tight text-ink sm:text-7xl">
          A quiet place for notes worth sharing.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
          Write brief essays, private drafts, and public notes in a calm social space built around words first.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/register">Create account</Link>
          <Link className="btn btn-secondary" href="/login">Log in</Link>
        </div>
      </section>
    </main>
  );
}
