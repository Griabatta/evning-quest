"use client";

import {
  MapContainer,
  TileLayer,
  Polyline,
  CircleMarker,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface HistoryMapDetailProps {
  fromLat: number;
  fromLng: number;
  toLat: number;
  toLng: number;
  travelledPath: [number, number][];
}

export default function HistoryMapDetail({
  fromLat,
  fromLng,
  toLat,
  toLng,
  travelledPath,
}: HistoryMapDetailProps) {
  const center: [number, number] = [
    (fromLat + toLat) / 2,
    (fromLng + toLng) / 2,
  ];

  return (
    <div className="h-64 w-full overflow-hidden rounded-lg border border-amber-200/60">
      <MapContainer
        center={center}
        zoom={15}
        className="h-full w-full [&_.leaflet-tile-pane]:brightness-105 [&_.leaflet-tile-pane]:saturate-[1.15]"
        scrollWheelZoom={false}
        dragging={false}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {travelledPath.length > 1 && (
          <Polyline
            positions={travelledPath}
            pathOptions={{
              color: "#d97706",
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
        <CircleMarker
          center={[fromLat, fromLng]}
          radius={8}
          pathOptions={{
            color: "#16a34a",
            weight: 3,
            fillColor: "#22c55e",
            fillOpacity: 0.8,
          }}
        >
          <Popup>
            <div className="text-xs font-medium">Старт</div>
          </Popup>
        </CircleMarker>
        <CircleMarker
          center={[toLat, toLng]}
          radius={8}
          pathOptions={{
            color: "#dc2626",
            weight: 3,
            fillColor: "#ef4444",
            fillOpacity: 0.8,
          }}
        >
          <Popup>
            <div className="text-xs font-medium">Цель</div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
