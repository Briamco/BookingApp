import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
  disabled?: boolean;
}

const DEFAULT_CENTER = { lat: 18.4861, lng: -69.9312 };

function LocationPickerMap({ latitude, longitude, onLocationChange, disabled = false }: LocationPickerMapProps) {
  const hasValidLocation = Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);
  const markerPosition = hasValidLocation ? { lat: latitude, lng: longitude } : undefined;
  const [mapCenter, setMapCenter] = useState(markerPosition ?? DEFAULT_CENTER);

  useEffect(() => {
    setMapCenter(markerPosition ?? DEFAULT_CENTER);
  }, [latitude, longitude]);

  const handleMapClick = (event: any) => {
    if (disabled) return;

    const clicked = event?.detail?.latLng;
    if (!clicked || typeof clicked.lat !== "number" || typeof clicked.lng !== "number") return;

    onLocationChange(clicked.lat, clicked.lng);
  };

  const handleCameraChanged = (event: any) => {
    const nextCenter = event?.detail?.center;
    if (!nextCenter || typeof nextCenter.lat !== "number" || typeof nextCenter.lng !== "number") return;

    setMapCenter(nextCenter);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Location on map</label>
        <span className="text-xs text-gray-500">Click map to set coordinates</span>
      </div>

      <div className="h-56 w-full overflow-hidden rounded-xl border border-base-300">
        <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <Map
            defaultZoom={12}
            center={mapCenter}
            onClick={handleMapClick}
            onCameraChanged={handleCameraChanged}
            disableDefaultUI={true}
            zoomControl={true}
            gestureHandling="greedy"
            mapId="DEMO_MAP_ID"
          >
            {markerPosition ? <AdvancedMarker position={markerPosition} /> : null}
          </Map>
        </APIProvider>
      </div>
    </div>
  );
}

export default LocationPickerMap;
