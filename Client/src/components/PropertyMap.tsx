import { AdvancedMarker, APIProvider, Map } from "@vis.gl/react-google-maps";
import { useState } from "react";
import type { Property } from "../types";

interface PropertyMapProps {
  properties: Property[];
}

function PropertyMap({ properties }: PropertyMapProps) {
  const defaultCenter = { lat: 18.6245, lng: -68.4820 }

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

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
          {properties.map((property) => {
            const isSelected = selectedPropertyId === property.id;

            return (
              <AdvancedMarker
                key={property.id}
                position={{ lat: property.latitude, lng: property.longitude }}
                onClick={() => setSelectedPropertyId(property.id)}
              >
                <div
                  className={`
                    font-bold py-1 px-3 rounded-full shadow-lg text-sm whitespace-nowrap text-center 
                    border transition-all duration-300 cursor-pointer
                    ${isSelected
                      ? 'bg-black text-white border-black scale-110 z-50'
                      : 'bg-base-100 border-base-300 hover:scale-105'
                    }
                  `}
                >
                  ${property.nightPrice}
                </div>
              </AdvancedMarker>
            );
          })}
        </Map>
      </div>
    </APIProvider>
  );
}

export default PropertyMap;