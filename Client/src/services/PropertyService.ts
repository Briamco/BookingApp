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

    return await api.get<Property[]>(`/property?${params.toString()}`)
  },

  getById: async (id: number) =>
    api.get<PropertyDatail>(`/property/${id}`),

  create: async (request: CreatePropertyRequest) =>
    api.post<Property>('/property', request, { auth: "required" }),

  update: async (id: number, request: CreatePropertyRequest) =>
    api.put<{ message: string }>(`/property/${id}`, request, { auth: "required" }),

  delete: async (id: number) =>
    api.delete<{ message: string }>(`/property/${id}`, { auth: "required" })
}