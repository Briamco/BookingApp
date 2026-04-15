import { useNavigate } from "react-router"
import PropertyCard from "../components/PropertyCard"
import PropertyMap from "../components/PropertyMap"
import { useProperty } from "../hooks/useProperty"

function MainPage() {
  const { properties } = useProperty()
  const navigate = useNavigate()

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
          <PropertyMap properties={properties} />
        </div>
      </section>
    </main>
  )
}

export default MainPage