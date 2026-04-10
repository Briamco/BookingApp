export interface Notification {
  id: number;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  type: number;
  createdAt: Date;
}