/**
 * Account-backed first-login welcome persistence.
 * Authoritative: Supabase auth user_metadata.
 * Local cache for offline / hydration — never sole source of truth.
 */

import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import { markWelcomeIntroSeen } from "@/lib/welcomeHome/firstLaunchPersistence";
import { hasEstablishedAccountWelcomeEvidence } from "./establishedAccount";
import type { FirstLoginWelcomeRecord, MarkWelcomeCompletedOptions } from "./types";
import { resolveWelcomeDisposition } from "./welcomeExperienceConstitution";

const META_COMPLETED = "welcome_completed_at";
const META_AUDIO = "welcome_audio_played_at";
const META_DISPOSITION = "welcome_disposition";
const META_PLATFORM_VERSION = "welcome_platform_version";
const LOCAL_PREFIX = "companion-first-login-welcome-v1:";
const PUSH_RETRIES = 3;

const completionWriteInFlight = new Set<string>();
/** In-memory cache for Node tests / SSR — never sole durable SoT in browser. */
const memoryLocal = new Map<string, FirstLoginWelcomeRecord>();

function localKey(userId: string): string {
  return `${LOCAL_PREFIX}${userId}`;
}

function canUseLocalStorage(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage != null;
  } catch {
    return false;
  }
}

function emptyRecord(): FirstLoginWelcomeRecord {
  return {
    welcomeCompletedAt: null,
    welcomeAudioPlayedAt: null,
    welcomeDisposition: null,
    welcomePlatformVersion: null,
  };
}

function parseRecord(raw: string): FirstLoginWelcomeRecord {
  try {
    const parsed = JSON.parse(raw) as Partial<FirstLoginWelcomeRecord>;
    const disposition =
      parsed.welcomeDisposition === "completed" ||
      parsed.welcomeDisposition === "skipped" ||
      parsed.welcomeDisposition === "dismissed"
        ? parsed.welcomeDisposition
        : null;
    return {
      welcomeCompletedAt:
        typeof parsed.welcomeCompletedAt === "string"
          ? parsed.welcomeCompletedAt
          : null,
      welcomeAudioPlayedAt:
        typeof parsed.welcomeAudioPlayedAt === "string"
          ? parsed.welcomeAudioPlayedAt
          : null,
      welcomeDisposition: disposition,
      welcomePlatformVersion:
        typeof parsed.welcomePlatformVersion === "string"
          ? parsed.welcomePlatformVersion
          : null,
    };
  } catch {
    return emptyRecord();
  }
}

function readLocal(userId: string): FirstLoginWelcomeRecord {
  if (canUseLocalStorage()) {
    try {
      const raw = localStorage.getItem(localKey(userId));
      if (raw) return parseRecord(raw);
    } catch {
      /* fall through */
    }
  }
  return memoryLocal.get(userId) ?? emptyRecord();
}

function writeLocal(userId: string, record: FirstLoginWelcomeRecord): void {
  memoryLocal.set(userId, record);
  if (!canUseLocalStorage()) return;
  try {
    localStorage.setItem(localKey(userId), JSON.stringify(record));
  } catch {
    /* quota */
  }
}

