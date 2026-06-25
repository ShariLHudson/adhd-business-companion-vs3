/**
 * Quiet auth intelligence — improves future experiences without exposing complexity.
 */

const STORAGE_KEY = "companion-auth-intelligence-v1";

export type AuthLoginMethod = "email" | "google" | "unknown";

export type CompanionAuthIntelligence = {
  preferredLoginMethod: AuthLoginMethod | null;
  loginCount: number;
  lastLoginAt: string | null;
  lastFailedLoginAt: string | null;
  failedLoginAttempts: number;
  returnAfterAbsenceDays: number | null;
  lastDeviceHint: string | null;
};

function read(): CompanionAuthIntelligence {
  if (typeof window === "undefined") {
    return defaultAuthIntelligence();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAuthIntelligence();
    return { ...defaultAuthIntelligence(), ...(JSON.parse(raw) as object) };
  } catch {
    return defaultAuthIntelligence();
  }
}

function write(next: CompanionAuthIntelligence) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* quota */
  }
}

function defaultAuthIntelligence(): CompanionAuthIntelligence {
  return {
    preferredLoginMethod: null,
    loginCount: 0,
    lastLoginAt: null,
    lastFailedLoginAt: null,
    failedLoginAttempts: 0,
    returnAfterAbsenceDays: null,
    lastDeviceHint: null,
  };
}

function daysBetween(iso: string, now = new Date()): number {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return 0;
  return Math.max(
    0,
    Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24)),
  );
}

function deviceHint(): string {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad/.test(ua)) return "mobile";
  return "desktop";
}

export function getCompanionAuthIntelligence(): CompanionAuthIntelligence {
  return read();
}

/** True when this device has signed in before — for warmer returning copy. */
export function hasSignedInOnThisDeviceBefore(): boolean {
  return read().loginCount > 0;
}

export function recordAuthLoginSuccess(method: AuthLoginMethod = "email"): void {
  const cur = read();
  const now = new Date().toISOString();
  const absence =
    cur.lastLoginAt != null ? daysBetween(cur.lastLoginAt) : null;
  write({
    ...cur,
    preferredLoginMethod: method,
    loginCount: cur.loginCount + 1,
    lastLoginAt: now,
    failedLoginAttempts: 0,
    returnAfterAbsenceDays: absence,
    lastDeviceHint: deviceHint(),
  });
}

export function recordAuthLoginFailure(): void {
  const cur = read();
  write({
    ...cur,
    lastFailedLoginAt: new Date().toISOString(),
    failedLoginAttempts: cur.failedLoginAttempts + 1,
  });
}

export function recordAuthPasswordResetRequested(): void {
  const cur = read();
  write({
    ...cur,
    lastFailedLoginAt: new Date().toISOString(),
  });
}
