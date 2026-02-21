"use client";

import { useEffect, useState } from "react";
import type { InterestPoint, PointType } from "@/lib/types";

interface OpenStreetMapProps {
  centerLatitude: number;
  centerLongitude: number;
  points: InterestPoint[];
  selectedPointId?: number | null;
  onPointClick?: (pointId: number) => void;
  zoom?: number;
}

const POINT_TYPE_COLORS: Record<PointType, string> = {
  port: "#3b82f6",      // blue
  shop: "#f59e0b",      // amber
  food: "#ef4444",      // red
  attraction: "#8b5cf6", // violet
  beach: "#06b6d4",     // cyan
  trash: "#6b7280",     // gray
  shower: "#10b981",    // emerald
};

export function OpenStreetMap({
  centerLatitude,
  centerLongitude,
  points,
  selectedPointId,
  onPointClick,
  zoom = 14,
}: OpenStreetMapProps) {
  const [MapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    Marker: typeof import("react-leaflet").Marker;
    Popup: typeof import("react-leaflet").Popup;
    useMap: typeof import("react-leaflet").useMap;
  } | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([reactLeaflet, leaflet]) => {
      setMapComponents({
        MapContainer: reactLeaflet.MapContainer,
        TileLayer: reactLeaflet.TileLayer,
        Marker: reactLeaflet.Marker,
        Popup: reactLeaflet.Popup,
        useMap: reactLeaflet.useMap,
      });
      setL(leaflet.default);
    });
  }, []);

  if (!MapComponents || !L) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted rounded-lg">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup } = MapComponents;

  const createIcon = (type: PointType, isSelected: boolean) => {
    const color = POINT_TYPE_COLORS[type];
    const size = isSelected ? 28 : 22;
    const borderWidth = isSelected ? 4 : 3;

    return L.divIcon({
      className: "custom-marker",
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: ${borderWidth}px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        cursor: pointer;
        ${isSelected ? "transform: scale(1.15);" : ""}
      "></div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <>
      <style>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
        }
        .leaflet-popup-content {
          margin: 8px 12px;
        }
      `}</style>
      <MapContainer
        center={[centerLatitude, centerLongitude]}
        zoom={zoom}
        style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((point) => (
          <Marker
            key={point.id}
            position={[point.latitude, point.longitude]}
            icon={createIcon(point.type, point.id === selectedPointId)}
            eventHandlers={{
              click: () => onPointClick?.(point.id),
            }}
          >
            <Popup>
              <div className="text-sm">
                <strong>{point.translations.en.name || `Point #${point.id}`}</strong>
                <br />
                <span className="text-muted-foreground capitalize">{point.type}</span>
              </div>
            </Popup>
          </Marker>
        ))}
        <MapUpdater center={[centerLatitude, centerLongitude]} selectedPointId={selectedPointId} points={points} useMap={MapComponents.useMap} />
      </MapContainer>
    </>
  );
}

function MapUpdater({
  center,
  selectedPointId,
  points,
  useMap
}: {
  center: [number, number];
  selectedPointId?: number | null;
  points: InterestPoint[];
  useMap: typeof import("react-leaflet").useMap;
}) {
  const map = useMap();

  useEffect(() => {
    if (selectedPointId) {
      const point = points.find(p => p.id === selectedPointId);
      if (point) {
        map.flyTo([point.latitude, point.longitude], map.getZoom(), {
          duration: 0.5
        });
      }
    }
  }, [selectedPointId, points, map]);

  return null;
}
