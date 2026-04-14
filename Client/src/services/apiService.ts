const BASE_URL = '/api';

type AuthMode = 'none' | 'optional' | 'required';

type ApiRequestConfig = RequestInit & {
  auth?: AuthMode;
};

function getStoredToken(): string | null {
  return localStorage.getItem('token');
}

function buildHeaders(body: BodyInit | null | undefined, headers?: HeadersInit): Headers {
  const finalHeaders = new Headers(headers);

  if (body && !(body instanceof FormData) && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  return finalHeaders;
}

async function request<T>(endpoint: string, config: ApiRequestConfig = {}): Promise<T> {
  const { auth = 'none', headers, ...fetchConfig } = config;
  const finalHeaders = buildHeaders(fetchConfig.body, headers);
  const storedToken = getStoredToken();

  if (auth === 'required' && !storedToken) {
    throw new Error('No authentication token found. Please login again.');
  }

  if ((auth === 'required' || auth === 'optional') && storedToken) {
    finalHeaders.set('Authorization', `Bearer ${storedToken}`);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchConfig,
    headers: finalHeaders,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.Message || `Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) return {} as T;

  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    return await response.json();
  } else {
    const textData = await response.text();
    return textData as unknown as T;
  }
}

export const api = {
  get: <T>(url: string, config?: ApiRequestConfig) => request<T>(url, { method: 'GET', ...config }),
  post: <T>(url: string, body: any, config?: ApiRequestConfig) =>
    request<T>(url, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...config,
    }),
  put: <T>(url: string, body: any, config?: ApiRequestConfig) =>
    request<T>(url, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...config,
    }),
  patch: <T>(url: string, body?: any, config?: ApiRequestConfig) =>
    request<T>(url, {
      method: 'PATCH',
      body: body ? (body instanceof FormData ? body : JSON.stringify(body)) : undefined,
      ...config,
    }),
  delete: <T>(url: string, config?: ApiRequestConfig) => request<T>(url, { method: 'DELETE', ...config }),
};