import { MapPinned } from "lucide-react";

import { DetailCard } from "@/components/detail-card";
import { IpMap } from "@/components/ip-map";
import type { IpLookupData } from "@/lib/ip-types";

export function IpDetailsSections({ data }: { data: IpLookupData }) {
  const latitude = Number.parseFloat(data.latitude);
  const longitude = Number.parseFloat(data.longitude);
  const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

  const details = [
    { label: "Country", value: data.countryName },
    { label: "State / Region", value: data.stateOrRegion },
    { label: "City", value: data.city },
    { label: "Zipcode", value: data.zipcode },
    { label: "Latitude", value: data.latitude },
    { label: "Longitude", value: data.longitude },
    { label: "ISP", value: data.isp },
    { label: "Organization", value: data.organization },
    { label: "Connection Type", value: data.connectionType },
    {
      label: "Timezone",
      value: `${data.timezoneName} • ${formatDateTime(
        data.currentLocalTime,
        data.timezoneName,
      )}`,
    },
    {
      label: "Currency",
      value: [data.currencyName, data.currencyCode, data.currencySymbol]
        .filter(Boolean)
        .join(" • "),
    },
    { label: "Calling Code", value: data.callingCode },
  ];

  return (
    <>
      <section aria-labelledby="ip-details-heading">
        <div className="mb-4 flex items-center gap-2">
          <MapPinned className="h-5 w-5 text-emerald-700" />
          <h2 id="ip-details-heading" className="text-xl font-semibold text-slate-950">
            Geolocation details
          </h2>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {details.map((detail) => (
            <DetailCard key={detail.label} label={detail.label} value={detail.value} />
          ))}
        </dl>
      </section>

      <section aria-labelledby="map-heading">
        <div className="mb-4">
          <h2 id="map-heading" className="text-xl font-semibold text-slate-950">
            Approximate location
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Map tiles are provided by OpenStreetMap and centered on the latitude and
            longitude returned by the API.
          </p>
        </div>

        {hasCoordinates ? (
          <IpMap
            city={data.city}
            countryName={data.countryName}
            latitude={latitude}
            longitude={longitude}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-base text-slate-600">
              Map coordinates were not available for this lookup.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

function formatDateTime(value: string, timeZone: string) {
  const normalized = value
    .replace(" ", "T")
    .replace(/([+-]\d{2})(\d{2})$/, "$1:$2");
  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  try {
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "medium",
      timeZone,
    }).format(parsed);
  } catch {
    return value;
  }
}

