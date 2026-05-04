import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse, Uuid } from '@/types';

interface AuthState {
  userId: Uuid | null;
  email: string | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      email: null,
      token: null,
      isAuthenticated: false,
      setAuth: (auth) =>
        set({
          userId: auth.userId,
          email: auth.email,
          token: auth.token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({ userId: null, email: null, token: null, isAuthenticated: false }),
    }),
    { name: 'tripla-auth' },
  ),
);
