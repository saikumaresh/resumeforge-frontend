import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  userId: string;
  name: string;
  email: string;
  plan: "FREE" | "PRO";
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isPro: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),

      isAuthenticated: () => !!get().token && !!get().user,

      isPro: () => get().user?.plan === "PRO",
    }),
    {
      name: "rf-auth",
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
