import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

import { CopyIpButton } from "@/components/copy-ip-button";
import { IpDetailsSections } from "@/components/ip-details-sections";
import { PageSkeleton } from "@/components/page-skeleton";
import { PoweredByBadge } from "@/components/powered-by-badge";
import { getMyIpData } from "@/lib/ipgeolocation";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <IpLookupContent />
    </Suspense>
  );
}

async function IpLookupContent() {
  const result = await getMyIpData();

  if (!result.ok) {
    return (
      <main className="min-h-screen bg-stone-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
          <section className="rounded-[32px] border border-red-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-600">
              {result.error.title}
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
              Your IP details are not available right now.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {result.error.message}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/ip-lookup"
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <span className="whitespace-nowrap text-slate-900">Lookup Another IP</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-900" />
              </Link>
            </div>
          </section>
        </div>
        <PoweredByBadge />
      </main>
    );
  }

  const { data } = result;

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
                Automatic IP detection
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                {data.countryFlag ? (
                  <img
                    src={data.countryFlag}
                    alt={`${data.countryName} flag`}
                    className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                  />
                ) : null}
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {data.ip}
                </h1>
              </div>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                {data.countryName} {data.city !== "Unavailable" ? `• ${data.city}` : ""}
                {result.cached ? " • Loaded from your current session cache." : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <CopyIpButton ip={data.ip} />
              <Link
                href="/ip-lookup"
                className="inline-flex min-w-44 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <span className="whitespace-nowrap text-white">Lookup Another IP</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-white" />
              </Link>
            </div>
          </div>
        </section>

        <IpDetailsSections data={data} />
      </div>

      <PoweredByBadge />
    </main>
  );
}
