/**
 * Stable routing contract for My Day → Reminders / Rhythms.
 *
 * Welcome Home owns the menu structure. Wire My Day’s single
 * “Reminders / Rhythms” row to {@link openRemindersRhythmsEntranceActionId}
 * (CompanionPageClient: `openRemindersRhythmsCore`).
 *
 * Do not put separate Reminders and Rhythms rows back under My Day.
 * Individual rooms (`reminders`, `rhythms`) remain reachable after the
 * member chooses a path from this shared entrance.
 */

/** AppSection for the shared explanatory entrance. */
export const REMINDERS_RHYTHMS_ENTRANCE_SECTION = "reminders-rhythms" as const;

/** Member-facing My Day label (Welcome Home agent owns the menu row). */
export const REMINDERS_RHYTHMS_ENTRANCE_LABEL = "Reminders / Rhythms";

/**
 * Action id for CompanionPageClient / EstateRoomExperienceMenu wiring.
 * Call this from My Day — not openRemindersCore / openRhythmsCore.
 */
export const REMINDERS_RHYTHMS_ENTRANCE_ACTION_ID =
  "openRemindersRhythmsCore" as const;

/** Suggested Welcome Home destination id (for the sibling nav agent). */
export const REMINDERS_RHYTHMS_NAV_DESTINATION_ID = "reminders-rhythms" as const;

export type RemindersRhythmsEntranceSection =
  typeof REMINDERS_RHYTHMS_ENTRANCE_SECTION;

export type RemindersRhythmsPath = "reminder" | "rhythm" | "help-me-choose";

export const REMINDERS_RHYTHMS_ENTRANCE = {
  sectionId: REMINDERS_RHYTHMS_ENTRANCE_SECTION,
  actionId: REMINDERS_RHYTHMS_ENTRANCE_ACTION_ID,
  navDestinationId: REMINDERS_RHYTHMS_NAV_DESTINATION_ID,
  label: REMINDERS_RHYTHMS_ENTRANCE_LABEL,
  /** After Help Me Choose / Create — open these dedicated rooms. */
  reminderSection: "reminders" as const,
  rhythmSection: "rhythms" as const,
} as const;
