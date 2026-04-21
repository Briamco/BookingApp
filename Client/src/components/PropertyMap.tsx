import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { type ReactNode } from "react";

interface PropertyMapProps {
  children?: ReactNode | ReactNode[]
  zoom?: number
  center?: { lat: number, lng: number }
}

function PropertyMap({ children, center, zoom }: PropertyMapProps) {
  const defaultCenter = { lat: 18.6245, lng: -68.4820 }
  const initialCenter = center ? center : defaultCenter;
  const initialZoom = zoom ? zoom : 10;

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="w-full h-full min-h-125 rounded-4xl overflow-hidden shadow-md">
        <Map
          key={`${initialCenter.lat}-${initialCenter.lng}-${initialZoom}`}
          defaultZoom={initialZoom}
          defaultCenter={initialCenter}
          mapId="DEMO_MAP_ID"
          disableDefaultUI={true}
          zoomControl={true}
        >
          {children}
        </Map>
      </div>
    </APIProvider>
  );
}

export default PropertyMap;