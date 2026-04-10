export interface Review {
  id: number;
  reservationId: number;
  propertyId: number;
  guestId: string;
  rate: number;
  commentary: string;
  createdAt: Date;
}