/**
 * Account-backed first-login welcome persistence.
 * Authoritative: Supabase auth user_metadata.
 * Local fallback while metadata loads / offline.
 */

import { getCompanionSupabase } from "@/lib/supabase/companionClient";
import { markWelcomeIntroSeen } from "@/lib/welcomeHome/firstLaunchPersistence";
import type { FirstLoginWelcomeRecord } from "./types";

const META_COMPLETED = "welcome_completed_at";
const META_AUDIO = "welcome_audio_played_at";
const LOCAL_PREFIX = "companion-first-login-welcome-v1:";

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

function readLocal(userId: string): FirstLoginWelcomeRecord {
  if (!canUseLocalStorage()) {
    return { welcomeCompletedAt: null, welcomeAudioPlayedAt: null };
  }
  try {
    const raw = localStorage.getItem(localKey(userId));
    if (!raw) {
      return { welcomeCompletedAt: null, welcomeAudioPlayedAt: null };
    }
    const parsed = JSON.parse(raw) as Partial<FirstLoginWelcomeRecord>;
    return {
      welcomeCompletedAt:
        typeof parsed.welcomeCompletedAt === "string"
          ? parsed.welcomeCompletedAt
          : null,
      welcomeAudioPlayedAt:
        typeof parsed.welcomeAudioPlayedAt === "string"
          ? parsed.welcomeAudioPlayedAt
          : null,
    };
  } catch {
    return { welcomeCompletedAt: null, welcomeAudioPlayedAt: null };
  }
}

function writeLocal(userId: string, record: FirstLoginWelcomeRecord): void {
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

export function recordFromUserMetadata(
  metadata: Record<string, unknown> | undefined,
): FirstLoginWelcomeRecord {
  return {
    welcomeCompletedAt: metadataString(metadata, META_COMPLETED),
    welcomeAudioPlayedAt: metadataString(metadata, META_AUDIO),
  };
}

/** Merge server + local; completed/audio timestamps win if either side has them. */
export function mergeWelcomeRecords(
  server: FirstLoginWelcomeRecord,
  local: FirstLoginWelcomeRecord,
): FirstLoginWelcomeRecord {
  return {
    welcomeCompletedAt:
      server.welcomeCompletedAt ?? local.welcomeCompletedAt ?? null,
    welcomeAudioPlayedAt:
      server.welcomeAudioPlayedAt ?? local.welcomeAudioPlayedAt ?? null,
  };
}

export function isWelcomeCompleted(record: FirstLoginWelcomeRecord): boolean {
  return Boolean(record.welcomeCompletedAt);
}

export async function loadFirstLoginWelcomeRecord(
  userId: string,
  metadata?: Record<string, unknown>,
): Promise<FirstLoginWelcomeRecord> {
  const local = readLocal(userId);
  let server = recordFromUserMetadata(metadata);

  if (!server.welcomeCompletedAt || !server.welcomeAudioPlayedAt) {
    const supabase = getCompanionSupabase();
    if (supabase) {
      try {
        const { data } = await supabase.auth.getUser();
        if (data.user?.id === userId) {
          server = recordFromUserMetadata(
            data.user.user_metadata as Record<string, unknown> | undefined,
          );
        }
      } catch {
        /* keep local */
      }
    }
  }

  const merged = mergeWelcomeRecords(server, local);
  writeLocal(userId, merged);
  return merged;
}

async function pushMetadata(
  patch: Record<string, string>,
): Promise<boolean> {
  const supabase = getCompanionSupabase();
  if (!supabase) return false;
  try {
    const { error } = await supabase.auth.updateUser({ data: patch });
    return !error;
  } catch {
    return false;
  }
}

export async function markWelcomeAudioPlayed(
  userId: string,
  at: string = new Date().toISOString(),
): Promise<FirstLoginWelcomeRecord> {
  const local = readLocal(userId);
  if (local.welcomeAudioPlayedAt) return local;
  const current = await loadFirstLoginWelcomeRecord(userId);
  if (current.welcomeAudioPlayedAt) return current;
  const next: FirstLoginWelcomeRecord = {
    ...current,
    welcomeAudioPlayedAt: at,
  };
  writeLocal(userId, next);
  await pushMetadata({ [META_AUDIO]: at });
  return next;
}

/**
 * Member finished the welcome gate. Also mirrors Welcome Home intro so the
 * cinematic arrival does not replay automatically.
 */
export async function markWelcomeCompleted(
  userId: string,
  at: string = new Date().toISOString(),
): Promise<FirstLoginWelcomeRecord> {
  const current = await loadFirstLoginWelcomeRecord(userId);
  const next: FirstLoginWelcomeRecord = {
    welcomeCompletedAt: current.welcomeCompletedAt ?? at,
    welcomeAudioPlayedAt: current.welcomeAudioPlayedAt ?? at,
  };
  writeLocal(userId, next);
  markWelcomeIntroSeen();
  await pushMetadata({
    [META_COMPLETED]: next.welcomeCompletedAt!,
    [META_AUDIO]: next.welcomeAudioPlayedAt!,
  });
  return next;
}

/** Manual replay must not clear completion. */
export function resetFirstLoginWelcomeLocalForTests(userId: string): void {
  if (!canUseLocalStorage()) return;
  localStorage.removeItem(localKey(userId));
}
