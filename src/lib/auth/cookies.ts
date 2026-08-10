// ─── Cookie Management Utilities ────────────────────────────────────────────

const TOKEN_COOKIE = "biocap_token";
const REFRESH_TOKEN_COOKIE = "biocap_refresh_token";
const USER_ID_COOKIE = "biocap_user_id";
const ROLE_COOKIE = "biocap_role";
const USERNAME_COOKIE = "biocap_username";

const DEFAULT_EXPIRY_DAYS = 7;

export function setCookie(name: string, value: string, days = DEFAULT_EXPIRY_DAYS) {
  if (typeof document === "undefined") return;

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";

  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secureFlag}`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) return null;

  return decodeURIComponent(match.split("=")[1]);
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export interface SessionData {
  token: string;
  refreshToken?: string;
  userId?: string;
  role: string;
  username: string;
}

export const authCookies = {
  /** Call after successful login to persist session */
  setSession({ token, refreshToken, userId, role, username }: SessionData) {
    setCookie(TOKEN_COOKIE, token);
    if (refreshToken) setCookie(REFRESH_TOKEN_COOKIE, refreshToken);
    if (userId) setCookie(USER_ID_COOKIE, userId);
    setCookie(ROLE_COOKIE, role);
    setCookie(USERNAME_COOKIE, username);
  },

  setToken(token: string) {
    setCookie(TOKEN_COOKIE, token);
  },

  setRefreshToken(refreshToken: string) {
    setCookie(REFRESH_TOKEN_COOKIE, refreshToken);
  },

  getToken(): string | null {
    return getCookie(TOKEN_COOKIE);
  },

  getRefreshToken(): string | null {
    return getCookie(REFRESH_TOKEN_COOKIE);
  },

  getUserId(): string | null {
    return getCookie(USER_ID_COOKIE);
  },

  getRole(): string | null {
    return getCookie(ROLE_COOKIE);
  },

  getUsername(): string | null {
    return getCookie(USERNAME_COOKIE);
  },

  isLoggedIn(): boolean {
    return Boolean(getCookie(TOKEN_COOKIE));
  },

  /** Call on logout or forced token invalidation */
  clearSession() {
    deleteCookie(TOKEN_COOKIE);
    deleteCookie(REFRESH_TOKEN_COOKIE);
    deleteCookie(USER_ID_COOKIE);
    deleteCookie(ROLE_COOKIE);
    deleteCookie(USERNAME_COOKIE);
  },

  clearAll() {
    this.clearSession();
  },
};