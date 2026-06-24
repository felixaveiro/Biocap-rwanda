/**
 * Cookie-based session storage.
 *
 * We use cookies (not localStorage) so that:
 *  - the token survives page refreshes
 *  - Next.js middleware can read it later if you add protected routes
 *
 * Each function does exactly one job, so if something breaks you can
 * test/log each one in isolation instead of digging through one big blob.
 */

const TOKEN_COOKIE = "biocap_token";
const ROLE_COOKIE = "biocap_role";
const USERNAME_COOKIE = "biocap_username";

const DEFAULT_EXPIRY_DAYS = 7;

function setCookie(name: string, value: string, days = DEFAULT_EXPIRY_DAYS) {
  if (typeof document === "undefined") return; // safety for any accidental server-side call

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  if (!match) return null;

  return decodeURIComponent(match.split("=")[1]);
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export interface SessionData {
  token: string;
  role: string;
  username: string;
}

export const authCookies = {
  /** Call right after a successful login/register to persist the session. */
  setSession({ token, role, username }: SessionData) {
    setCookie(TOKEN_COOKIE, token);
    setCookie(ROLE_COOKIE, role);
    setCookie(USERNAME_COOKIE, username);
  },

  getToken(): string | null {
    return getCookie(TOKEN_COOKIE);
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

  /** Call on logout. */
  clearSession() {
    deleteCookie(TOKEN_COOKIE);
    deleteCookie(ROLE_COOKIE);
    deleteCookie(USERNAME_COOKIE);
  },
};