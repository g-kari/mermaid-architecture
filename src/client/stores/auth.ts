import { create } from "zustand";
import { api } from "../lib/api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    try {
      const user = await api.get<User>("/users/me");
      set({ user, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
