import { ApiErrorResponse } from '../types/common';

const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || DEFAULT_API_BASE_URL;

/** Production'da HTTPS zorunlu — MITM koruması */
if (!__DEV__ && API_BASE_URL.startsWith('http://')) {
  throw new Error('Production ortamında HTTPS zorunludur. EXPO_PUBLIC_API_BASE_URL https:// ile başlamalıdır.');
}

/** Varsayılan istek zaman aşımı (ms) */
const DEFAULT_TIMEOUT_MS = 15_000;

/** 5xx hatalarında maksimum yeniden deneme sayısı */
const MAX_RETRIES = 2;

/** Yeniden denemeler arası bekleme (ms) — her denemede 2x artar */
const RETRY_BASE_DELAY_MS = 1_000;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  /** true ise 401'de token refresh denenmez (sonsuz döngü koruması) */
  skipRefresh?: boolean;
  /** İstek zaman aşımı (ms). Varsayılan: 15 saniye */
  timeout?: number;
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

/**
 * Belirtilen süre kadar bekler (retry arası gecikme).
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Tek bir HTTP isteği yapar (timeout destekli).
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw {
        message: 'İstek zaman aşımına uğradı. Lütfen bağlantınızı kontrol edin.',
        status: 0,
        path: url,
      } as ApiErrorResponse;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    token,
    headers = {},
    skipRefresh = false,
    timeout = DEFAULT_TIMEOUT_MS,
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;
  const init: RequestInit = {
    method,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  };

  // — Retry döngüsü (sadece GET + 5xx için) —
  let lastError: unknown;
  const attempts = method === 'GET' ? MAX_RETRIES + 1 : 1;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1));
    }

    let response: Response;
    try {
      response = await fetchWithTimeout(url, init, timeout);
    } catch (err) {
      lastError = err;
      // Timeout veya ağ hatası — GET ise tekrar dene
      if (method === 'GET' && attempt < attempts - 1) continue;
      throw err;
    }

    // 5xx — sunucu hatası, GET ise tekrar dene
    if (response.status >= 500 && method === 'GET' && attempt < attempts - 1) {
      lastError = {
        message: `Sunucu hatası (${response.status})`,
        status: response.status,
        path: endpoint,
      };
      continue;
    }

    const contentType = response.headers.get('content-type');
    const hasJson = contentType?.includes('application/json');
    const json = hasJson ? await response.json() : null;

    // 401 — Access token süresi dolmuş, refresh dene
    if (response.status === 401 && !skipRefresh && token && onTokenRefresh) {
      const newToken = await onTokenRefresh();
      if (newToken) {
        return request<T>(endpoint, { ...options, token: newToken, skipRefresh: true });
      }
    }

    if (!response.ok) {
      // Validation hatalarında data alanından alan bazlı hataları oku
      let errorMessage = json?.message || `İstek başarısız oldu. HTTP durum kodu: ${response.status}`;
      if (json?.data && typeof json.data === 'object' && !Array.isArray(json.data)) {
        const fieldErrors = Object.values(json.data).filter((v): v is string => typeof v === 'string');
        if (fieldErrors.length > 0) {
          errorMessage = fieldErrors[0];
        }
      }

      const error: ApiErrorResponse = {
        message: errorMessage,
        status: response.status,
        path: endpoint,
      };

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

  // Tüm denemeler tükendi
  throw lastError;
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
