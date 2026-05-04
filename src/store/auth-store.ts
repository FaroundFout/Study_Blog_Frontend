"use client";

import { create } from "zustand";

import {
  clearStoredAdminAuth,
  persistStoredAdminAuth,
  readStoredAdminAuth
} from "@/lib/auth-storage";
import type { AdminUser } from "@/types";

interface AuthStore {
  token: string | null;
  user: AdminUser | null;
  hydrated: boolean;
  restore: () => void;
  setAuth: (payload: { token: string; user: AdminUser }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  restore: () => {
    const stored = readStoredAdminAuth();

    set({
      token: stored?.token ?? null,
      user: stored?.user ?? null,
      hydrated: true
    });
  },
  setAuth: ({ token, user }) => {
    persistStoredAdminAuth({ token, user });

    set({
      token,
      user,
      hydrated: true
    });
  },
  clearAuth: () => {
    clearStoredAdminAuth();

    set({
      token: null,
      user: null,
      hydrated: true
    });
  }
}));
