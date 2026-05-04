import type { AdminUser } from "@/types";

export const ADMIN_AUTH_STORAGE_KEY = "study-blog-admin-auth";
export const ADMIN_AUTH_CHANGED_EVENT = "study-blog-admin-auth-changed";

export interface StoredAdminAuth {
  token: string;
  user: AdminUser | null;
}

export function readStoredAdminAuth(): StoredAdminAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredAdminAuth;
  } catch {
    return null;
  }
}

export function persistStoredAdminAuth(payload: StoredAdminAuth) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(payload));
  notifyAdminAuthChanged();
}

export function clearStoredAdminAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_AUTH_STORAGE_KEY);
  notifyAdminAuthChanged();
}

export function notifyAdminAuthChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ADMIN_AUTH_CHANGED_EVENT));
}
