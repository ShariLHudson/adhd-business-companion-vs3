/**
 * Local completion store for first-time experiences that are not yet
 * fully account-metadata backed. Welcome audio remains in firstLoginWelcome.
 */

import type {
  FirstTimeExperienceDisposition,
  FirstTimeExperienceId,
  FirstTimeExperienceRecord,
  MarkFirstTimeExperienceOptions,
} from "./types";
import { getFirstTimeExperienceDefinition } from "./registry";
import {
  isWelcomeCompleted,
  loadFirstLoginWelcomeRecord,
  shouldSuppressAutomaticWelcome,
} from "@/lib/firstLoginWelcome";
import { hasSeenWelcomeIntro } from "@/lib/welcomeHome/firstLaunchPersistence";

const LOCAL_PREFIX = "spark.fte.v1:";
const memory = new Map<string, FirstTimeExperienceRecord>();

function storageKey(userId: string, experienceId: FirstTimeExperienceId): string {
  return `${LOCAL_PREFIX}${userId}:${experienceId}`;
}

function canUseLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage != null;
  } catch {
    return false;
  }
}

function emptyRecord(
  experienceId: FirstTimeExperienceId,
): FirstTimeExperienceRecord {
  return {
    experienceId,
    completedAt: null,
    disposition: null,
  };
}

function readLocal(
  userId: string,
  experienceId: FirstTimeExperienceId,
): FirstTimeExperienceRecord {
  const key = storageKey(userId, experienceId);
  if (canUseLocalStorage()) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<FirstTimeExperienceRecord>;
        return {
          experienceId,
          completedAt:
            typeof parsed.completedAt === "string" ? parsed.completedAt : null,
          disposition:
            parsed.disposition === "completed" ||
            parsed.disposition === "skipped" ||
            parsed.disposition === "dismissed"
              ? parsed.disposition
              : null,
        };
      }
    } catch {
      /* fall through */
    }
  }
  return memory.get(key) ?? emptyRecord(experienceId);
}

function writeLocal(
  userId: string,
  record: FirstTimeExperienceRecord,
): void {
  const key = storageKey(userId, record.experienceId);
  memory.set(key, record);
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(key, JSON.stringify(record));
  } catch {
    /* quota */
  }
}

export function isFirstTimeExperienceCompleted(
  record: FirstTimeExperienceRecord,
): boolean {
  return Boolean(record.completedAt);
}

/**
 * Automatic presentation gate. Manual replay always allowed by callers —
 * this only answers "may we interrupt?"
 */
export async function shouldAutoPresentFirstTimeExperience(
  userId: string | null | undefined,
  experienceId: FirstTimeExperienceId,
): Promise<boolean> {
  const def = getFirstTimeExperienceDefinition(experienceId);
  if (!def.mayAutoPresent) return false;
  if (!userId) return false;

  if (experienceId === "welcome-audio") {
    const record = await loadFirstLoginWelcomeRecord(userId);
    return !shouldSuppressAutomaticWelcome(record);
  }

  if (experienceId === "welcome-home-cinematic") {
    return !hasSeenWelcomeIntro();
  }

  const local = readLocal(userId, experienceId);
  return !isFirstTimeExperienceCompleted(local);
}

export function markFirstTimeExperienceSeen(
  userId: string,
  experienceId: FirstTimeExperienceId,
  options?: MarkFirstTimeExperienceOptions,
): FirstTimeExperienceRecord {
  if (options?.isManualReplay) {
    return readLocal(userId, experienceId);
  }
  const current = readLocal(userId, experienceId);
  if (current.completedAt) return current;
  const next: FirstTimeExperienceRecord = {
    experienceId,
    completedAt: options?.at ?? new Date().toISOString(),
    disposition: options?.disposition ?? "completed",
  };
  writeLocal(userId, next);
  return next;
}

export function getFirstTimeExperienceRecord(
  userId: string,
  experienceId: FirstTimeExperienceId,
): FirstTimeExperienceRecord {
  return readLocal(userId, experienceId);
}

/** Tests only. */
export function resetFirstTimeExperienceLocalForTests(
  userId: string,
  experienceId?: FirstTimeExperienceId,
): void {
  const ids = experienceId
    ? [experienceId]
    : ([
        "welcome-audio",
        "welcome-home-cinematic",
        "estate-tour",
        "how-everything-works-together",
        "room-introduction",
        "feature-introduction",
      ] as const);
  for (const id of ids) {
    const key = storageKey(userId, id);
    memory.delete(key);
    if (canUseLocalStorage()) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    }
  }
}

export async function isWelcomeAudioCompletedForAccount(
  userId: string,
): Promise<boolean> {
  const record = await loadFirstLoginWelcomeRecord(userId);
  return isWelcomeCompleted(record);
}

export type { FirstTimeExperienceDisposition };
