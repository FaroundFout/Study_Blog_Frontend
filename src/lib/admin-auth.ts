import axios, { isAxiosError, type AxiosProgressEvent } from "axios";

import { ApiError, getApiBaseUrl, request, type RequestOptions } from "@/lib/request";
import {
  clearStoredAdminAuth,
  persistStoredAdminAuth,
  readStoredAdminAuth
} from "@/lib/auth-storage";
import type {
  AdminUploadRequestOptions,
  ApiResponse,
  LoginPayload,
  UploadProgressSnapshot
} from "@/types";

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

function buildUploadUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  const baseUrl = getApiBaseUrl();
  return baseUrl ? new URL(path, baseUrl).toString() : path;
}

function toUploadApiError(error: unknown) {
  if (!isAxiosError<Partial<ApiResponse<unknown>>>(error)) {
    return error;
  }

  const status = error.response?.status ?? 0;
  const payload = error.response?.data;
  const message =
    typeof payload?.message === "string" && payload.message.trim()
      ? payload.message
      : error.message || "Upload request failed.";

  return new ApiError(message, status, typeof payload?.code === "number" ? payload.code : undefined);
}

async function executeAdminUpload<T>(
  path: string,
  token: string,
  formData: FormData,
  options: AdminUploadRequestOptions,
) {
  let latest: UploadProgressSnapshot = { loaded: 0, percent: 0 };

  try {
    const response = await axios.post<ApiResponse<T>>(buildUploadUrl(path), formData, {
      headers: {
        Accept: "application/json",
        Authorization: normalizeAdminAccessToken(token)
      },
      withCredentials: true,
      onUploadProgress: (event: AxiosProgressEvent) => {
        const total = event.total && event.total > 0 ? event.total : undefined;
        latest = {
          loaded: event.loaded,
          total,
          percent: total ? Math.min(99, Math.floor((event.loaded / total) * 100)) : null
        };
        options.onProgress?.(latest);
      }
    });

    if (response.data.code !== 200) {
      throw new ApiError(
        response.data.message || "Upload request failed.",
        response.status,
        response.data.code,
      );
    }

    options.onProgress?.({
      loaded: latest.total ?? latest.loaded,
      total: latest.total,
      percent: 100
    });
    return response.data.data;
  } catch (error) {
    throw toUploadApiError(error);
  }
}

export async function authorizedAdminUploadRequest<T>(
  path: string,
  token: string | null | undefined,
  formData: FormData,
  options: AdminUploadRequestOptions = {},
) {
  const storedAuth = readStoredAdminAuth();
  const currentToken = storedAuth?.token || token;

  if (!currentToken) {
    clearStoredAdminAuth();
    redirectToAdminLogin("session-expired");
    throw new Error("Admin session not found.");
  }

  try {
    return await executeAdminUpload<T>(path, currentToken, formData, options);
  } catch (error) {
    if (!isUnauthorizedError(error)) {
      throw error;
    }

    try {
      const refreshedToken = await refreshAdminAccessToken();
      options.onAuthRetry?.();
      options.onProgress?.({ loaded: 0, percent: 0 });
      return await executeAdminUpload<T>(path, refreshedToken, formData, options);
    } catch (refreshError) {
      clearStoredAdminAuth();
      redirectToAdminLogin("session-expired");
      throw refreshError;
    }
  }
}
