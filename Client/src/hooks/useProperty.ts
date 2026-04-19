import { useCallback, useEffect, useState } from "react"
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

  const getPropertyById = useCallback(async (id: number) => {
    const response = await PropertyService.getById(id);

    return response
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

  const addPropertyImages = async (propertyId: number, images: File[]): Promise<void> => {
    if (images.length === 0) return
    await PropertyService.uploadImages(propertyId, images)
  }

  const blockPropertyDates = async (propertyId: number, request: { startDate: string; endDate: string }): Promise<string> => {
    const response = await PropertyService.blockDates(propertyId, request)
    return response.message
  }

  const reservateProperty = async (propertyId: number, request: { startDate: string; endDate: string }): Promise<string> => {
    const response = await PropertyService.reservate(propertyId, request)
    return response.message
  }

  const reorderPropertyImages = async (propertyId: number, orderedImageIds: number[]): Promise<string> => {
    if (orderedImageIds.length === 0) return ""
    const response = await PropertyService.reorderImages(propertyId, orderedImageIds)
    return response.message
  }

  const removePropertyImages = async (propertyId: number, imageIds: number[]): Promise<void> => {
    if (imageIds.length === 0) return
    await Promise.all(imageIds.map((imageId) => PropertyService.deleteImage(propertyId, imageId)))
  }

  const deletePropery = async (id: number): Promise<string> => {
    const response = await PropertyService.delete(id)
    return response.message
  }

  return {
    properties,
    getPropertyById,
    createProperty,
    fetchProperties,
    updateProperty,
    addPropertyImages,
    blockPropertyDates,
    reservateProperty,
    reorderPropertyImages,
    removePropertyImages,
    deletePropery
  }
}