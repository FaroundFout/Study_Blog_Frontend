import { ApiError, request, type RequestOptions } from "@/lib/request";
import {
  clearStoredAdminAuth,
  persistStoredAdminAuth,
  readStoredAdminAuth
} from "@/lib/auth-storage";
import type { LoginPayload } from "@/types";

let refreshPromise: Promise<string> | null = null;

function isUnauthorizedError(error: unknown) {
  return error instanceof ApiError && error.status === 401;
}

export function normalizeAdminAccessToken(token: string) {
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

export function redirectToAdminLogin(reason: string) {
  if (typeof window === "undefined") {
    return;
  }

  const currentPath = `${window.location.pathname}${window.location.search}`;
  const target = new URL("/admin/login", window.location.origin);
  target.searchParams.set("reason", reason);
  target.searchParams.set("redirect", currentPath);
  window.location.replace(target.toString());
}

export async function refreshAdminAccessToken() {
  if (typeof window === "undefined") {
    throw new Error("Refresh is only available in the browser.");
  }

  if (!refreshPromise) {
    refreshPromise = request<LoginPayload>("/api/admin/auth/refresh", {
      method: "POST",
      credentials: "include",
      revalidate: 0
    })
      .then((payload) => {
        const normalizedToken = normalizeAdminAccessToken(payload.token);
        persistStoredAdminAuth({
          token: normalizedToken,
          user: payload.userInfo
        });
        return normalizedToken;
      })
      .catch((error) => {
        clearStoredAdminAuth();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

export async function authorizedAdminRequest<T>(
  path: string,
  token: string | null | undefined,
  options: RequestOptions = {}
) {
  const storedAuth = readStoredAdminAuth();
  const currentToken = storedAuth?.token || token;

  if (!currentToken) {
    clearStoredAdminAuth();
    redirectToAdminLogin("session-expired");
    throw new Error("Admin session not found.");
  }

  const headers = {
    ...options.headers,
    Authorization: normalizeAdminAccessToken(currentToken)
  };

  try {
    return await request<T>(path, {
      ...options,
      headers,
      revalidate: options.revalidate ?? 0
    });
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error;
    }

    try {
      const refreshedToken = await refreshAdminAccessToken();
      return await request<T>(path, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: refreshedToken
        },
        revalidate: options.revalidate ?? 0
      });
    } catch (refreshError) {
      clearStoredAdminAuth();
      redirectToAdminLogin("session-expired");
      throw refreshError;
    }
  }
}
