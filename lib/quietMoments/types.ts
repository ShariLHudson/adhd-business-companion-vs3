/**
 * Quiet Moments — everything that happens between conversations.
 * @see docs/companion-homestead/QUIET_MOMENTS.md
 */

import type { HospitalityMotionId } from "@/lib/companionHospitalityPrototype";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";
import type { CommunicationAnchorMode } from "@/lib/companionCommunicationAnchor";

export const QUIET_MOMENTS_PHASES = [
  "active",
  "settling",
  "quiet",
  "deep-quiet",
] as const;

export type QuietMomentsPhase = (typeof QUIET_MOMENTS_PHASES)[number];

export const SHARI_QUIET_POSTURES = [
  "reading",
  "writing",
  "window",
  "craft",
  "kinsey",
  "relaxed",
] as const;

export type ShariQuietPosture = (typeof SHARI_QUIET_POSTURES)[number];

export type TemporalDrift = {
  /** Subtle light warmth shift over idle time */
  lightWarmthDelta: number;
  /** Steam intensity 0–1 — gentler over time */
  steamIntensity: number;
  /** Optional cloud drift enabled */
  cloudDrift: boolean;
  /** Almost imperceptible — guest may wonder if they imagined it */
  subtle: true;
};

export type QuietMomentsInput = {
  /** Ms since last user message or keystroke */
  idleMs: number;
  isUserTyping?: boolean;
  isAssistantStreaming?: boolean;
  timeOfDay?: WelcomeTimeOfDay;
  season?: WelcomeSeason;
  recoveryGentle?: boolean;
  flooded?: boolean;
  /** Minutes since last visit — ADHD return without guilt */
  returnAfterMinutes?: number | null;
  roomId?: string;
};

export type QuietMomentsIntelligence = {
  phase: QuietMomentsPhase;
  anchorMode: CommunicationAnchorMode;
  shariPosture: ShariQuietPosture;
  allowedMotions: HospitalityMotionId[];
  temporalDrift: TemporalDrift | null;
  /** Never surface idle tips, quotes, or productivity nudges in this phase */
  suppressIdleEntertainment: boolean;
  /** Welcome return identically — no guilt copy */
  welcomeReturnWithoutGuilt: boolean;
  ambientAudioEligible: boolean;
  /** Five-minute test — would a silent guest feel peaceful, not awkward? */
  fiveMinuteTestPassed: boolean;
};

export type ForbiddenIdleCopyVerdict = {
  forbidden: boolean;
  reason: string | null;
};
