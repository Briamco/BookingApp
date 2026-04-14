import { useEffect, useState } from "react"
import type { CreatePropertyRequest, Property } from "../types"
import { PropertyService } from "../services/PropertyService"

export const useProperty = () => {
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

    if (response)
      setProperties([...properties, response])
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
    fetchProperties,
    createProperty,
    updateProperty,
    deletePropery
  }
}