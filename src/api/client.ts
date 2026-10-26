import axios, { AxiosError } from 'axios';
import { readSession, clearSession } from '@/services/sessionStorage';

let unauthorizedHandler: (() => void) | undefined;
const createAxiosClient = axios.create.bind(axios);

export function setUnauthorizedHandler(handler: () => void): void {
  unauthorizedHandler = handler;
}

export const apiClient = createAxiosClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  timeout: 15000,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const session = await readSession();
  if (session?.token) config.headers.Authorization = `Bearer ${session.token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      await clearSession();
      unauthorizedHandler?.();
    }
    const message = error.response?.data?.message
      ?? (error.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : error.response
          ? 'The request could not be completed.'
          : 'Unable to connect. Check your internet connection and try again.');
    return Promise.reject(new Error(message));
  },
);
