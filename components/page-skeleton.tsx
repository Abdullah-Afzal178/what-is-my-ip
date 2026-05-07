export function PageSkeleton() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="animate-pulse rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="h-5 w-40 rounded-full bg-slate-200" />
          <div className="mt-6 h-14 max-w-xl rounded-2xl bg-slate-200" />
          <div className="mt-4 h-5 max-w-2xl rounded-full bg-slate-100" />
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="h-11 w-32 rounded-full bg-slate-200" />
            <div className="h-11 w-44 rounded-full bg-slate-100" />
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="h-4 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-6 w-3/4 rounded-full bg-slate-100" />
            </div>
          ))}
        </section>

        <section className="animate-pulse rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="h-[320px] rounded-[20px] bg-slate-100" />
        </section>
      </div>
    </main>
  );
}

