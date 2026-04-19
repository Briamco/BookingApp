import type { Review } from "./Review";

export interface Reservation {
  id: number;
  propertyId: number;
  propertyTitle: string;
  guestId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date;
  review?: Review | null;
}