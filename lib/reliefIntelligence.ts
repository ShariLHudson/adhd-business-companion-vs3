/**
 * Relief Intelligence™ — invisible layer for Clear My Mind™.
 *
 * Learns what helps this individual feel lighter. Never surfaced as analytics.
 * Informs companion tone only — not content analysis.
 */

import { safeLocalStorageSet } from "./companionStorageRecovery";

const STORAGE_KEY = "companion-relief-intelligence-v1";
const MAX_EVENTS = 120;

export type ReliefInputMode = "voice" | "typing" | "mixed";

export type ReliefSignal =
  | {
      kind: "share";
      mode: ReliefInputMode;
      wordCount: number;
      itemCount: number;
      sessionId: string;
    }
  | { kind: "continued-capture"; sessionId: string }
  | { kind: "opened-my-thoughts"; sessionId: string }
  | { kind: "opened-planning"; sessionId: string }
  | { kind: "session-ended"; sessionId: string; shareCount: number };

export type ReliefProfile = {
  voiceShares: number;
  typingShares: number;
  mixedShares: number;
  longSingleDumps: number;
  multiItemShares: number;
  continuedCaptureCount: number;
  openedMyThoughtsCount: number;
  openedPlanningCount: number;
  sessionEndCount: number;
  singleShareSessions: number;
  multiShareSessions: number;
  lastSessionId: string | null;
  lastShareAt: string | null;
  updatedAt: string;
};

export type ReliefCompanionHints = {
  prefersVoice: boolean;
  prefersTyping: boolean;
  prefersShortResponses: boolean;
  oftenContinuesSharing: boolean;
};

type ReliefEvent = ReliefSignal & { at: string };

type ReliefStore = {
  profile: ReliefProfile;
  events: ReliefEvent[];
};

function emptyProfile(): ReliefProfile {
  return {
    voiceShares: 0,
    typingShares: 0,
    mixedShares: 0,
    longSingleDumps: 0,
    multiItemShares: 0,
    continuedCaptureCount: 0,
    openedMyThoughtsCount: 0,
    openedPlanningCount: 0,
    sessionEndCount: 0,
    singleShareSessions: 0,
    multiShareSessions: 0,
    lastSessionId: null,
    lastShareAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function read(): ReliefStore {
  if (typeof window === "undefined") {
    return { profile: emptyProfile(), events: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { profile: emptyProfile(), events: [] };
    const parsed = JSON.parse(raw) as ReliefStore;
    return {
      profile: { ...emptyProfile(), ...parsed.profile },
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };
  } catch {
    return { profile: emptyProfile(), events: [] };
  }
}

function write(store: ReliefStore): void {
  if (typeof window === "undefined") return;
  const payload = JSON.stringify(store);
  if (safeLocalStorageSet(STORAGE_KEY, payload)) return;
  const trimmed = {
    profile: store.profile,
    events: store.events.slice(0, Math.floor(MAX_EVENTS / 2)),
  };
  safeLocalStorageSet(STORAGE_KEY, JSON.stringify(trimmed));
}

function applySignal(profile: ReliefProfile, signal: ReliefSignal): ReliefProfile {
  const next = { ...profile, updatedAt: new Date().toISOString() };

  if (signal.kind === "share") {
    if (signal.mode === "voice") next.voiceShares += 1;
    else if (signal.mode === "typing") next.typingShares += 1;
    else next.mixedShares += 1;
    if (signal.itemCount > 1) next.multiItemShares += 1;
    if (signal.itemCount === 1 && signal.wordCount >= 40) {
      next.longSingleDumps += 1;
    }
    next.lastSessionId = signal.sessionId;
    next.lastShareAt = new Date().toISOString();
    return next;
  }

  if (signal.kind === "continued-capture") {
    next.continuedCaptureCount += 1;
    return next;
  }

  if (signal.kind === "opened-my-thoughts") {
    next.openedMyThoughtsCount += 1;
    return next;
  }

  if (signal.kind === "opened-planning") {
    next.openedPlanningCount += 1;
    return next;
  }

  if (signal.kind === "session-ended") {
    next.sessionEndCount += 1;
    if (signal.shareCount <= 1) next.singleShareSessions += 1;
    else next.multiShareSessions += 1;
    return next;
  }

  return next;
}

/** Record a relief signal — silent, never user-facing. */
export function recordReliefSignal(signal: ReliefSignal): void {
  const store = read();
  const event: ReliefEvent = { ...signal, at: new Date().toISOString() };
  store.profile = applySignal(store.profile, signal);
  store.events = [event, ...store.events].slice(0, MAX_EVENTS);
  write(store);
}

export function getReliefProfile(): ReliefProfile {
  return read().profile;
}

/** Hints for companion voice — relationship, not analytics. */
export function getReliefCompanionHints(): ReliefCompanionHints {
  const p = read().profile;
  const voiceTotal = p.voiceShares + p.mixedShares;
  const typingTotal = p.typingShares + p.mixedShares;
  const shareTotal = voiceTotal + typingTotal || 1;

  return {
    prefersVoice: voiceTotal / shareTotal >= 0.55,
    prefersTyping: typingTotal / shareTotal >= 0.55,
    prefersShortResponses:
      p.multiShareSessions + p.continuedCaptureCount >=
        Math.max(1, p.sessionEndCount) ||
      p.multiItemShares >= p.longSingleDumps,
    oftenContinuesSharing:
      p.continuedCaptureCount >= 2 || p.multiShareSessions >= 2,
  };
}

/** Cross-page read — other workspaces may use for invisible continuity. */
export function getReliefContextForEcosystem(): {
  profile: ReliefProfile;
  hints: ReliefCompanionHints;
  recentlyCaptured: boolean;
} {
  const profile = getReliefProfile();
  const hints = getReliefCompanionHints();
  const recentlyCaptured = profile.lastShareAt
    ? Date.now() - new Date(profile.lastShareAt).getTime() < 2 * 60 * 60 * 1000
    : false;
  return { profile, hints, recentlyCaptured };
}
