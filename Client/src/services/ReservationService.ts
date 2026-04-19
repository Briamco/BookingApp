import type { Reservation } from "../types";
import { api } from "./apiService";

export const ReservationService = {
  getMyReservations: async () => {
    return api.get<Reservation[]>("/reservation/me", { auth: "required" });
  },

  cancelReservation: async (reservationId: number) => {
    return api.patch<{ message: string }>(`/reservation/${reservationId}/cancel`, undefined, { auth: "required" });
  },
};
