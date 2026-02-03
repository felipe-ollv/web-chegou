import { getAuthToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3006/api";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

const buildHeaders = (options?: ApiOptions, hasBody?: boolean) => {
  const headers = new Headers(options?.headers || {});
  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options?.auth !== false) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const apiFetch = async <T = any>(path: string, options: ApiOptions = {}): Promise<T> => {
  const isFormData = options.body instanceof FormData;
  const headers = buildHeaders(options, !!options.body && !isFormData);

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

