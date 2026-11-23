"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from "react-leaflet";
import type { Entry } from "@/types/entry";
import { formatDate } from "@/lib/entryMeta";
import { TILE_ATTRIBUTION, TILE_URL } from "./tiles";

// Plain CSS dots instead of Leaflet's default image markers, which break under bundlers.
export function dotIcon(color: string, active = false) {
  const size = active ? 20 : 14;
  const ring = active ? "0 0 0 3px #fbfcf8, 0 0 0 5px #2346c0" : "0 0 0 2.5px #fbfcf8, 0 1px 4px rgba(29,43,54,.45)";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};box-shadow:${ring}"></span>`,
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
    else map.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 10 });
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

const latLng = (e: Entry) => [e.location!.coordinates[1], e.location!.coordinates[0]] as [number, number];

export default function EntriesMap({ entries, colorFor, selectedId, onSelect }: Props) {
  const located = useMemo(() => entries.filter((e) => e.location?.coordinates?.length === 2), [entries]);
  const points = located.map(latLng);

  // One dashed route per journal, joining its places in date order.
  const routes = useMemo(() => {
    const byJournal = new Map<string, Entry[]>();
    for (const e of located) byJournal.set(e.journalId, [...(byJournal.get(e.journalId) ?? []), e]);
    return [...byJournal.values()]
      .filter((list) => list.length > 1)
      .map((list) => {
        const sorted = [...list].sort((a, b) => +new Date(a.entryDate) - +new Date(b.entryDate));
        return { id: sorted[0].journalId, color: colorFor(sorted[0]), positions: sorted.map(latLng) };
      });
  }, [located, colorFor]);

  return (
    <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom className="h-full w-full" worldCopyJump>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <FitBounds points={points} />
      {routes.map((r) => (
        <Polyline
          key={r.id}
          positions={r.positions}
          pathOptions={{ color: r.color, weight: 2.5, dashArray: "6 7", lineCap: "round", opacity: 0.9 }}
        />
      ))}
      {located.map((entry, i) => (
        <Marker
          key={entry._id}
          position={points[i]}
          icon={dotIcon(colorFor(entry), entry._id === selectedId)}
          zIndexOffset={entry._id === selectedId ? 1000 : 0}
          eventHandlers={{ click: () => onSelect(entry._id) }}
          keyboard
          title={entry.title}
        >
          <Tooltip direction="top" offset={[0, -10]} className="nj-tip">
            <strong style={{ fontWeight: 600 }}>{entry.title}</strong>
            <br />
            <span style={{ color: "#5b6c66", fontSize: 12 }}>
              {entry.placeName ? `${entry.placeName}, ` : ""}
              {formatDate(entry.entryDate)}
            </span>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
