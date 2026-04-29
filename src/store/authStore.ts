import { create } from "zustand";

import { authService } from "@/services/firebase/authService";
import { UserProfile } from "@/types/User";

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  bootstrap: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

let unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  bootstrap: () => {
    if (unsubscribeAuth) return;
    unsubscribeAuth = authService.subscribe((user) => set({ user, loading: false }));
  },
  login: async (email, password) => {
    set({ loading: true });
    try {
      const user = await authService.login(email, password);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const user = await authService.register(name, email, password);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  logout: async () => {
    await authService.logout();
    set({ user: null });
  },
}));
