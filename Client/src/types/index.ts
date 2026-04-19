export type { User, PublicUser, LoginRequest, RegisterRequest, LoginResponse } from './User';
export type { Image } from './Image';
export type { Property, PropertyDatail, CreatePropertyRequest } from './Property';
export type { Reservation } from './Reservation';
export type { BlockedDate } from './BlockedDate';
export type { Review } from './Review';
export type { Notification } from './Notification';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}