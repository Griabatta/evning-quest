"use client";

import { useCallback, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  Polyline,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { landmarks, landmarkCategories, mapCenter, mapZoom } from "@/lib/data";

interface MapInnerProps {
  selectedLandmarkId: string | null;
  customMarker: [number, number] | null;
  onSelectLandmark: (id: string) => void;
  onPlaceMarker: (coords: [number, number]) => void;
  currentPosition: [number, number] | null;
  travelledPath: [number, number][];
  targetCoords: [number, number] | null;
  isTracking: boolean;
  userLocation: [number, number];
  geoCoords: [number, number] | null;
}

function MapClickHandler({
  onPlaceMarker,
  onSelectLandmark,
  hasSelected,
}: {
  onPlaceMarker: (coords: [number, number]) => void;
  onSelectLandmark: (id: string | null) => void;
  hasSelected: boolean;
}) {
  useMapEvents({
    click(e) {
      if (hasSelected) {
        onSelectLandmark(null);
      }
      onPlaceMarker([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

function MapCenterUpdater({
  userLocation,
}: {
  userLocation: [number, number];
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(userLocation, map.getZoom());
  }, [map, userLocation]);
  return null;
}

export default function MapInner({
  selectedLandmarkId,
  customMarker,
  onSelectLandmark,
  onPlaceMarker,
  currentPosition,
  travelledPath,
  targetCoords,
  isTracking,
  userLocation,
  geoCoords,
}: MapInnerProps) {
  const handleLandmarkClick = useCallback(
    (id: string) => {
      onSelectLandmark(id);
    },
    [onSelectLandmark]
  );

  const handleMapClick = useCallback(
    (coords: [number, number]) => {
      onPlaceMarker(coords);
    },
    [onPlaceMarker]
  );

  const handleSelectLandmarkNull = useCallback(
    (_id: string | null) => {
      onSelectLandmark("");
    },
    [onSelectLandmark]
  );

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-amber-200/60 shadow-lg">
      <div className="absolute inset-0 pointer-events-none z-[1000] bg-gradient-to-t from-amber-900/5 to-transparent" />
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full w-full [&_.leaflet-tile-pane]:brightness-105 [&_.leaflet-tile-pane]:saturate-[1.15]"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler
          onPlaceMarker={handleMapClick}
          onSelectLandmark={handleSelectLandmarkNull}
          hasSelected={!!selectedLandmarkId || !!customMarker}
        />
        <MapCenterUpdater userLocation={userLocation} />
        {landmarks.map((landmark) => {
          const cat = landmarkCategories[landmark.category];
          const isSelected = selectedLandmarkId === landmark.id;
          return (
            <CircleMarker
              key={landmark.id}
              center={landmark.coordinates}
              radius={isSelected ? 16 : 12}
              pathOptions={{
                color: cat.color,
                weight: isSelected ? 4 : 3,
                fillColor: cat.color,
                fillOpacity: isSelected ? 0.8 : 0.6,
              }}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleLandmarkClick(landmark.id);
                },
              }}
            >
              <Popup>
                <div className="min-w-[160px] font-sans">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                    <span>{cat.icon}</span>
                    <span>{landmark.name}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {landmark.description}
                  </p>
                  <span
                    className="mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: cat.color + "20",
                      color: cat.color,
                    }}
                  >
                    {cat.label}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        {customMarker && (
          <CircleMarker
            center={customMarker}
            radius={14}
            pathOptions={{
              color: "#dc2626",
              weight: 4,
              fillColor: "#dc2626",
              fillOpacity: 0.7,
            }}
          >
            <Popup>
              <div className="min-w-[160px] font-sans">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                  <span>📌</span>
                  <span>Произвольная метка</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ваша выбранная цель
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )}
        {isTracking && travelledPath.length > 1 && (
          <Polyline
            positions={travelledPath}
            pathOptions={{
              color: "#d97706",
              weight: 4,
              opacity: 0.8,
            }}
          />
        )}
        {isTracking && currentPosition && targetCoords && (
          <Polyline
            positions={[currentPosition, targetCoords]}
            pathOptions={{
              color: "#d97706",
              weight: 3,
              opacity: 0.4,
              dashArray: "10 10",
            }}
          />
        )}
        {!isTracking && geoCoords && (
          <CircleMarker
            center={geoCoords}
            radius={10}
            pathOptions={{
              color: "#0284c7",
              weight: 3,
              fillColor: "#38bdf8",
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="min-w-[160px] font-sans">
                <div className="text-sm font-semibold text-amber-900">
                  Вы здесь
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ваше текущее местоположение
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )}
        {isTracking && currentPosition && (
          <CircleMarker
            center={currentPosition}
            radius={10}
            pathOptions={{
              color: "#0284c7",
              weight: 3,
              fillColor: "#38bdf8",
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div className="min-w-[160px] font-sans">
                <div className="text-sm font-semibold text-amber-900">
                  Вы здесь
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ваше текущее местоположение
                </p>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
