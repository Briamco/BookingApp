import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

export interface LocationDetails {
  city: string;
  state: string;
  country: string;
}

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number, details?: LocationDetails) => void;
  disabled?: boolean;
}

const DEFAULT_CENTER = { lat: 18.4861, lng: -69.9312 };

function LocationPickerMap({ latitude, longitude, onLocationChange, disabled = false }: LocationPickerMapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const hasValidLocation = Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);
  const markerPosition = hasValidLocation ? { lat: latitude, lng: longitude } : undefined;
  const [mapCenter, setMapCenter] = useState(markerPosition ?? DEFAULT_CENTER);

  useEffect(() => {
    if (hasValidLocation) {
      setMapCenter({ lat: latitude, lng: longitude });
      return;
    }

    setMapCenter(DEFAULT_CENTER);
  }, [hasValidLocation, latitude, longitude]);

  const getAddressDetail = (components: Array<{ long_name: string; types: string[] }>, type: string) =>
    components.find((component) => component.types.includes(type))?.long_name;

  const resolveLocationDetails = async (lat: number, lng: number): Promise<LocationDetails | undefined> => {
    if (!apiKey) return undefined;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
      );
      if (!response.ok) return undefined;

      const payload: {
        status?: string;
        results?: Array<{
          address_components?: Array<{ long_name: string; types: string[] }>;
        }>;
      } = await response.json();

      if (payload.status !== "OK" || !payload.results?.length) return undefined;

      const components = payload.results[0].address_components ?? [];
      const city =
        getAddressDetail(components, "locality") ??
        getAddressDetail(components, "postal_town") ??
        getAddressDetail(components, "administrative_area_level_2") ??
        getAddressDetail(components, "sublocality") ??
        "";

      return {
        city,
        state: getAddressDetail(components, "administrative_area_level_1") ?? "",
        country: getAddressDetail(components, "country") ?? "",
      };
    } catch {
      return undefined;
    }
  };

  const handleMapClick = async (event: any) => {
    if (disabled) return;

    const clicked = event?.detail?.latLng;
    if (!clicked || typeof clicked.lat !== "number" || typeof clicked.lng !== "number") return;

    const details = await resolveLocationDetails(clicked.lat, clicked.lng);
    onLocationChange(clicked.lat, clicked.lng, details);
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
