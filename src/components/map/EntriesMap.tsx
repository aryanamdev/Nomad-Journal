"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import type { Entry } from "@/types/entry";
import { formatDate } from "@/lib/entryMeta";

// Plain CSS dots instead of Leaflet's default image markers, which break under bundlers.
export function dotIcon(color: string, active = false) {
  const size = active ? 22 : 16;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  const key = points.map((p) => p.join(",")).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) map.setView(points[0], 9);
    else map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 11 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

type Props = {
  entries: Entry[];
  colorFor: (entry: Entry) => string;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function EntriesMap({ entries, colorFor, selectedId, onSelect }: Props) {
  const located = useMemo(() => entries.filter((e) => e.location?.coordinates?.length === 2), [entries]);
  // GeoJSON stores [lng, lat]; Leaflet wants [lat, lng].
  const points = located.map((e) => [e.location!.coordinates[1], e.location!.coordinates[0]] as [number, number]);

  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom className="h-full w-full rounded-lg" worldCopyJump>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {located.map((entry, i) => (
        <Marker
          key={entry._id}
          position={points[i]}
          icon={dotIcon(colorFor(entry), entry._id === selectedId)}
          zIndexOffset={entry._id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(entry._id) }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            <strong>{entry.title}</strong>
            <br />
            {entry.placeName ? `${entry.placeName} · ` : ""}
            {formatDate(entry.entryDate)}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
