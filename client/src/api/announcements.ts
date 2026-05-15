import { apiRequest } from './client';
import type { Announcement } from 'shared';

export function fetchAnnouncements(): Promise<{ data: Announcement[] }> {
  return apiRequest('/announcements');
}

export function fetchLatestAnnouncement(): Promise<Announcement | null> {
  return apiRequest('/announcements/latest');
}

export function createAnnouncement(data: { title: string; content: string; is_pinned?: number }): Promise<Announcement> {
  return apiRequest('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateAnnouncement(id: string, data: { title?: string; content?: string; is_pinned?: number }): Promise<Announcement> {
  return apiRequest(`/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteAnnouncement(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/announcements/${id}`, { method: 'DELETE' });
}
