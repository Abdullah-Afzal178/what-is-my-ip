"use client";

import dynamic from "next/dynamic";

type IpMapProps = {
  city: string;
  countryName: string;
  latitude: number;
  longitude: number;
  className?: string;
};

const IpMapCanvas = dynamic(
  () => import("@/components/ip-map-canvas").then((module) => module.IpMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[220px] items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
        <p className="text-sm font-medium text-slate-500">Loading map...</p>
      </div>
    ),
  },
);

export function IpMap(props: IpMapProps) {
  return <IpMapCanvas {...props} />;
}
