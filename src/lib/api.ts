// Small fetch wrapper around the API's { success, message, data } envelope.
export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    credentials: "same-origin",
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  let json: { success?: boolean; message?: string; data?: T } = {};
  try {
    json = await res.json();
  } catch {
    // non-JSON error page
  }

  if (!res.ok || json.success === false) {
    if (res.status === 401 && typeof window !== "undefined" && !url.includes("/users/login")) {
      // Session expired: send the person back to log in.
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname)}`;
    }
    throw new ApiError(json.message || `Request failed (${res.status})`, res.status);
  }
  return json.data as T;
}

export const api = {
  get: <T>(url: string) => request<T>("GET", url),
  post: <T>(url: string, body?: unknown) => request<T>("POST", url, body ?? {}),
  patch: <T>(url: string, body: unknown) => request<T>("PATCH", url, body),
  delete: <T>(url: string) => request<T>("DELETE", url),
};
