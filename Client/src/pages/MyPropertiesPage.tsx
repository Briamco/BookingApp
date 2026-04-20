import { useMemo, useState } from "react"
import { Building2, LayoutGrid } from "lucide-react"
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
    <main className="premium-page-shell mx-auto max-w-11/12 space-y-6 pb-8">
      <header className="rounded-3xl border border-base-300/80 bg-linear-to-br from-base-100 via-base-100 to-base-200/90 p-6 shadow-sm lg:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">My Properties</h1>
            <p className="text-base-content/70">Manage listings, media, and blocked dates from one premium dashboard.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-base-300 bg-base-100 px-4 py-2 text-right shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-base-content/60">Total</p>
              <p className="text-2xl font-bold text-primary">{userProperties.length}</p>
            </div>
            <CreatePropertyDialog onCreate={handleCreateProperty} />
          </div>
        </div>
      </header>

      {userProperties.length === 0 ? (
        <div className="grid min-h-[45vh] place-items-center rounded-3xl border border-base-300/80 bg-base-100/90 p-10 text-center shadow-sm">
          <div className="space-y-3">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-base-200 text-base-content/60">
              <Building2 className="h-5 w-5" />
            </div>
            <p className="text-lg font-medium">You have no properties yet.</p>
            <p className="text-sm text-base-content/60">Click "New Property" to publish your first listing.</p>
          </div>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {userProperties.map(property => (
            <EditPropertyDialog
              key={property.id}
              property={property}
              onEdit={handleEditProperty}
              onAddImages={handleAddPropertyImages}
              onReorderImages={handleReorderPropertyImages}
              onDeleteImages={handleDeletePropertyImages}
              trigger={<PropertyCard property={property} canBlockDates onBlockDates={handleOpenBlockDatesDialog} />}
              triggerClassName="block cursor-pointer rounded-2xl"
            />
          ))}
        </ul>
      )}

      {userProperties.length > 0 && (
        <div className="flex items-center gap-2 rounded-2xl border border-base-300 bg-base-100/90 px-4 py-3 text-sm text-base-content/70 shadow-sm">
          <LayoutGrid className="h-4 w-4 text-primary" />
          Tip: click a property card to edit details, images, or block dates.
        </div>
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