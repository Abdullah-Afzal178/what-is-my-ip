import { POWERED_BY_URL } from "@/lib/constants";

export function PoweredByBadge() {
  return (
    <footer className="border-t border-slate-200 py-6">
      <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
        <a
          href={POWERED_BY_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950"
        >
          Powered by ipgeolocation.io
        </a>
      </div>
    </footer>
  );
}

