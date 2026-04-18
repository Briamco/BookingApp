import { useNavigate } from "react-router"
import PropertyCard from "../components/PropertyCard"
import PropertyMap from "../components/PropertyMap"
import { useProperty } from "../hooks/useProperty"
import { AdvancedMarker } from "@vis.gl/react-google-maps"
import { useState } from "react"

function MainPage() {
  const { properties } = useProperty()
  const navigate = useNavigate()

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);


  return (
    <main className="mx-auto w-full max-w-600 px-4 py-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(420px,48%)] lg:gap-6">
      <section className="min-w-0 space-y-6">
        <header className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Found your next destination</h1>
          <p className="text-base-content/70">{properties.length} stays available</p>
        </header>

        <ul className="grid gap-6 sm:grid-cols-2">
          {properties.map(property => (
            <li key={property.id} className="h-full">
              <PropertyCard property={property} onClick={() => navigate(`/property/${property.id}`)} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 lg:mt-0 lg:sticky lg:top-6 lg:h-[calc(100vh-8rem)]">
        <div className="h-130 overflow-hidden rounded-4xl border border-base-300 bg-base-100 shadow-2xl lg:h-full">
          <PropertyMap>
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
          </PropertyMap>
        </div>
      </section>
    </main>
  )
}

export default MainPage