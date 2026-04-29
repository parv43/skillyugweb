export default function BlogLoading() {
  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans relative pb-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-purple-900/5 to-transparent rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-36 lg:pt-44">
        {/* Hero skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="h-12 w-3/4 mx-auto rounded-xl bg-white/5 animate-pulse" />
          <div className="h-6 w-1/2 mx-auto rounded-lg bg-white/5 animate-pulse" />
        </div>

        {/* Featured card skeleton */}
        <div className="mb-20 rounded-[24px] overflow-hidden bg-white/[0.03] border border-white/10">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 h-64 bg-white/[0.05] animate-pulse" />
            <div className="w-full lg:w-1/2 p-8 lg:p-12 space-y-4">
              <div className="h-4 w-1/4 rounded bg-white/5 animate-pulse" />
              <div className="h-8 w-3/4 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
              <div className="h-10 w-36 rounded-full bg-white/5 animate-pulse mt-4" />
            </div>
          </div>
        </div>

        {/* Blog grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-[20px] bg-white/[0.03] border border-white/[0.08] overflow-hidden">
              <div className="w-full h-48 bg-white/[0.05] animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-1/3 rounded bg-white/5 animate-pulse" />
                <div className="h-5 w-full rounded-lg bg-white/5 animate-pulse" />
                <div className="h-5 w-4/5 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-4 w-full rounded bg-white/5 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
