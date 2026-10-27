import { apiClient } from '@/api/client';
import type { AuthSession } from '@/types';

export interface Credentials {
  email: string;
  password: string;
}

export interface Registration extends Credentials {
  name: string;
  phone: string;
}

interface ApiAuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'customer' | 'admin';
    phone?: string | null;
  };
}

function normalizeSession(response: ApiAuthSession): AuthSession {
  return {
    token: response.token,
    user: {
      id: response.user.id,
      name: response.user.name,
      email: response.user.email,
      role: response.user.role,
      phone: response.user.phone,
    },
  };
}

export const authService = {
  async login(credentials: Credentials): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiAuthSession>('/auth/login', credentials);
    return normalizeSession(data);
  },
  async register(details: Registration): Promise<AuthSession> {
    const { data } = await apiClient.post<ApiAuthSession>('/auth/register', {
      fullName: details.name,
      email: details.email,
      password: details.password,
      phone: details.phone,
    });
    return normalizeSession(data);
  },
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },
  async getProfile() {
    const { data } = await apiClient.get('/auth/profile');
    return data as import('@/types').UserProfile;
  },
  async updateProfile(payload: { fullName: string; phone: string }) {
    const { data } = await apiClient.put('/auth/profile', payload);
    return data as import('@/types').UserProfile;
  },
};
