export interface DirectusNotification {
  id: number;
  timestamp: string;
  status: 'inbox' | 'archived';
  recipient: string;
  sender: string | null;
  subject: string;
  message: string | null;
  collection: string | null;
  item: string | null;
}

export interface NotificationState {
  notifications: DirectusNotification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}
