import type { Property, PropertyDatail, CreatePropertyRequest } from "../types";
import { api } from "./apiService";

export const PropertyService = {
  getAll: async (location?: string, maxPrice?: number, minCapcity?: number, startDate?: Date, endDate?: Date) => {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString());
    if (minCapcity !== undefined) params.append('minCapcity', minCapcity.toString());
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());

    return await api.get<Property[]>(`/api/property?${params.toString()}`)
  },

  getById: async (id: number) =>
    api.get<PropertyDatail>(`/api/property/${id}`),

  create: async (request: CreatePropertyRequest) =>
    api.post<Property>('/api/property', request),

  update: async (id: number, request: CreatePropertyRequest) =>
    api.put<{ message: string }>(`/api/property/${id}`, request),

  delete: async (id: number) =>
    api.delete<{ message: string }>(`/api/property/${id}`)
}