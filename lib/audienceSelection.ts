/**
 * Audience Selection — the one canonical, reusable audience-selection model for
 * the platform. Future workspaces (Create, Projects, Marketing, …) adopt this
 * contract instead of inventing their own.
 *
 * Phase 1: the pure foundation only — the contract, completeness filtering,
 * validation / normalization, and a persistence round-trip. No workspace
 * integration, no storage wiring. Pure functions take `avatars` as input so
 * they are fully testable without localStorage.
 */

import type { IdealClientAvatar } from "@/lib/companionStore";
import { isAvatarCompleteEnough } from "@/lib/crossWorkspaceGuidance";

/** How many audiences the member is aiming at. */
export type AudienceSelectionMode = "none" | "single" | "multiple" | "all";

/** How to produce output when several audiences are chosen. */
export type MultiAvatarOutputMode =
  | "shared" // one result across all selected audiences
  | "separate" // a distinct result per audience
  | "tailored" // one shared foundation with per-audience variations
  | "compare"; // compare the audiences before creating anything

/** The canonical, persistable audience-selection contract. */
export type AudienceSelection = {
  selectionMode: AudienceSelectionMode;
  /** Explicit picks for single/multiple. Empty for none/all (all resolves live). */
  selectedAvatarIds: string[];
  /** Whether draft (incomplete) avatars may be used. Default false. */
  includeDrafts: boolean;
  /** Only meaningful when >1 audience resolves. */
  multiAvatarOutputMode: MultiAvatarOutputMode;
  /** Set when a workspace inherited this from its parent project. */
  inheritedFromProject?: boolean;
  /** One-off override for the current generation, without changing the saved value. */
  overrideForCurrentGeneration?: boolean;
  /** ISO timestamp of the last change. */
  lastUpdatedAt: string;
};

/** Member-facing labels — never surface technical wording. */
export const AUDIENCE_MODE_LABELS: Record<AudienceSelectionMode, string> = {
  none: "No specific audience",
  single: "Choose one Client Avatar",
  multiple: "Choose several Client Avatars",
  all: "Use all completed Client Avatars",
};

export const OUTPUT_MODE_LABELS: Record<MultiAvatarOutputMode, string> = {
  shared: "One shared version for all of them",
  separate: "A separate version for each",
  tailored: "One shared foundation with tailored variations",
  compare: "Compare the audiences first",
};

export const AUDIENCE_SELECTION_MODES: readonly AudienceSelectionMode[] = [
  "none",
  "single",
  "multiple",
  "all",
];

export const MULTI_AVATAR_OUTPUT_MODES: readonly MultiAvatarOutputMode[] = [
  "shared",
  "separate",
  "tailored",
  "compare",
];

function nowIso(now?: string): string {
  return now ?? new Date().toISOString();
}

export function createDefaultAudienceSelection(now?: string): AudienceSelection {
  return {
    selectionMode: "none",
    selectedAvatarIds: [],
    includeDrafts: false,
    multiAvatarOutputMode: "shared",
    lastUpdatedAt: nowIso(now),
  };
}

/** "Completed" is defined by the existing completeness heuristic. */
export function isAvatarCompleted(avatar: IdealClientAvatar): boolean {
  return isAvatarCompleteEnough(avatar);
}

export function completedAvatars(
  avatars: IdealClientAvatar[],
): IdealClientAvatar[] {
  return avatars.filter(isAvatarCompleted);
}

/** Avatars eligible to feed generated work, honoring the drafts setting. */
export function eligibleAvatars(
  avatars: IdealClientAvatar[],
  includeDrafts: boolean,
): IdealClientAvatar[] {
  return includeDrafts ? avatars.slice() : completedAvatars(avatars);
}

/**
 * Normalize a selection against the real avatar list: drop stale/invalid ids,
 * drop drafts when they aren't allowed, keep single/multiple/all consistent,
 * and clamp the output mode. Never mutates the input.
 */
