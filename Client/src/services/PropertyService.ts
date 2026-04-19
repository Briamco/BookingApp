/* eslint-disable @typescript-eslint/no-unused-vars */
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

  create: async (request: CreatePropertyRequest) => {
    const { images, ...propertyData } = request;
    return api.post<{ message: string, propertyId: number }>('/property', propertyData, { auth: "required" });
  },

  uploadImages: async (propertyId: number, images: File[]) => {
    const uploadPromises = images.map((image) => {
      const formData = new FormData();
      formData.append('image', image);
      return api.post(`/property/${propertyId}/images`, formData, { auth: "required" });
    });

    return Promise.all(uploadPromises);
  },

  reorderImages: async (propertyId: number, orderedImageIds: number[]) => {
    const imageOrders = orderedImageIds.map((imageId, index) => ({
      imageId,
      order: index,
    }));

    return api.put<{ message: string }>(`/property/${propertyId}/images/reorder`, imageOrders, { auth: "required" });
  },

  deleteImage: async (propertyId: number, imageId: number) =>
    api.delete<{ message: string }>(`/property/${propertyId}/images/${imageId}`, { auth: "required" }),

  blockDates: async (propertyId: number, request: { startDate: string; endDate: string }) =>
    api.post<{ message: string; blockedDateId: number }>(`/property/${propertyId}/blockDate`, request, { auth: "required" }),

  reservate: async (propertyId: number, request: { startDate: string, endDate: string }) =>
    api.post<{ message: string; reservationId: number }>(`/property/${propertyId}/reservate`, request, { auth: "required" }),

  update: async (id: number, request: CreatePropertyRequest) =>
    api.put<{ message: string }>(`/property/${id}`, request, { auth: "required" }),

  delete: async (id: number) =>
    api.delete<{ message: string }>(`/property/${id}`, { auth: "required" })
}