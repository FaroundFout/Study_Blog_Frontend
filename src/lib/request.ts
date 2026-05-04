import type { ApiResponse } from "@/types";

export type FetchParams = Record<string, string | number | boolean | undefined | null>;

export interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: FetchParams;
  body?: BodyInit | object | null;
  revalidate?: number;
}

export class ApiError extends Error {
  status: number;
  code?: number;

  constructor(message: string, status: number, code?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const ENABLE_MOCK = process.env.NEXT_PUBLIC_ENABLE_MOCK !== "false";
const ALLOW_BUILD_FALLBACK = process.env.STUDY_BLOG_BUILD_PHASE === "production-build";

function shouldUseBuildFallback(error: unknown) {
  if (!ALLOW_BUILD_FALLBACK) {
    return false;
  }

  if (!(error instanceof ApiError)) {
    return true;
  }

  return error.status >= 500;
}

function buildUrl(path: string, params?: FetchParams) {
  const target = path.startsWith("http") ? new URL(path) : new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      target.searchParams.set(key, String(value));
    });
  }

  return target.toString();
}

export function isMockEnabled() {
  return ENABLE_MOCK;
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const { params, body, headers, revalidate = 60, ...init } = options;

  const response = await fetch(buildUrl(path, params), {
    ...init,
    headers: {
      Accept: "application/json",
      ...(body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...headers
    },
    body:
      body && !(body instanceof FormData) && typeof body === "object"
        ? JSON.stringify(body)
        : (body as BodyInit | null | undefined),
    next: { revalidate }
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorCode: number | undefined;

    try {
      const json = (await response.json()) as Partial<ApiResponse<T>>;
      if (typeof json.message === "string" && json.message.trim()) {
        errorMessage = json.message;
      }
      if (typeof json.code === "number") {
        errorCode = json.code;
      }
    } catch {
      // Ignore non-JSON error bodies and fall back to the HTTP status text above.
    }

    throw new ApiError(errorMessage, response.status, errorCode);
  }

  const json = (await response.json()) as ApiResponse<T>;

  if (json.code !== 200) {
    throw new ApiError(json.message || "Request failed", response.status, json.code);
  }

  return json.data;
}

export async function requestWithFallback<T>(
  path: string,
  fallback: T,
  options: RequestOptions = {},
) {
  try {
    return await request<T>(path, options);
  } catch (error) {
    if (ENABLE_MOCK || shouldUseBuildFallback(error)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[mock fallback] ${path}`, error);
      } else if (ALLOW_BUILD_FALLBACK) {
        console.warn(`[build fallback] ${path}`, error);
      }
      return fallback;
    }

    throw error;
  }
}