function metadataString(
  metadata: Record<string, unknown> | undefined,
  key: string,
): string | null {
  const value = metadata?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function dispositionFromMetadata(
  metadata: Record<string, unknown> | undefined,
): FirstLoginWelcomeRecord["welcomeDisposition"] {
  const value = metadataString(metadata, META_DISPOSITION);
  if (value === "completed" || value === "skipped" || value === "dismissed") {
    return value;
  }
  return null;
}

export function recordFromUserMetadata(
  metadata: Record<string, unknown> | undefined,
): FirstLoginWelcomeRecord {
  return {
    welcomeCompletedAt: metadataString(metadata, META_COMPLETED),
    welcomeAudioPlayedAt: metadataString(metadata, META_AUDIO),
    welcomeDisposition: dispositionFromMetadata(metadata),
    welcomePlatformVersion: metadataString(metadata, META_PLATFORM_VERSION),
  };
}

/** Merge server + local; completed/audio timestamps win if either side has them. Never clears completion. */
export function mergeWelcomeRecords(
  server: FirstLoginWelcomeRecord,
  local: FirstLoginWelcomeRecord,
): FirstLoginWelcomeRecord {
  return {
    welcomeCompletedAt:
      server.welcomeCompletedAt ?? local.welcomeCompletedAt ?? null,
    welcomeAudioPlayedAt:
      server.welcomeAudioPlayedAt ?? local.welcomeAudioPlayedAt ?? null,
    welcomeDisposition:
      server.welcomeDisposition ?? local.welcomeDisposition ?? null,
    welcomePlatformVersion:
      server.welcomePlatformVersion ?? local.welcomePlatformVersion ?? null,
  };
}

export function isWelcomeCompleted(record: FirstLoginWelcomeRecord): boolean {
  return Boolean(record.welcomeCompletedAt);
}

export type LoadFirstLoginWelcomeOptions = {
  accountCreatedAt?: string | null;
  /** When true, skip established-account migration write (tests). */
  skipMigrationWrite?: boolean;
};

function logWelcomePersistenceFailure(context: string, detail?: unknown): void {
  if (typeof console === "undefined") return;
  try {
    console.warn(`[firstLoginWelcome] ${context}`, detail ?? "");
  } catch {
    /* ignore */
  }
}

async function pushMetadata(
  patch: Record<string, string>,
): Promise<boolean> {
  const supabase = getCompanionSupabase();
  if (!supabase) {
    logWelcomePersistenceFailure("pushMetadata: no supabase client");
    return false;
  }
  for (let attempt = 0; attempt < PUSH_RETRIES; attempt++) {
    try {
      const { error } = await supabase.auth.updateUser({ data: patch });
      if (!error) return true;
      logWelcomePersistenceFailure(
        `pushMetadata attempt ${attempt + 1}`,
        error.message,
      );
    } catch (err) {
      logWelcomePersistenceFailure(`pushMetadata attempt ${attempt + 1}`, err);
    }
  }
  return false;
}

/**
 * Load authoritative welcome record. Migrates established accounts to completed
 * so they never see first-time welcome again after deploy.
 */
export async function loadFirstLoginWelcomeRecord(
  userId: string,
  metadata?: Record<string, unknown>,
  options?: LoadFirstLoginWelcomeOptions,
): Promise<FirstLoginWelcomeRecord> {
  const local = readLocal(userId);
  let server = recordFromUserMetadata(metadata);
  let serverFetchFailed = false;

  if (!server.welcomeCompletedAt || !server.welcomeAudioPlayedAt) {
    const supabase = getCompanionSupabase();
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          serverFetchFailed = true;
          logWelcomePersistenceFailure("getUser", error.message);
        } else if (data.user?.id === userId) {
          server = recordFromUserMetadata(
            data.user.user_metadata as Record<string, unknown> | undefined,
          );
          if (!options?.accountCreatedAt && data.user.created_at) {
            options = {
              ...options,
              accountCreatedAt: data.user.created_at,
            };
          }
        }
      } catch (err) {
        serverFetchFailed = true;
        logWelcomePersistenceFailure("getUser threw", err);
      }
    }
  }

  let merged = mergeWelcomeRecords(server, local);

  if (isWelcomeCompleted(merged)) {
    writeLocal(userId, merged);
    return merged;
  }

  const established = hasEstablishedAccountWelcomeEvidence({
    userId,
    record: merged,
    metadata,
    accountCreatedAt: options?.accountCreatedAt,
  });

  // Failure path: never flash/loop welcome for established users.
  if (serverFetchFailed && established) {
    const at = new Date().toISOString();
    merged = {
      welcomeCompletedAt: at,
      welcomeAudioPlayedAt: merged.welcomeAudioPlayedAt ?? at,
      welcomeDisposition: merged.welcomeDisposition ?? "completed",
      welcomePlatformVersion: merged.welcomePlatformVersion ?? null,
    };
    writeLocal(userId, merged);
    return merged;
  }

  if (established && !options?.skipMigrationWrite) {
    return markWelcomeCompleted(userId);
  }

  writeLocal(userId, merged);
  return merged;
}

