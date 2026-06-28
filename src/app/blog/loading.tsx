export default function BlogLoading() {
  return (
    <main className="bg-transparent min-h-screen text-slate-800 dark:text-slate-200 font-sans relative pb-20">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[#0060aa]/5 dark:bg-[#0060aa]/10 rounded-full blur-[100px]" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-[#ff8b12]/5 dark:bg-[#ff8b12]/8 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10 pt-36 lg:pt-44">
        {/* Hero skeleton */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="h-12 w-3/4 mx-auto rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse border border-slate-300/40 dark:border-slate-700" />
          <div className="h-6 w-1/2 mx-auto rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse border border-slate-300/45 dark:border-slate-700" />
        </div>

        {/* Featured card skeleton */}
        <div className="mb-20 rounded-[24px] overflow-hidden bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 shadow-sm">
          <div className="flex flex-col lg:flex-row">
            <div className="w-full lg:w-1/2 h-64 bg-slate-200 dark:bg-slate-800 animate-pulse" />
            <div className="w-full lg:w-1/2 p-8 lg:p-12 space-y-4">
              <div className="h-4 w-1/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-8 w-3/4 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              <div className="h-10 w-36 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse mt-4" />
            </div>
          </div>
        </div>

        {/* Blog grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-[20px] bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 overflow-hidden shadow-sm">
              <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-5 w-full rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-5 w-4/5 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
                <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
