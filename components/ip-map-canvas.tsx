"use client";

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

type IpMapCanvasProps = {
  city: string;
  countryName: string;
  latitude: number;
  longitude: number;
  className?: string;
};

export function IpMapCanvas({
  city,
  countryName,
  latitude,
  longitude,
  className,
}: IpMapCanvasProps) {
  return (
    <div
      className={[
        "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm",
        className ?? "h-[320px]",
      ].join(" ")}
    >
      <MapContainer
        center={[latitude, longitude]}
        zoom={10}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[latitude, longitude]}
          radius={10}
          pathOptions={{
            color: "#0f172a",
            fillColor: "#2563eb",
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            {city}, {countryName}
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
