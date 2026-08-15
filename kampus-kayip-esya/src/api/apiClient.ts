import { ApiErrorResponse } from '../types/common';

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  /** true ise 401'de token refresh denenmez (sonsuz döngü koruması) */
  skipRefresh?: boolean;
};

/**
 * Token refresh callback — AuthContext tarafından set edilir.
 * 401 alınca bu fonksiyon çağrılır, yeni token döner.
 */
let onTokenRefresh: (() => Promise<string | null>) | null = null;

/** AuthContext bu fonksiyonu çağırarak refresh callback'ini set eder */
export function setTokenRefreshHandler(handler: (() => Promise<string | null>) | null) {
  onTokenRefresh = handler;
}

/**
 * Global hata callback — Toast veya alert göstermek için.
 * App.tsx'te set edilir.
 */
let onApiError: ((error: ApiErrorResponse) => void) | null = null;

export function setApiErrorHandler(handler: ((error: ApiErrorResponse) => void) | null) {
  onApiError = handler;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token, headers = {}, skipRefresh = false } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = response.headers.get('content-type');
  const hasJson = contentType?.includes('application/json');
  const json = hasJson ? await response.json() : null;

  // 401 — Access token süresi dolmuş, refresh dene
  if (response.status === 401 && !skipRefresh && token && onTokenRefresh) {
    const newToken = await onTokenRefresh();
    if (newToken) {
      // Yeni token ile isteği tekrarla
      return request<T>(endpoint, { ...options, token: newToken, skipRefresh: true });
    }
  }

  if (!response.ok) {
    const error: ApiErrorResponse = {
      message:
        json?.message ||
        `İstek başarısız oldu. HTTP durum kodu: ${response.status}`,
      status: response.status,
      path: endpoint,
    };

    // Global hata handler'ı çağır
    if (onApiError) {
      onApiError(error);
    }

    throw error;
  }

  if (json && 'data' in json) {
    return json.data as T;
  }

  return json as T;
}

export const apiClient = {
  get<T>(endpoint: string, token?: string | null) {
    return request<T>(endpoint, { method: 'GET', token });
  },

  post<T>(endpoint: string, body?: unknown, token?: string | null) {
    return request<T>(endpoint, { method: 'POST', body, token });
  },

  put<T>(endpoint: string, body?: unknown, token?: string | null) {
    return request<T>(endpoint, { method: 'PUT', body, token });
  },

  patch<T>(endpoint: string, body?: unknown, token?: string | null) {
    return request<T>(endpoint, { method: 'PATCH', body, token });
  },

  delete<T>(endpoint: string, token?: string | null) {
    return request<T>(endpoint, { method: 'DELETE', token });
  },
};
