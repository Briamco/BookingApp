import type { Review } from "../types";
import { api } from "./apiService";

export interface CreateReviewRequest {
  rate: number;
  commentary: string;
}

export const ReviewService = {
  createReservationReview: async (reservationId: number, request: CreateReviewRequest) => {
    return api.post<{ message: string; review: Review }>(`/review/reservation/${reservationId}`, request, { auth: "required" });
  },
};