export function normalizeAudienceSelection(
  input: AudienceSelection,
  avatars: IdealClientAvatar[],
  now?: string,
): AudienceSelection {
  const eligible = eligibleAvatars(avatars, input.includeDrafts);
  const eligibleIds = new Set(eligible.map((a) => a.id));

  let selectionMode = input.selectionMode;
  let selectedAvatarIds: string[] = [];

  if (selectionMode === "single") {
    // First still-eligible pick; empty if none remain.
    const first = input.selectedAvatarIds.find((id) => eligibleIds.has(id));
    selectedAvatarIds = first ? [first] : [];
  } else if (selectionMode === "multiple") {
    // De-duplicated, still-eligible picks in original order.
    const seen = new Set<string>();
    selectedAvatarIds = input.selectedAvatarIds.filter((id) => {
      if (seen.has(id) || !eligibleIds.has(id)) return false;
      seen.add(id);
      return true;
    });
  }
  // "none" and "all" carry no explicit ids (all resolves live at request time).

  const multiAvatarOutputMode = MULTI_AVATAR_OUTPUT_MODES.includes(
    input.multiAvatarOutputMode,
  )
    ? input.multiAvatarOutputMode
    : "shared";

  return {
    selectionMode,
    selectedAvatarIds,
    includeDrafts: Boolean(input.includeDrafts),
    multiAvatarOutputMode,
    ...(input.inheritedFromProject
      ? { inheritedFromProject: true }
      : {}),
    ...(input.overrideForCurrentGeneration
      ? { overrideForCurrentGeneration: true }
      : {}),
    lastUpdatedAt: input.lastUpdatedAt || nowIso(now),
  };
}

/**
 * The ONLY helper that stamps a fresh `lastUpdatedAt` — call it when the member
 * actually changes the selection (mode, ids, includeDrafts, output mode, or the
 * inheritance / override flags). Reads (normalize/parse/resolve/serialize) never
 * regenerate the timestamp, so a routine load never looks "newly changed".
 */
export function updateAudienceSelection(
  current: AudienceSelection,
  patch: Partial<AudienceSelection>,
  avatars: IdealClientAvatar[],
  now?: string,
): AudienceSelection {
  const merged: AudienceSelection = {
    ...current,
    ...patch,
    lastUpdatedAt: nowIso(now),
  };
  return normalizeAudienceSelection(merged, avatars, now);
}

/**
 * The avatars that will actually feed generation for this selection — after
 * completeness filtering. "all" resolves live to every eligible avatar.
 */
export function resolveSelectedAvatars(
  selection: AudienceSelection,
  avatars: IdealClientAvatar[],
): IdealClientAvatar[] {
  const eligible = eligibleAvatars(avatars, selection.includeDrafts);
  if (selection.selectionMode === "none") return [];
  if (selection.selectionMode === "all") return eligible;
  const eligibleById = new Map(eligible.map((a) => [a.id, a]));
  const ids =
    selection.selectionMode === "single"
      ? selection.selectedAvatarIds.slice(0, 1)
      : selection.selectedAvatarIds;
  return ids
    .map((id) => eligibleById.get(id))
    .filter((a): a is IdealClientAvatar => Boolean(a));
}

/** Output-strategy choices only matter when more than one audience resolves. */
export function outputStrategyApplies(
  selection: AudienceSelection,
  avatars: IdealClientAvatar[],
): boolean {
  return resolveSelectedAvatars(selection, avatars).length > 1;
}

/** True only when the sole avatars available are drafts. */
export function onlyDraftsAvailable(avatars: IdealClientAvatar[]): boolean {
  return avatars.length > 0 && completedAvatars(avatars).length === 0;
}

// ---- Persistence round-trip --------------------------------------------------

export function serializeAudienceSelection(
  selection: AudienceSelection,
): string {
  return JSON.stringify(selection);
}

/** Parse untrusted stored/JSON input into a valid, normalized selection. */
export function parseAudienceSelection(
  raw: unknown,
  avatars: IdealClientAvatar[],
  now?: string,
): AudienceSelection {
  const obj: Record<string, unknown> =
    typeof raw === "string"
      ? safeJson(raw)
      : raw && typeof raw === "object"
        ? (raw as Record<string, unknown>)
        : {};

  const selectionMode = AUDIENCE_SELECTION_MODES.includes(
    obj.selectionMode as AudienceSelectionMode,
  )
    ? (obj.selectionMode as AudienceSelectionMode)
    : "none";
  const selectedAvatarIds = Array.isArray(obj.selectedAvatarIds)
    ? obj.selectedAvatarIds.filter((x): x is string => typeof x === "string")
    : [];
  const includeDrafts = obj.includeDrafts === true;
  const multiAvatarOutputMode = MULTI_AVATAR_OUTPUT_MODES.includes(
    obj.multiAvatarOutputMode as MultiAvatarOutputMode,
  )
    ? (obj.multiAvatarOutputMode as MultiAvatarOutputMode)
    : "shared";

  return normalizeAudienceSelection(
    {
      selectionMode,
      selectedAvatarIds,
      includeDrafts,
      multiAvatarOutputMode,
      inheritedFromProject: obj.inheritedFromProject === true,
      overrideForCurrentGeneration: obj.overrideForCurrentGeneration === true,
      lastUpdatedAt:
        typeof obj.lastUpdatedAt === "string" ? obj.lastUpdatedAt : nowIso(now),
    },
    avatars,
    now,
  );
}

function safeJson(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}
