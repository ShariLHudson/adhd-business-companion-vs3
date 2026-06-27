import type { WelcomeRoomMemory, WelcomeRoomWelcomeMode } from "./types";

const STORAGE_KEY = "companion-welcome-room-v1";
const PENDING_INVITATION_KEY = "companion-welcome-room-pending-invitation";

const DEFAULT_MEMORY: WelcomeRoomMemory = {
  visited: false,
  visitCount: 0,
  firstVisitedAt: null,
  lastVisitedAt: null,
  invitationDismissed: false,
  loginOfferDismissed: false,
};

function readRaw(): WelcomeRoomMemory {
  if (typeof window === "undefined") return { ...DEFAULT_MEMORY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_MEMORY };
    const parsed = JSON.parse(raw) as Partial<WelcomeRoomMemory>;
    return { ...DEFAULT_MEMORY, ...parsed };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

function write(memory: WelcomeRoomMemory): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  } catch {
    /* quota */
  }
}

export function getWelcomeRoomMemory(): WelcomeRoomMemory {
  return readRaw();
}

export function hasVisitedWelcomeRoom(): boolean {
  return readRaw().visited;
}

export function recordWelcomeRoomVisit(now = new Date()): WelcomeRoomMemory {
  const prev = readRaw();
  const iso = now.toISOString();
  const next: WelcomeRoomMemory = {
    ...prev,
    visited: true,
    visitCount: prev.visitCount + 1,
    firstVisitedAt: prev.firstVisitedAt ?? iso,
    lastVisitedAt: iso,
  };
  write(next);
  clearWelcomeRoomInvitationPending();
  return next;
}

export function dismissWelcomeRoomInvitation(): void {
  write({ ...readRaw(), invitationDismissed: true });
  clearWelcomeRoomInvitationPending();
}

export function dismissWelcomeRoomLoginOffer(): void {
  write({ ...readRaw(), loginOfferDismissed: true });
}

export function scheduleWelcomeRoomInvitation(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_INVITATION_KEY, "1");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("companion-welcome-room-invitation"));
    }
  } catch {
    /* ignore */
  }
}

export function clearWelcomeRoomInvitationPending(): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_INVITATION_KEY);
  } catch {
    /* ignore */
  }
}

export function peekWelcomeRoomInvitationPending(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(PENDING_INVITATION_KEY) === "1";
  } catch {
    return false;
  }
}

export function shouldShowWelcomeRoomInvitation(): boolean {
  const memory = readRaw();
  if (memory.invitationDismissed || memory.visited) return false;
  return peekWelcomeRoomInvitationPending();
}

export function shouldShowWelcomeRoomLoginOffer(): boolean {
  const memory = readRaw();
  if (memory.visited || memory.loginOfferDismissed) return false;
  if (shouldShowWelcomeRoomInvitation()) return false;
  return true;
}

export function getWelcomeRoomAmbienceEnabled(): boolean {
  const memory = readRaw();
  if (memory.ambienceEnabled === undefined) return true;
  return memory.ambienceEnabled;
}

export function setWelcomeRoomAmbienceEnabled(
  enabled: boolean,
): WelcomeRoomMemory {
  const next = { ...readRaw(), ambienceEnabled: enabled };
  write(next);
  return next;
}

export function getWelcomeRoomWelcomeMode(): WelcomeRoomWelcomeMode | undefined {
  return readRaw().welcomeMode;
}

export function setWelcomeRoomWelcomeMode(
  mode: WelcomeRoomWelcomeMode,
): WelcomeRoomMemory {
  const next = { ...readRaw(), welcomeMode: mode };
  write(next);
  return next;
}

export function resetWelcomeRoomMemoryForTests(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(PENDING_INVITATION_KEY);
}
