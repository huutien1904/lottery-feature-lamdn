/**
 * Central fetch wrapper for calling the NestJS API.
 * Use from TanStack Query queryFn / mutationFn — do not scatter raw fetch().
 */

export type ApiClientOptions = RequestInit & {
  /** Skip JSON Content-Type (e.g. FormData uploads). */
  skipJsonHeaders?: boolean;
};

function resolveApiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}

export async function apiFetch<T>(path: string, init?: ApiClientOptions): Promise<T> {
  const url = resolveApiUrl(path);

  const headers = new Headers(init?.headers);

  if (!init?.skipJsonHeaders && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const text = await res.text();
    if (!text) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  return undefined as T;
}
