/**
 * Rhythm profiles — starter bundles (Phase 6).
 * Never silent bulk-enable: activateRhythmProfile returns preview then creates on confirm.
 */

import { createMemberRhythm } from "./store";
import { saveRhythmPrefs } from "./prefs";
import type {
  MemberRhythm,
  NotificationLevel,
  RhythmCadence,
  RhythmCategory,
  RhythmPriority,
  RhythmTimeWindow,
} from "./types";

export type RhythmProfileId =
  | "gentle_companion"
  | "entrepreneur"
  | "momentum_builder"
  | "health_wellness"
  | "minimal"
  | "custom";

export type RhythmProfileTemplate = {
  title: string;
  details?: string;
  category: RhythmCategory;
  cadence: RhythmCadence;
  window: RhythmTimeWindow;
  exactTime?: string;
  weekdays?: MemberRhythm["schedule"]["weekdays"];
  priority: RhythmPriority;
  /** Health templates require explicit opt-in. */
  requiresHealthOptIn?: boolean;
};

export type RhythmProfileDef = {
  id: RhythmProfileId;
  label: string;
  description: string;
  defaultNotificationLevel: NotificationLevel;
  templates: RhythmProfileTemplate[];
};

export const RHYTHM_PROFILES: RhythmProfileDef[] = [
  {
    id: "gentle_companion",
    label: "Gentle Companion",
    description: "Light support — a few calm check-ins.",
    defaultNotificationLevel: "gentle",
    templates: [
      {
        title: "Morning welcome",
        category: "companion",
        cadence: "daily",
        window: "morning",
        priority: "supportive",
      },
      {
        title: "Midday check-in",
        category: "companion",
        cadence: "daily",
        window: "afternoon",
        priority: "optional",
      },
      {
        title: "Evening wind-down",
        category: "companion",
        cadence: "daily",
        window: "evening",
        priority: "supportive",
      },
      {
        title: "Weekly planning invitation",
        category: "business",
        cadence: "weekly",
        window: "morning",
        weekdays: ["monday"],
        priority: "important",
      },
    ],
  },
  {
    id: "entrepreneur",
    label: "Entrepreneur",
    description: "Business routines without nagging.",
    defaultNotificationLevel: "supportive",
    templates: [
      {
        title: "Morning priorities",
        category: "business",
        cadence: "daily",
        window: "morning",
        priority: "important",
      },
      {
        title: "Calendar review",
        category: "calendar",
        cadence: "daily",
        window: "morning",
        priority: "supportive",
      },
      {
        title: "Client follow-up",
        category: "business",
        cadence: "weekly",
        window: "afternoon",
        weekdays: ["wednesday"],
        priority: "important",
      },
      {
        title: "Friday finance review",
        category: "business",
        cadence: "weekly",
        window: "afternoon",
        weekdays: ["friday"],
        priority: "important",
        exactTime: "14:00",
      },
      {
        title: "Weekly planning",
        category: "business",
        cadence: "weekly",
        window: "morning",
        weekdays: ["monday"],
        priority: "important",
      },
    ],
  },
  {
    id: "momentum_builder",
    label: "Momentum Builder",
    description: "Help beginning and returning after interruptions.",
    defaultNotificationLevel: "supportive",
    templates: [
      {
        title: "Start the day",
        category: "focus",
        cadence: "daily",
        window: "morning",
        priority: "important",
      },
      {
        title: "Focus session offer",
        category: "focus",
        cadence: "daily",
        window: "afternoon",
        priority: "supportive",
      },
      {
        title: "End-of-day progress capture",
        category: "focus",
        cadence: "daily",
        window: "evening",
        priority: "supportive",
      },
    ],
  },
  {
    id: "health_wellness",
    label: "Health and Wellness",
    description:
      "User-selected care reminders — organizational support only, not medical advice.",
    defaultNotificationLevel: "gentle",
    templates: [
      {
        title: "Water",
        category: "wellness",
        cadence: "daily",
        window: "morning",
        priority: "supportive",
        requiresHealthOptIn: true,
      },
      {
        title: "Meals",
        category: "wellness",
        cadence: "daily",
        window: "afternoon",
        priority: "supportive",
        requiresHealthOptIn: true,
      },
      {
        title: "Movement",
        category: "wellness",
        cadence: "daily",
        window: "afternoon",
        priority: "optional",
        requiresHealthOptIn: true,
      },
      {
        title: "Sleep preparation",
        category: "wellness",
        cadence: "daily",
        window: "evening",
        priority: "supportive",
        requiresHealthOptIn: true,
      },
    ],
  },
  {
    id: "minimal",
    label: "Minimal Support",
    description: "Critical and user-created only — no motivational prompts.",
    defaultNotificationLevel: "quiet",
    templates: [],
  },
  {
    id: "custom",
    label: "Custom",
    description: "Choose each rhythm yourself.",
    defaultNotificationLevel: "custom",
    templates: [],
  },
];

export function previewProfileRhythms(
  profileId: RhythmProfileId,
  opts?: { includeHealth?: boolean },
): RhythmProfileTemplate[] {
  const profile = RHYTHM_PROFILES.find((p) => p.id === profileId);
  if (!profile) return [];
  return profile.templates.filter(
    (t) => !t.requiresHealthOptIn || opts?.includeHealth,
  );
}

/**
 * Creates rhythms from a reviewed template list. Caller must show preview first.
 */
export function activateRhythmProfile(
  profileId: RhythmProfileId,
  selectedTitles: string[],
  opts?: { includeHealth?: boolean },
): MemberRhythm[] {
  const profile = RHYTHM_PROFILES.find((p) => p.id === profileId);
  if (!profile) return [];

  saveRhythmPrefs({
    notificationLevel: profile.defaultNotificationLevel,
  });

  const templates = previewProfileRhythms(profileId, opts).filter((t) =>
    selectedTitles.includes(t.title),
  );

  return templates.map((t) =>
    createMemberRhythm({
      title: t.title,
      details: t.details,
      cadence: t.cadence,
      category: t.category,
      priority: t.priority,
      source: "profile",
      window: t.exactTime ? "exact" : t.window,
      schedule: {
        cadence: t.cadence,
        exactTime: t.exactTime,
        weekdays: t.weekdays,
      },
    }),
  );
}
