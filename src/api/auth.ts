import { apiClient } from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export const authApi = {
  login: (payload: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterRequest) =>
    apiClient.post<AuthResponse>('/auth/register', payload).then((r) => r.data),
};
