/**
 * Daily Context Engine™ — Phase 3
 * Context Awareness & Adaptive Intelligence Foundation
 *
 * Shared understanding of today's situation. Observe and adapt presentation —
 * never control schedules without explicit member approval.
 */

import type { DayCondition } from "@/lib/rhythms/types";

export type DailyEnergyLevel = "unknown" | "low" | "medium" | "high";

export type DailyFocusLevel = "unknown" | "scattered" | "steady" | "deep";

export type MeetingLoad = "none" | "light" | "moderate" | "heavy";

export type Interruptibility = "open" | "cautious" | "do_not_disturb";

export type CompanionAvailability = "available" | "light" | "deferred";

export type OptionalPromptPressure = "low" | "moderate" | "high";

/**
 * Provenance for each signal on the Daily Context snapshot.
 * Missing data must stay `unknown` — never silently treated as low energy / overwhelm.
 */
export type SignalProvenance = "user_provided" | "computed" | "unknown";

export type DailyContextSourceSignal = {
  key: string;
  /** Serialized fact when known; omit or null when unavailable. */
  value: string | number | boolean | null;
  provenance: SignalProvenance;
};

export type DailyContextLoads = {
  reminderCount: number;
  reminderDueCount: number;
  rhythmCount: number;
  rhythmDueCount: number;
  meetingLoad: MeetingLoad;
  optionalPromptPressure: OptionalPromptPressure;
};

/**
 * Canonical shared daily situation object.
 * Expand via `extensions` — do not hardcode future product assumptions.
 *
 * Spec-aligned aliases (`date`, `energyLevel`, `generatedAt`, load shorts) mirror
 * the same facts so consumers can read either shape without inventing values.
 */
export type DailyContext = {
  /** Local calendar day YYYY-MM-DD */
  dateKey: string;
  /** Spec alias of dateKey */
  date: string;
  timezone: string;
  builtAt: string;
  /** Spec alias of builtAt */
  generatedAt: string;
  dayCondition: DayCondition | null;
  energy: DailyEnergyLevel;
  /** Spec alias of energy */
  energyLevel: DailyEnergyLevel;
  focusLevel: DailyFocusLevel;
  /** Minutes the member may have for work today — null when unknown. */
  availableWorkMinutes: number | null;
  /** Spec alias of availableWorkMinutes */
  availableTime: number | null;
  loads: DailyContextLoads;
  /** Spec-aligned load shorts (same facts as loads.*). */
  meetingLoad: MeetingLoad;
  reminderLoad: number;
  rhythmLoad: number;
  priorityLoad: number;
  interruptibility: Interruptibility;
  /** Soft priority titles (presentation only — not a permanent reorder). */
  currentPriorities: string[];
  currentPriorityIds: string[];
  activeFocusSession: boolean;
  quietHoursActive: boolean;
  companionAvailability: CompanionAvailability;
  /** Whether optional prompts may surface under today's context. */
  optionalPromptAllowance: boolean;
  /** User-provided vs computed vs unknown — never invent missing facts. */
  sourceSignals: DailyContextSourceSignal[];
  /**
   * Forward-compatible bag. Future engines may attach keys without
   * changing the core shape.
   */
  extensions: Record<string, unknown>;
};

export type BuildDailyContextInput = {
  now?: Date;
  timezone?: string;
  activeFocusSession?: boolean;
  companionAvailable?: boolean;
  currentPriorities?: string[];
  currentPriorityIds?: string[];
  availableWorkMinutes?: number | null;
  extensions?: Record<string, unknown>;
  /** Test / override seams */
  dayCondition?: DayCondition | null;
  energy?: DailyEnergyLevel;
  focusLevel?: DailyFocusLevel;
  quietHoursActive?: boolean;
  reminderCount?: number;
  reminderDueCount?: number;
  rhythmCount?: number;
  rhythmDueCount?: number;
  meetingLoad?: MeetingLoad;
};

export type CompanionAwarenessAdvice = {
  /** Prompt block for Shari — empty when context would not improve the reply. */
  promptBlock: string;
  /** Soft signals for wording / pacing. */
  signals: string[];
  interruptionLevel: Interruptibility;
  suggestionFrequency: "minimal" | "reduced" | "normal";
  /** Explicit non-action guarantee for callers / tests. */
  mayChangeSchedules: false;
};

export type DiscoveryKeyAwarenessDecision = {
  allow: boolean;
  suppress: boolean;
  reasons: string[];
  optional: true;
};
