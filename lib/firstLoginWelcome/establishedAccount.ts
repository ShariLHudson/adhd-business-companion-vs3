/**
 * Migration / safety: established accounts must never see first-time welcome again.
 * Evidence is OR'd — any durable signal means onboarding is already done.
 */

import { hasUserOnboarded } from "@/lib/companionOnboarding";
import { getCompanionAuthIntelligence } from "@/lib/companionAuthIntelligence";
import { companionLoginHasHistory } from "@/lib/companionLoginPage";
import { getPrefs, getProjects } from "@/lib/companionStore";
import { hasSeenWelcomeIntro } from "@/lib/welcomeHome/firstLaunchPersistence";
import type { FirstLoginWelcomeRecord } from "./types";

export type EstablishedWelcomeEvidenceInput = {
  userId: string;
  record?: FirstLoginWelcomeRecord | null;
  metadata?: Record<string, unknown>;
  /** Supabase auth user.created_at */
  accountCreatedAt?: string | null;
};

function hasProfileOrActivityEvidence(): boolean {
  try {
    if (hasSeenWelcomeIntro()) return true;
    const prefs = getPrefs();
    if (prefs.hasSeenWelcomeIntro) return true;
    if (prefs.onboarded) return true;
    if (prefs.hasChatted) return true;
    if (typeof prefs.name === "string" && prefs.name.trim().length > 0) {
      return true;
    }
    if (getProjects().length > 0) return true;
    if (companionLoginHasHistory()) return true;
  } catch {
    /* storage unavailable */
  }
  return false;
}

/**
 * True when this authenticated account should never auto-show first-time welcome.
 * Does not clear or rewrite anything — callers persist completion when migrating.
 */
export function hasEstablishedAccountWelcomeEvidence(
  input: EstablishedWelcomeEvidenceInput,
): boolean {
  if (input.record?.welcomeCompletedAt) return true;
  if (input.record?.welcomeAudioPlayedAt) return true;

  const meta = input.metadata;
  if (meta) {
    const completed = meta.welcome_completed_at;
    const audio = meta.welcome_audio_played_at;
    if (typeof completed === "string" && completed.trim()) return true;
    if (typeof audio === "string" && audio.trim()) return true;
  }

  try {
    if (hasUserOnboarded(input.userId)) return true;
  } catch {
    /* ignore */
  }

  if (hasProfileOrActivityEvidence()) return true;

  try {
    const loginCount = getCompanionAuthIntelligence().loginCount;
    if (loginCount > 1 && companionLoginHasHistory()) return true;
  } catch {
    /* ignore */
  }

  return false;
}
