import type { Reservation } from "../types";
import { api } from "./apiService";

export const ReservationService = {
  getMyReservations: async () => {
    return api.get<Reservation[]>("/reservation/me", { auth: "required" });
  },
};
