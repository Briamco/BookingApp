import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { type ReactNode } from "react";

interface PropertyMapProps {
  children: ReactNode | ReactNode[]
}

function PropertyMap({ children }: PropertyMapProps) {
  const defaultCenter = { lat: 18.6245, lng: -68.4820 }

  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <div className="w-full h-full min-h-125 rounded-4xl overflow-hidden shadow-md">
        <Map
          defaultZoom={10}
          defaultCenter={defaultCenter}
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