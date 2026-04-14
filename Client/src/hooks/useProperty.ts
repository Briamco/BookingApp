import { useEffect, useState } from "react"
import type { CreatePropertyRequest, Property } from "../types"
import { PropertyService } from "../services/PropertyService"
import { useToast } from "../context/ToastContext"

export const useProperty = () => {
  const { addToast } = useToast();

  const [properties, setProperties] = useState<Property[]>([])

  const fetchProperties = async (location?: string, maxPrice?: number, minCapcity?: number, startDate?: Date, endDate?: Date) => {
    const response = await PropertyService.getAll(location, maxPrice, minCapcity, startDate, endDate)

    if (response)
      setProperties(response || [])
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const createProperty = async (request: CreatePropertyRequest) => {
    const response = await PropertyService.create(request)

    console.log(response)

    if (request.images && request.images.length > 0) {
      try {
        await PropertyService.uploadImages(response.propertyId, request.images)
      } catch (error) {
        console.error("Failed to upload images:", error)
        addToast('error', 'Cant upload the image')
      }
    }
  }

  const updateProperty = async (id: number, request: CreatePropertyRequest): Promise<string> => {
    const response = await PropertyService.update(id, request)
    return response.message
  }

  const deletePropery = async (id: number): Promise<string> => {
    const response = await PropertyService.delete(id)
    return response.message
  }

  return {
    properties,
    createProperty,
    fetchProperties,
    updateProperty,
    deletePropery
  }
}