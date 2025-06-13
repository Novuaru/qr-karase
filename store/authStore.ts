import { create } from "zustand";

type UserRole = "admin" | "kasir" | "pelanggan" | null;

type AuthStore = {
  userId: string | null;
  role: UserRole;
  setUser: (id: string, role: UserRole) => void;
  clearUser: () => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  role: null,
  setUser: (id, role) => set({ userId: id, role }),
  clearUser: () => set({ userId: null, role: null }),
}));
