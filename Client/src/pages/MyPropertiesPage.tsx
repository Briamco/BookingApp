import { useMemo, useState } from "react"
import CreatePropertyDialog from "../components/dialogs/CreatePropertyDialog"
import EditPropertyDialog from "../components/dialogs/EditPropertyDialog"
import PropertyCard from "../components/PropertyCard"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import { useProperty } from "../hooks/useProperty"
import type { PropertyDatail } from "../types"
import BlockDatesDialog from "../components/dialogs/BlockDatesDialog"

function MyPropertiesPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const { properties, createProperty, updateProperty, addPropertyImages, reorderPropertyImages, removePropertyImages, fetchProperties, getPropertyById, blockPropertyDates } = useProperty()

  const [blockProperty, setBlockProperty] = useState<PropertyDatail | null>(null)
  const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false)

  const userProperties = useMemo(() => {
    if (!user) return []

    const currentUserId = user.id.toLowerCase()
    return properties.filter((property) => property.hostId.toLowerCase() === currentUserId)
  }, [properties, user])

  const handleCreateProperty = async (...args: Parameters<typeof createProperty>) => {
    await createProperty(...args)
    await fetchProperties()
  }

  const handleEditProperty = async (...args: Parameters<typeof updateProperty>) => {
    const message = await updateProperty(...args)
    await fetchProperties()
    return message
  }

  const handleAddPropertyImages = async (...args: Parameters<typeof addPropertyImages>) => {
    await addPropertyImages(...args)
    await fetchProperties()
  }

  const handleReorderPropertyImages = async (...args: Parameters<typeof reorderPropertyImages>) => {
    const message = await reorderPropertyImages(...args)
    await fetchProperties()
    return message
  }

  const handleDeletePropertyImages = async (...args: Parameters<typeof removePropertyImages>) => {
    await removePropertyImages(...args)
    await fetchProperties()
  }

  const handleOpenBlockDatesDialog = async (propertyId: number) => {
    try {
      const property = await getPropertyById(propertyId)
      setBlockProperty(property)
      setIsBlockDialogOpen(true)
    } catch {
      addToast("error", "Failed to load property details")
    }
  }

  const handleBlockDates = async (propertyId: number, request: { startDate: string; endDate: string }) => {
    try {
      const message = await blockPropertyDates(propertyId, request)
      await fetchProperties()
      addToast("success", message || "Dates blocked successfully")
    } catch {
      addToast("error", "Failed to block dates")
      throw new Error("Failed to block dates")
    }
  }

  return (
    <main className="space-y-6 max-w-11/12 mx-auto">
      <header className="flex justify-between items-center">
        <h1 className="text-5xl font-bold">My Properties</h1>
        <CreatePropertyDialog onCreate={handleCreateProperty} />
      </header>
      {userProperties.length === 0 ? (
        <p>You have no properties yet. Click "New Property" to create one.</p>
      ) : (
        <ul className="grid grid-cols-4 gap-6">
          {userProperties.map(property => (
            <li key={property.id}>
              <EditPropertyDialog
                property={property}
                onEdit={handleEditProperty}
                onAddImages={handleAddPropertyImages}
                onReorderImages={handleReorderPropertyImages}
                onDeleteImages={handleDeletePropertyImages}
                trigger={<PropertyCard property={property} canBlockDates onBlockDates={handleOpenBlockDatesDialog} />}
                triggerClassName="block cursor-pointer"
              />
            </li>
          ))}
        </ul>
      )}

      <BlockDatesDialog
        isOpen={isBlockDialogOpen}
        property={blockProperty}
        onClose={() => {
          setIsBlockDialogOpen(false)
          setBlockProperty(null)
        }}
        onSave={handleBlockDates}
      />
    </main>
  )
}

export default MyPropertiesPage