export async function markWelcomeAudioPlayed(
  userId: string,
  at: string = new Date().toISOString(),
): Promise<FirstLoginWelcomeRecord> {
  const local = readLocal(userId);
  if (local.welcomeAudioPlayedAt) return local;
  const current = await loadFirstLoginWelcomeRecord(userId, undefined, {
    skipMigrationWrite: true,
  });
  if (current.welcomeAudioPlayedAt) return current;
  const next: FirstLoginWelcomeRecord = {
    ...current,
    welcomeAudioPlayedAt: at,
  };
  writeLocal(userId, next);
  const ok = await pushMetadata({ [META_AUDIO]: at });
  if (!ok) {
    logWelcomePersistenceFailure("markWelcomeAudioPlayed: metadata sync failed");
  }
  return next;
}

/**
 * Member finished or dismissed the welcome gate. Also mirrors Welcome Home intro
 * so the cinematic arrival does not auto-play. Idempotent — never clears completion.
 * Skip and complete both suppress automatic replay (126).
 */
export async function markWelcomeCompleted(
  userId: string,
  atOrOptions: string | MarkWelcomeCompletedOptions = new Date().toISOString(),
): Promise<FirstLoginWelcomeRecord> {
  const options: MarkWelcomeCompletedOptions =
    typeof atOrOptions === "string" ? { at: atOrOptions } : atOrOptions ?? {};
  const at = options.at ?? new Date().toISOString();
  const disposition = resolveWelcomeDisposition({
    skipped: Boolean(options.skipped),
    dismissed: Boolean(options.dismissed),
  });
  const platformVersion = options.platformVersion?.trim() || null;

  if (completionWriteInFlight.has(userId)) {
    const local = readLocal(userId);
    if (local.welcomeCompletedAt) return local;
  }
  completionWriteInFlight.add(userId);
  try {
    const current = await loadFirstLoginWelcomeRecord(userId, undefined, {
      skipMigrationWrite: true,
    });
    if (current.welcomeCompletedAt) {
      writeLocal(userId, current);
      markWelcomeIntroSeen();
      return current;
    }
    const next: FirstLoginWelcomeRecord = {
      welcomeCompletedAt: at,
      welcomeAudioPlayedAt: current.welcomeAudioPlayedAt ?? at,
      welcomeDisposition: disposition,
      welcomePlatformVersion:
        platformVersion ?? current.welcomePlatformVersion ?? null,
    };
    writeLocal(userId, next);
    markWelcomeIntroSeen();
    const patch: Record<string, string> = {
      [META_COMPLETED]: next.welcomeCompletedAt!,
      [META_AUDIO]: next.welcomeAudioPlayedAt!,
      [META_DISPOSITION]: disposition,
    };
    if (next.welcomePlatformVersion) {
      patch[META_PLATFORM_VERSION] = next.welcomePlatformVersion;
    }
    const ok = await pushMetadata(patch);
    if (!ok) {
      logWelcomePersistenceFailure(
        "markWelcomeCompleted: metadata sync failed — local + intro marked; retry on next load",
      );
    }
    return next;
  } finally {
    completionWriteInFlight.delete(userId);
  }
}

/** Manual replay must not clear completion. Tests only. */
export function resetFirstLoginWelcomeLocalForTests(userId: string): void {
  memoryLocal.delete(userId);
  completionWriteInFlight.delete(userId);
  if (!canUseLocalStorage()) return;
  try {
    localStorage.removeItem(localKey(userId));
  } catch {
    /* ignore */
  }
}
