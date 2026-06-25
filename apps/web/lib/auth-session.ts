/** localStorage keys for SPA auth until cookie-based sessions land. */
export const AUTH_ACCESS_TOKEN_KEY = "rl_access_token";
export const AUTH_REFRESH_TOKEN_KEY = "rl_refresh_token";
const AUTH_USER_KEY = "rl_user";

export type AuthUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  platformRole: string;
};

export function persistAuthTokens(accessToken: string, refreshToken: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, refreshToken);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY);
}

export function cacheAuthUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

/** Fetch /auth/me and cache user info in localStorage. */
export async function fetchAndCacheUser(apiBase: string): Promise<AuthUser | null> {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const res = await fetch(`${apiBase}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const body = await res.json() as {
      data?: { user?: AuthUser };
    };
    const user = body?.data?.user ?? null;
    if (user) cacheAuthUser(user);
    return user;
  } catch {
    return null;
  }
}
