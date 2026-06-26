import type { AppSection } from "@/lib/companionUi";
import type {
  CompanionMotionKind,
  RoomObjectKind,
} from "@/lib/companionEnvironmentIntelligence/types";
import type {
  KinseyPose,
  LivingRoomDepartureSnapshot,
  WildlifeSpecies,
} from "./types";

const STORAGE_KEY = "companion-living-change-history-v1";
const COOLDOWN_MS = {
  kinsey: 3 * 24 * 60 * 60 * 1000,
  wildlife: 2 * 24 * 60 * 60 * 1000,
  heroMotion: 24 * 60 * 60 * 1000,
  hospitality: 12 * 60 * 60 * 1000,
  relationship: 5 * 24 * 60 * 60 * 1000,
  observation: 7 * 24 * 60 * 60 * 1000,
} as const;

let memoryHistory: LivingChangeHistory | null = null;

export type LivingChangeHistoryRecord = {
  id: string;
  at: string;
  kind: "kinsey" | "wildlife" | "hero_motion" | "hospitality" | "relationship" | "observation";
  value: string;
};

export type LivingChangeHistory = {
  records: LivingChangeHistoryRecord[];
  lastKinsey: KinseyPose | null;
  lastWildlife: WildlifeSpecies | null;
  lastHeroMotion: CompanionMotionKind | null;
  lastRoomDepartureAt: string | null;
  lastRoomDepartureSection: AppSection | null;
  lastRoomSnapshot: LivingRoomDepartureSnapshot | null;
};

function emptyHistory(): LivingChangeHistory {
  return {
    records: [],
    lastKinsey: null,
    lastWildlife: null,
    lastHeroMotion: null,
    lastRoomDepartureAt: null,
    lastRoomDepartureSection: null,
    lastRoomSnapshot: null,
  };
}

function readHistory(): LivingChangeHistory {
  if (typeof window === "undefined") {
    return memoryHistory ?? emptyHistory();
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyHistory();
    const parsed = JSON.parse(raw) as LivingChangeHistory;
    return {
      records: Array.isArray(parsed.records) ? parsed.records : [],
      lastKinsey: parsed.lastKinsey ?? null,
      lastWildlife: parsed.lastWildlife ?? null,
      lastHeroMotion: parsed.lastHeroMotion ?? null,
      lastRoomDepartureAt: parsed.lastRoomDepartureAt ?? null,
      lastRoomDepartureSection: parsed.lastRoomDepartureSection ?? null,
      lastRoomSnapshot: parsed.lastRoomSnapshot ?? null,
    };
  } catch {
    return emptyHistory();
  }
}

function writeHistory(history: LivingChangeHistory) {
  if (typeof window === "undefined") {
    memoryHistory = history;
    return;
  }
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...history,
        records: history.records.slice(0, 120),
      }),
    );
  } catch {
    /* quota */
  }
}

export function getLivingChangeHistory(): LivingChangeHistory {
  return readHistory();
}

export function minutesSinceLivingRoomDeparture(now = new Date()): number | null {
  const history = readHistory();
  if (!history.lastRoomDepartureAt) return null;
  const then = new Date(history.lastRoomDepartureAt).getTime();
  if (!Number.isFinite(then)) return null;
  return Math.max(0, (now.getTime() - then) / (1000 * 60));
}

export function recordLivingRoomDeparture(input: {
  toSection: AppSection;
  snapshot: LivingRoomDepartureSnapshot;
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const history = readHistory();
  history.lastRoomDepartureAt = now.toISOString();
  history.lastRoomDepartureSection = input.toSection;
  history.lastRoomSnapshot = input.snapshot;
  writeHistory(history);
}

export function clearLivingRoomDeparture() {
  const history = readHistory();
  history.lastRoomDepartureAt = null;
  history.lastRoomDepartureSection = null;
  history.lastRoomSnapshot = null;
  writeHistory(history);
}

function pushRecord(
  history: LivingChangeHistory,
  kind: LivingChangeHistoryRecord["kind"],
  value: string,
  now: Date,
) {
  history.records.unshift({
    id: `${kind}:${value}:${now.getTime()}`,
    at: now.toISOString(),
    kind,
    value,
  });
}

export function recordLivingChangeApplication(input: {
  kinsey: KinseyPose;
  wildlife: WildlifeSpecies | null;
  heroMotion: CompanionMotionKind | null;
  hospitalityIds: string[];
  relationshipCue: string | null;
  conversationHints: string[];
  memoryTriggerIds?: string[];
  now?: Date;
}) {
  const now = input.now ?? new Date();
  const history = readHistory();

  if (input.kinsey !== "hidden") {
    history.lastKinsey = input.kinsey;
    pushRecord(history, "kinsey", input.kinsey, now);
  }
  if (input.wildlife) {
    history.lastWildlife = input.wildlife;
    pushRecord(history, "wildlife", input.wildlife, now);
  }
  if (input.heroMotion) {
    history.lastHeroMotion = input.heroMotion;
    pushRecord(history, "hero_motion", input.heroMotion, now);
  }
  for (const id of input.hospitalityIds) {
    pushRecord(history, "hospitality", id, now);
  }
  if (input.relationshipCue) {
    pushRecord(history, "relationship", input.relationshipCue, now);
  }
  for (const hint of input.conversationHints) {
    pushRecord(history, "observation", hint, now);
  }
  for (const triggerId of input.memoryTriggerIds ?? []) {
    pushRecord(history, "observation", `memory-trigger:${triggerId}`, now);
  }

  writeHistory(history);
}

export function isOnCooldown(
  kind: LivingChangeHistoryRecord["kind"],
  value: string,
  now = new Date(),
): boolean {
  const history = readHistory();
  const cooldown =
    kind === "kinsey"
      ? COOLDOWN_MS.kinsey
      : kind === "wildlife"
        ? COOLDOWN_MS.wildlife
        : kind === "hero_motion"
          ? COOLDOWN_MS.heroMotion
          : kind === "hospitality"
            ? COOLDOWN_MS.hospitality
            : kind === "relationship"
              ? COOLDOWN_MS.relationship
              : COOLDOWN_MS.observation;

  const recent = history.records.find(
    (record) => record.kind === kind && record.value === value,
  );
  if (!recent) return false;
  const then = new Date(recent.at).getTime();
  return now.getTime() - then < cooldown;
}

/** Test helper — reset persisted history. */
export function clearLivingChangeHistoryForTests() {
  memoryHistory = null;
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
