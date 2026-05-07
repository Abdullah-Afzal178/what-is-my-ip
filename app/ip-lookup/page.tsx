import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

import { CopyIpButton } from "@/components/copy-ip-button";
import { IpDetailsSections } from "@/components/ip-details-sections";
import { PoweredByBadge } from "@/components/powered-by-badge";
import { getIpDataByIp } from "@/lib/ipgeolocation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "IP Address Lookup — Free IP Lookup Tool",
  description:
    "Look up location, ISP, timezone, and network details for any public IPv4 or IPv6 address. Free tool powered by ipgeolocation.io.",
  alternates: {
    canonical: "/ip-lookup",
  },
};

type PageProps = {
  searchParams: Promise<{
    ip?: string | string[];
  }>;
};

export default async function IpLookupPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const rawIp = Array.isArray(params.ip) ? params.ip[0] : params.ip;
  const ip = rawIp?.trim() ?? "";
  const result = ip ? await getIpDataByIp(ip) : null;

  return (
    <main className="min-h-screen bg-stone-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
            Server-side IP search
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">
            IP Address Lookup tool
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
            Search any IPv4 or IPv6 address to view its geolocation, network,
            timezone, and currency details. Requests are made on the server so the API
            key stays private.
          </p>

          <form action="/ip-lookup" method="get" className="mt-8">
            <label htmlFor="ip" className="sr-only">
              IP address
            </label>
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input
                id="ip"
                name="ip"
                type="text"
                defaultValue={ip}
                placeholder="8.8.8.8 or 2606:4700:4700::1111"
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Search className="h-4 w-4 shrink-0 text-white" />
                <span className="whitespace-nowrap text-white">Lookup IP</span>
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-400 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-slate-900" />
              <span className="whitespace-nowrap text-slate-900">Use Your Current IP</span>
            </Link>
          </div>
        </section>

        {!ip ? (
          <section className="rounded-[32px] border border-dashed border-slate-300 bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-950">Start with an IP address</h2>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
              Enter any public IPv4 or IPv6 address above. The results page reuses the
              same data cards and map layout as the homepage.
            </p>
          </section>
        ) : null}

        {result && !result.ok ? (
          <section className="rounded-[32px] border border-red-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-red-600">
              {result.error.title}
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-slate-950">
              The lookup could not be completed.
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {result.error.message}
            </p>
          </section>
        ) : null}

        {result?.ok ? (
          <>
            <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-sky-700">
                    Lookup result
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    {result.data.countryFlag ? (
                      <img
                        src={result.data.countryFlag}
                        alt={`${result.data.countryName} flag`}
                        className="h-12 w-12 rounded-full border border-slate-200 object-cover"
                      />
                    ) : null}
                    <h2 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                      {result.data.ip}
                    </h2>
                  </div>
                  <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                    {result.data.countryName}
                    {result.data.city !== "Unavailable" ? ` • ${result.data.city}` : ""}
                    {result.cached ? " • Loaded from your current session cache." : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <CopyIpButton ip={result.data.ip} />
                </div>
              </div>
            </section>

            <IpDetailsSections data={result.data} />
          </>
        ) : null}
      </div>
      <PoweredByBadge />
    </main>
  );
}
