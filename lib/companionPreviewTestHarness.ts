/**
 * Preview-only experience test harness — never enabled on production.
 *
 * Arm with `?previewTest=1` on a Vercel preview or local dev build.
 * Overrides live in sessionStorage only; reset clears them without touching
 * member prefs, login count, or discovery history in localStorage.
 */

import {
  evaluateDiscoveryKeySession,
  type DiscoveryKeySessionState,
} from "@/lib/estateDiscovery/discoveryKeySystem";
import { InMemoryDiscoveryHistoryStore } from "@/lib/estateDiscovery/discoveryHistory";
import {
  createEmptyMemberJourneyProgress,
  recordDiscoveryViewed,
} from "@/lib/estateProgressiveDiscoveryJourney";

export const COMPANION_PREVIEW_TEST_QUERY = "previewTest" as const;
export const COMPANION_PREVIEW_TEST_ARMED_KEY =
  "companion-preview-test-armed-v1" as const;
export const COMPANION_PREVIEW_TEST_LAUNCH_KEY =
  "companion-preview-test-launch-v1" as const;
export const COMPANION_PREVIEW_TEST_REVISION_KEY =
  "companion-preview-test-revision-v1" as const;

export type CompanionPreviewTestLaunchTarget =
  | "welcome-home"
  | "discovery-key"
  | "shari-arrival"
  | "profile-estate";

export type CompanionPreviewTestLaunch = {
  target: CompanionPreviewTestLaunchTarget;
  roomId?: string;
  profileRoomId?: string;
  discoverySession?: DiscoveryKeySessionState | null;
};

function isNonProductionCompanionEnvironment(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname?.toLowerCase() ?? "";
    if (host === "localhost" || host === "127.0.0.1") return true;
    if (host.endsWith(".vercel.app")) return true;
  }

  const vercelEnv =
    process.env.NEXT_PUBLIC_VERCEL_ENV?.trim().toLowerCase() ??
    process.env.VERCEL_ENV?.trim().toLowerCase();

  if (vercelEnv === "production") return false;
  if (process.env.NODE_ENV === "production" && vercelEnv !== "preview") {
    return false;
  }
  return true;
}

export function companionPreviewTestQuerySuffix(): string {
  if (!isCompanionPreviewTestHarnessArmed()) return "";
  return `?${COMPANION_PREVIEW_TEST_QUERY}=1`;
}

export function isCompanionPreviewTestHarnessAvailable(): boolean {
  return isNonProductionCompanionEnvironment();
}

export function armCompanionPreviewTestHarnessFromQuery(
  searchParams?: URLSearchParams | string | null,
): boolean {
  if (!isCompanionPreviewTestHarnessAvailable()) return false;
  if (typeof window === "undefined") return false;

  const params =
    typeof searchParams === "string"
      ? new URLSearchParams(searchParams)
      : searchParams ?? new URLSearchParams(window.location.search);

  if (params.get(COMPANION_PREVIEW_TEST_QUERY) !== "1") return false;

  try {
    sessionStorage.setItem(COMPANION_PREVIEW_TEST_ARMED_KEY, "1");
    return true;
  } catch {
    return false;
  }
}

export function isCompanionPreviewTestHarnessArmed(): boolean {
  if (!isCompanionPreviewTestHarnessAvailable()) return false;
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(COMPANION_PREVIEW_TEST_ARMED_KEY) === "1";
  } catch {
    return false;
  }
}

export function isCompanionPreviewTestSessionActive(): boolean {
  return Boolean(getCompanionPreviewTestLaunch());
}

export function getCompanionPreviewTestRevision(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(sessionStorage.getItem(COMPANION_PREVIEW_TEST_REVISION_KEY) ?? "0");
  } catch {
    return 0;
  }
}

function bumpCompanionPreviewTestRevision(): void {
  if (typeof window === "undefined") return;
  try {
    const next = getCompanionPreviewTestRevision() + 1;
    sessionStorage.setItem(COMPANION_PREVIEW_TEST_REVISION_KEY, String(next));
  } catch {
    /* quota */
  }
}

export function getCompanionPreviewTestLaunch(): CompanionPreviewTestLaunch | null {
  if (!isCompanionPreviewTestHarnessArmed()) return null;
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(COMPANION_PREVIEW_TEST_LAUNCH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CompanionPreviewTestLaunch;
  } catch {
    return null;
  }
}

export function setCompanionPreviewTestLaunch(
  launch: CompanionPreviewTestLaunch | null,
): void {
  if (!isCompanionPreviewTestHarnessArmed()) return;
  if (typeof window === "undefined") return;
  try {
    if (!launch) {
      sessionStorage.removeItem(COMPANION_PREVIEW_TEST_LAUNCH_KEY);
    } else {
      sessionStorage.setItem(
        COMPANION_PREVIEW_TEST_LAUNCH_KEY,
        JSON.stringify(launch),
      );
    }
    bumpCompanionPreviewTestRevision();
  } catch {
    /* quota */
  }
}

export function clearCompanionPreviewTestLaunch(): void {
  setCompanionPreviewTestLaunch(null);
}

export function resetCompanionPreviewTestHarness(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(COMPANION_PREVIEW_TEST_LAUNCH_KEY);
    bumpCompanionPreviewTestRevision();
  } catch {
    /* quota */
  }
}

/** In-memory discovery session for preview — does not read or write local history. */
export function buildPreviewDiscoveryKeySession(
  memberId: string,
  roomId = "greenhouse",
): DiscoveryKeySessionState | null {
  const store = new InMemoryDiscoveryHistoryStore();
  let journeyProgress = createEmptyMemberJourneyProgress(memberId);
  for (const id of [
    "DISC-001",
    "DISC-002",
    "DISC-003",
    "DISC-004",
    "DISC-005",
    "DISC-006",
    "DISC-007",
    "DISC-008",
    "DISC-009",
    "DISC-010",
  ]) {
    journeyProgress = recordDiscoveryViewed(journeyProgress, id);
  }

  return evaluateDiscoveryKeySession({
    memberId,
    currentRoomId: roomId,
    memberContext: {
      roomVisitCounts: { [roomId]: 0 },
      featuresUsed: [],
    },
    historyStore: store,
    journeyProgress,
  });
}
