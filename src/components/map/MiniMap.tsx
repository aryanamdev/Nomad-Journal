"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { dotIcon } from "./EntriesMap";
import { TILE_ATTRIBUTION, TILE_URL } from "./tiles";

/** A small, static map showing where one entry happened. */
export default function MiniMap({ lat, lng, color }: { lat: number; lng: number; color: string }) {
  return (
    <MapContainer
      key={`${lat},${lng}`}
      center={[lat, lng]}
      zoom={8}
      className="h-full w-full"
      zoomControl={false}
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      keyboard={false}
      attributionControl={false}
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <Marker position={[lat, lng]} icon={dotIcon(color, true)} interactive={false} />
    </MapContainer>
  );
}
