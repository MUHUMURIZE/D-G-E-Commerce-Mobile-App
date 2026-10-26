import { apiClient } from '@/api/client';
import type { AuthSession } from '@/types';

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
}

export const authService = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthSession>('/auth/login', credentials);
    return data;
  },
  async register(details: Registration): Promise<AuthSession> {
    const { data } = await apiClient.post<AuthSession>('/auth/register', details);
    return data;
  },
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },
};
