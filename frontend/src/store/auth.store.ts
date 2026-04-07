/**
 * Auth Store — Zustand (in-memory, NO persistence)
 *
 * Stores user identity and auth status only.
 * Raw tokens are NEVER stored here — they live exclusively in httpOnly cookies
 * managed by the Express backend.
 *
 * Fix #2: No localStorage / redux-persist for tokens.
 */
import { create } from "zustand";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: true }),

  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
