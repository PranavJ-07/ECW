import { apiClient } from '@/api/axios';
import type { ApiSuccessResponse } from '@/types/api.types';
import type {
  AuthSession,
  CurrentUserPayload,
  LoginCredentials,
  RegisterCredentials,
} from '@/types/auth.types';

export async function loginRequest(credentials: LoginCredentials): Promise<AuthSession> {
  const { data } = await apiClient.post<ApiSuccessResponse<AuthSession>>('/auth/login', credentials);
  return data.data;
}

export async function registerRequest(credentials: RegisterCredentials): Promise<{ message: string }> {
  const { data } = await apiClient.post<ApiSuccessResponse<{ message: string }>>(
    '/auth/register',
    credentials,
  );
  return data.data;
}

export async function getCurrentUserRequest(): Promise<CurrentUserPayload> {
  const { data } = await apiClient.get<ApiSuccessResponse<CurrentUserPayload>>('/auth/me');
  return data.data;
}
