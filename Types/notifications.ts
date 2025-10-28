
export interface TipNotification {
  id: string;
  type: 'tip';
  memeId: string;
  memeTitle: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileType: string;
  from: string;
  amount: number;
  priceAtSend: number;
  timestamp: number;
  senderUsername: string;
}

export interface LikeNotification {
  id: string;
  type: 'like';
  memeId: string;
  memeTitle: string;
  imageUrl: string;
  thumbnailUrl?: string;
  fileType: string;
  from: string;
  timestamp: number;
  likerUsername: string;
}

export type Notification = TipNotification | LikeNotification;

export interface NotificationData {
  notifications: Notification[]; 
  unreadCount: number;
  hasMore: boolean;
  nextCursor: string | null;
  clickedNotifications?: string[];
}
