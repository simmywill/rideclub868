export default function BasicPage({ title, description }) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white sm:px-10 lg:px-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">rideclub868</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className="mt-4 text-slate-300">{description}</p>
        <a
          href="/"
          className="mt-8 inline-flex rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm transition hover:bg-white/20"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
