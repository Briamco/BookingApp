import type { LoginRequest, LoginResponse, PublicUser, RegisterRequest, User } from "../types";
import { api } from "./apiService";

export const authService = {
  register: async (request: RegisterRequest) =>
    api.post<{ message: string }>('/auth/register', request),

  login: async (request: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', request),

  confirm: async (id: string) => {
    const query = id ? `?token=${id}` : ''
    return await api.post<string>(`/auth/confirm${query}`, undefined)
  },

  me: async () =>
    await api.get<User | undefined>(`/auth/me`, { auth: 'required' }),

  getPublicById: async (id: string) =>
    await api.get<PublicUser>(`/auth/${id}/public`, { auth: 'optional' })
}