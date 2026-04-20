import { AdvancedMarker } from "@vis.gl/react-google-maps"
import { List, MapIcon, StarIcon } from "lucide-react"
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
  const [showMap, setShowMap] = useState(false); // Mobile map toggle

  const location = searchParams.get("location");
  const guests = searchParams.get("guests") ?? searchParams.get("minCapcity");
  const hasFilters = Boolean(location || guests || searchParams.get("startDate") || searchParams.get("endDate"));

  useEffect(() => {
    const locationQuery = searchParams.get("location") ?? undefined;
    const guestsQuery = searchParams.get("guests") ?? searchParams.get("minCapcity");
    const minCapacity = guestsQuery && !Number.isNaN(Number(guestsQuery)) ? Number(guestsQuery) : undefined;
    const startDate = parseDate(searchParams.get("startDate"));
    const endDate = parseDate(searchParams.get("endDate"));

    fetchProperties(locationQuery, undefined, minCapacity, startDate, endDate);
  }, [fetchProperties, searchParams]);

  return (
    <main className="grid w-full gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,46%)] xl:gap-8">
      {/* Property List Section */}
      <section className={`min-w-0 space-y-6 ${showMap ? 'hidden lg:block' : 'block'}`}>
        <header className="relative overflow-hidden rounded-4xl border border-base-300 bg-linear-to-br from-base-100 via-base-100 to-base-200 p-6 shadow-lg sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-info/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

          <div className="relative space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wider text-base-content/70">
              <span className="badge badge-outline border-primary/30 text-primary">Explorer</span>
              {hasFilters ? <span className="badge badge-outline">Filtered search</span> : <span className="badge badge-outline">All stays</span>}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-4xl">Find your next destination</h1>
              <p className="text-sm text-base-content/70 sm:text-base">
                {properties.length} stay{properties.length === 1 ? "" : "s"} available
                {location ? ` in ${location}` : " right now"}.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {location ? <span className="badge badge-secondary badge-outline text-[10px] sm:text-xs">Location: {location}</span> : null}
              {guests ? <span className="badge badge-secondary badge-outline text-[10px] sm:text-xs">Guests: {guests}</span> : null}
            </div>
          </div>
        </header>

        {properties.length === 0 ? (
          <div className="grid min-h-64 place-items-center rounded-4xl border border-dashed border-base-300 bg-base-100/70 p-8 text-center shadow-sm">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">No properties found</h2>
              <p className="text-sm text-base-content/70">Try adjusting your filters to discover more stays.</p>
            </div>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2">
            {properties.map(property => (
              <li key={property.id} className="h-full">
                <PropertyCard property={property} onClick={() => navigate(`/property/${property.id}`)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Map Section */}
      <section className={`lg:sticky lg:top-24 lg:h-[calc(100vh-12rem)] ${showMap ? 'block fixed inset-0 z-30 lg:relative lg:inset-auto' : 'hidden lg:block'}`}>
        <div className="h-full w-full overflow-hidden lg:rounded-4xl border border-base-300 bg-base-100 shadow-2xl">
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
                        className="animate-map-popup-in w-64 sm:w-72 cursor-pointer overflow-hidden rounded-3xl border border-base-300 bg-base-100 text-left shadow-2xl"
                        onClick={(event) => {
                          event.stopPropagation();
                          navigate(`/property/${property.id}`);
                        }}
                      >
                        <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-base-200">
                          {mainImage ? (
                            <img
                              src={mainImage}
                              alt={property.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-xs text-base-content/60">
                              No image available
                            </div>
                          )}

                          <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral/55 via-transparent to-transparent" />

                          <div className="absolute right-3 top-3 rounded-full border border-base-100/40 bg-base-100/90 px-2 py-1 text-xs font-semibold text-base-content shadow-sm backdrop-blur">
                            <span className="inline-flex items-center gap-1.5">
                              <StarIcon className="h-3.5 w-3.5 text-warning" />
                              {property.averageRating.toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 p-3">
                          <p className="line-clamp-1 text-sm font-semibold leading-snug">{property.title}</p>
                          <p className="line-clamp-2 text-xs leading-snug text-base-content/70">{shortDescription}</p>

                          <div className="flex items-center justify-between border-t border-base-300 pt-2">
                            <p className="text-xs font-bold text-primary">${property.nightPrice} USD</p>
                            <span className="text-[10px] font-medium text-base-content/60">Details</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className={`
                      rounded-full border px-3 py-1 text-center text-sm font-bold whitespace-nowrap shadow-lg
                      transition-all duration-300 cursor-pointer
                      ${isSelected
                          ? 'animate-marker-pop z-50 scale-110 border-base-100 bg-primary text-base-100'
                          : 'border-base-300 bg-base-100/95 text-primary backdrop-blur hover:scale-105'
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

      {/* Floating Toggle Button (Mobile only) */}
      <button
        onClick={() => setShowMap(!showMap)}
        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 btn btn-neutral rounded-full shadow-2xl lg:hidden flex items-center gap-2 px-6"
      >
        {showMap ? (
          <>
            <span className="font-semibold">Show list</span>
            <List className="h-5 w-5" />
          </>
        ) : (
          <>
            <span className="font-semibold">Show map</span>
            <MapIcon className="h-5 w-5" />
          </>
        )}
      </button>
    </main>
  )
}

export default MainPage