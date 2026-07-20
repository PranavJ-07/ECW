import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, clearAccessToken } from '@/utils/storage';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let onUnauthorized: (() => void) | null = null;

/** Register a handler invoked when the API returns 401. */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);
