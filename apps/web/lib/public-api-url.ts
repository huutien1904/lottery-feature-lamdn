/**
 * Public API origin for browser requests (OAuth redirect, `apiFetch`, etc.).
 * Set `NEXT_PUBLIC_API_URL` in production. Defaults to local Nest port for dev.
 */
export function getPublicApiBaseUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_API_URL ?? "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  return "http://localhost:3001";
}
