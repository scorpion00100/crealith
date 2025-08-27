import { apiService } from './api';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  createdAt: string;
}

export class NotificationServiceClass {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiService.get<{ success: boolean; data: Notification[] }>('/notifications');
    return response.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiService.get<{ success: boolean; data: { count: number } }>('/notifications/unread-count');
    return response.data.count;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await apiService.put<{ success: boolean; message: string }>(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await apiService.put<{ success: boolean; message: string }>('/notifications/mark-all-read');
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await apiService.delete<{ success: boolean; message: string }>(`/notifications/${notificationId}`);
  }
}

export const notificationService = new NotificationServiceClass();
