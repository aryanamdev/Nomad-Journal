"use client";

import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import { dotIcon } from "./EntriesMap";
import { LABELS_URL, MAX_ZOOM, TILE_ATTRIBUTION, TILE_URL } from "./tiles";

type LatLng = { lat: number; lng: number };

function ClickHandler({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }) });
  return null;
}

function Recenter({ value }: { value: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.setView([value.lat, value.lng], Math.max(map.getZoom(), 8));
    // Only follow external changes such as "use my location".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);
  return null;
}

export default function LocationPicker({ value, onChange }: { value: LatLng | null; onChange: (p: LatLng) => void }) {
  return (
    <MapContainer
      maxZoom={MAX_ZOOM}
      center={value ? [value.lat, value.lng] : [25, 10]}
      zoom={value ? 8 : 1}
      scrollWheelZoom
      className="h-full w-full"
      worldCopyJump
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} maxZoom={MAX_ZOOM} />
      <TileLayer url={LABELS_URL} maxZoom={MAX_ZOOM} />
      <ClickHandler onPick={onChange} />
      <Recenter value={value} />
      {value && <Marker position={[value.lat, value.lng]} icon={dotIcon("#2346c0", true)} />}
    </MapContainer>
  );
}
