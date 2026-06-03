// ─────────────────────────────────────────────────────────────
// JWT token store — module-level (so the non-React http layer can
// read it) + localStorage persistence. AuthContext keeps it in sync.
// ─────────────────────────────────────────────────────────────

const STORAGE_KEY = "os_hardening_token";

let token: string | null = readInitial();
let onUnauthorized: (() => void) | null = null;

function readInitial(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null; // localStorage unavailable (SSR/incognito edge) → in-memory only
  }
}

export function getToken(): string | null {
  return token;
}

export function setToken(value: string | null): void {
  token = value;
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore persistence errors */
  }
}

/** Registered by AuthContext: called when a request fails with 401 while a
 *  token was present (expired/invalid) → triggers logout + redirect to /login. */
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  onUnauthorized = fn;
}

export function notifyUnauthorized(): void {
  onUnauthorized?.();
}
