import type { BlockedDate } from "./BlockedDate";
import type { Image } from "./Image";
import type { Reservation } from "./Reservation";

export interface Property {
  id: number;
  hostId: string;
  title: string;
  description: string;
  nightPrice: number;
  capacity: number;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  coutry: string;
  averageRating: number;
  images: Image[]
}

export interface PropertyDatail {
  id: number;
  hostId: string;
  title: string;
  description: string;
  nightPrice: number;
  capacity: number;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  coutry: string;
  averageRating: number;
  reservations: Reservation[];
  blockedDate: BlockedDate[];
  images: Image[];
}

export interface CreatePropertyRequest {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  nightPrice: number;
  capacity: number;
  city: string;
  state: string;
  coutry: string;
}