import CreatePropertyDialog from "../components/dialogs/CreatePropertyDialog"
import { useProperty } from "../hooks/useProperty"

function MyPropertiesPage() {
  const { properties, createProperty } = useProperty()

  return (
    <main>
      <header className="flex justify-between">
        <h1>My Properties</h1>
        <CreatePropertyDialog onCreate={createProperty} />
      </header>
      {properties.length === 0 ? (
        <p>You have no properties yet. Click "New Property" to create one.</p>
      ) : (
        <ul>
          {properties.map(property => (
            <li key={property.id}>{property.title}</li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default MyPropertiesPage