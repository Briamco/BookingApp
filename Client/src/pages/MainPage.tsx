import { AdvancedMarker } from "@vis.gl/react-google-maps"
import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import PropertyCard from "../components/PropertyCard"
import PropertyMap from "../components/PropertyMap"
import { useProperty } from "../hooks/useProperty"

const parseDate = (value: string | null) => {
  if (!value) return undefined;

  // If it's in yyyy-mm-dd format, parse it directly to avoid timezone issues
  const dateMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  // Otherwise try to parse as ISO string
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return date;
};

function MainPage() {
  const { properties, fetchProperties } = useProperty()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams();

  const [selectedPropertyId, setSelectedPropertyId] = useState<number | null>(null);

  useEffect(() => {
    const location = searchParams.get("location") ?? undefined;
    const guests = searchParams.get("guests") ?? searchParams.get("minCapcity");
    const minCapacity = guests && !Number.isNaN(Number(guests)) ? Number(guests) : undefined;
    const startDate = parseDate(searchParams.get("startDate"));
    const endDate = parseDate(searchParams.get("endDate"));

    fetchProperties(location, undefined, minCapacity, startDate, endDate);
  }, [fetchProperties, searchParams]);

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
              const mainImage = property.images[0]?.url;
              const shortDescription = property.description.length > 90
                ? `${property.description.substring(0, 90)}...`
                : property.description;

              return (
                <AdvancedMarker
                  key={property.id}
                  position={{ lat: property.latitude, lng: property.longitude }}
                  onClick={() => setSelectedPropertyId((current) => (current === property.id ? null : property.id))}
                >
                  <div className="flex flex-col items-center gap-2">
                    {isSelected && (
                      <div
                        className="w-64 rounded-2xl border border-base-300 bg-base-100 p-3 text-left shadow-2xl"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/property/${property.id}`);
                        }}
                      >
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={property.title}
                            className="mb-2 h-28 w-full rounded-xl object-cover"
                          />
                        ) : (
                          <div className="mb-2 grid h-28 w-full place-items-center rounded-xl bg-base-200 text-xs text-base-content/60">
                            No image available
                          </div>
                        )}
                        <p className="text-sm font-semibold leading-snug">{property.title}</p>
                        <p className="mt-1 text-xs text-base-content/70 leading-snug">{shortDescription}</p>
                        <p className="mt-2 text-xs font-medium text-primary">From ${property.nightPrice} USD / night</p>
                      </div>
                    )}

                    <div
                      className={`
                      font-bold py-1 px-3 rounded-full shadow-lg text-sm whitespace-nowrap text-center 
                      border transition-all duration-300 cursor-pointer
                      ${isSelected
                          ? 'bg-primary text-base-100 border-base-100 scale-110 z-50'
                          : 'bg-base-100 border-base-300 text-primary hover:scale-105'
                        }
                    `}
                    >
                      ${property.nightPrice}
                    </div>
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