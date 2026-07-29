/**
 * REST API client.
 */

const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN ?? "").replace(/\/$/, "");
const BASE = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = localStorage.getItem("ac_token");
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json();
}

export const api = {
  get:    <T>(path: string)                  => request<T>("GET",    path),
  post:   <T>(path: string, body: unknown)   => request<T>("POST",   path, body),
  put:    <T>(path: string, body: unknown)   => request<T>("PUT",    path, body),
  patch:  <T>(path: string, body: unknown)   => request<T>("PATCH",  path, body),
  delete: <T>(path: string)                  => request<T>("DELETE", path),
};
