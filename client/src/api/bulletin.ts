import { apiRequest } from './client';
import type { BulletinPost } from 'shared';

export function fetchBulletinPosts(): Promise<{ data: BulletinPost[] }> {
  return apiRequest('/bulletin');
}

export function createBulletinPost(data: { title: string; content: string }): Promise<BulletinPost> {
  return apiRequest('/bulletin', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function deleteBulletinPost(id: string): Promise<{ success: boolean }> {
  return apiRequest(`/bulletin/${id}`, { method: 'DELETE' });
}
