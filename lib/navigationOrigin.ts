/**
 * One reusable navigation-origin context.
 * Profile (and future surfaces) record where the member left so destinations
 * can show Return without per-link ad hoc state.
 */

import type { ProfileDestinationOverlayId } from "@/lib/profile/profileDestination";
import { canonicalizeProfileDestinationOverlay } from "@/lib/profile/profileDestination";

export type NavigationOriginContext = {
  originDestination: "profile";
  /** Profile overlay to restore (canonical). */
  originRoute: Exclude<ProfileDestinationOverlayId, "profile">;
  originTab?: string;
  originSection?: string;
  originStep?: string;
  originScrollY?: number;
  returnLabel?: string;
  openedDestination: string;
  createdAt: string;
  /** ISO — stale contexts must not reopen Profile later. */
  expiresAt: string;
};

const STORAGE_KEY = "spark:navigation-origin:v1";
const CHANGE_EVENT = "spark:navigation-origin-change";
const TTL_MS = 2 * 60 * 60 * 1000;

function canUseStorage(): boolean {
  try {
    return typeof sessionStorage !== "undefined" && sessionStorage != null;
  } catch {
    return false;
  }
}

function notify(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  }
}

function isExpired(ctx: NavigationOriginContext, now = Date.now()): boolean {
  const exp = Date.parse(ctx.expiresAt);
  return !Number.isFinite(exp) || exp <= now;
}

export function defaultProfileReturnLabel(
  originRoute: NavigationOriginContext["originRoute"],
  setupActive?: boolean,
): string {
  if (setupActive) return "Continue Profile Setup";
  if (originRoute === "my-business-estate") {
    return "Return to My Business Estate";
  }
  if (originRoute === "people-i-help") {
    return "Return to People I Help";
  }
  if (originRoute === "growth-profile") {
    return "Return to Growth Profile";
  }
  return "Return to My Profile";
}

export function setNavigationOrigin(
  input: Omit<NavigationOriginContext, "createdAt" | "expiresAt" | "returnLabel"> & {
    returnLabel?: string;
    setupActive?: boolean;
  },
): NavigationOriginContext {
  const now = Date.now();
  const originRoute = canonicalizeProfileDestinationOverlay(
    input.originRoute === "profile"
      ? "my-business-estate"
      : input.originRoute,
  );
  const ctx: NavigationOriginContext = {
    originDestination: "profile",
    originRoute,
    originTab: input.originTab,
    originSection: input.originSection,
    originStep: input.originStep,
    originScrollY: input.originScrollY,
    openedDestination: input.openedDestination,
    returnLabel:
      input.returnLabel ??
      defaultProfileReturnLabel(originRoute, input.setupActive),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + TTL_MS).toISOString(),
  };
  if (canUseStorage()) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
    } catch {
      /* quota */
    }
  }
  notify();
  return ctx;
}

export function getNavigationOrigin(
  now = Date.now(),
): NavigationOriginContext | null {
  if (!canUseStorage()) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NavigationOriginContext;
    if (!parsed?.originRoute || parsed.originDestination !== "profile") {
      clearNavigationOrigin();
      return null;
    }
    if (isExpired(parsed, now)) {
      clearNavigationOrigin();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearNavigationOrigin(): void {
  if (canUseStorage()) {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }
  notify();
}

/** Read and clear — use after a successful return restore. */
export function consumeNavigationOrigin(): NavigationOriginContext | null {
  const ctx = getNavigationOrigin();
  if (ctx) clearNavigationOrigin();
  return ctx;
}

export function subscribeNavigationOrigin(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onChange = () => listener();
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) onChange();
  });
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function clearNavigationOriginForTests(): void {
  clearNavigationOrigin();
}
