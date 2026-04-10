export interface Reservation {
  id: number;
  guestId: string;
  startDate: Date;
  endDate: Date;
  status: string;
  createdAt: Date
}