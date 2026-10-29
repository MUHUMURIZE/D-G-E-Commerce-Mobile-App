import { apiClient } from '@/api/client';
import type { AppNotification } from '@/types';

type ApiNotification = Omit<AppNotification, 'created_at'> & { createdAt?: string; created_at?: string };

function normalizeNotification(notification: ApiNotification): AppNotification {
  return { ...notification, created_at: notification.createdAt ?? notification.created_at ?? '' };
}

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<ApiNotification[]>('/v2/notifications');
    return data.map(normalizeNotification);
  },
  async markRead(id: string): Promise<AppNotification> {
    const { data } = await apiClient.patch<ApiNotification>(`/v2/notifications/${encodeURIComponent(id)}/read`);
    return normalizeNotification(data);
  },
  async markAllRead(): Promise<void> {
    await apiClient.patch('/v2/notifications/read-all');
  },
};
