export default function BlogArticleLoading() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans relative pb-0">
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-purple-900/5 to-transparent rounded-b-[100%]" />
      </div>

      <article className="container mx-auto px-6 relative z-10 pt-36 lg:pt-44 pb-20 max-w-4xl">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="h-8 w-32 rounded-lg bg-slate-800 animate-pulse border border-slate-700" />
        </div>

        {/* Breadcrumb + meta skeleton */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="h-4 w-24 rounded bg-slate-700 animate-pulse" />
          <div className="flex items-center gap-4">
            <div className="h-6 w-20 rounded-md bg-slate-700 animate-pulse" />
            <div className="h-4 w-16 rounded bg-slate-700 animate-pulse" />
          </div>
        </div>

        {/* Title skeleton */}
        <div className="mb-12 space-y-4">
          <div className="h-10 w-full rounded-xl bg-slate-800 animate-pulse" />
          <div className="h-10 w-4/5 rounded-xl bg-slate-800 animate-pulse" />
        </div>

        {/* Hero image skeleton */}
        <div className="relative w-full h-64 md:h-96 rounded-[24px] overflow-hidden border border-slate-700 mb-12 bg-slate-800 animate-pulse" />

        {/* Content paragraphs skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-slate-800 animate-pulse" style={{ width: `${85 + (i % 3) * 5}%` }} />
          ))}
          <div className="h-8 w-1/2 rounded-xl bg-slate-800 animate-pulse mt-8" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 rounded bg-slate-800 animate-pulse" style={{ width: `${80 + (i % 4) * 4}%` }} />
          ))}
        </div>
      </article>
    </main>
  );
}
