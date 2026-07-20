import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-[#dfe5d6]/60 blur-3xl" />
      <section className="relative mx-auto grid min-h-screen max-w-6xl content-center px-6 py-16">
        <div className="mb-14 font-heading text-3xl font-bold">Quill<span className="text-accent">.</span></div>
        <p className="mb-5 w-fit rounded-full border border-line bg-surface/60 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Made for unhurried thoughts</p>
        <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[1.02] text-ink sm:text-7xl lg:text-8xl">
          A softer place for <span className="italic text-accent">thoughtful</span> words.
        </h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-muted sm:text-xl">
          Write what matters, keep some thoughts close, and share the rest with people who still enjoy reading slowly.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link className="btn btn-primary px-6" href="/register">Start writing &mdash; it&apos;s free</Link>
          <Link className="btn btn-secondary px-6" href="/login">Welcome back</Link>
        </div>
        <div className="mt-16 flex items-center gap-3 text-sm text-muted"><span className="h-px w-10 bg-line" /> Your words, at your pace.</div>
      </section>
    </main>
  );
}
