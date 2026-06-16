import type { DayLevel, DayState } from "./companionStore";

/** What would help right now — alphabetical, Other always last. */
export const DAY_HELP_NEEDS = [
  "Adjust My Schedule",
  "Brain Dump",
  "Calm Down",
  "Celebrate A Win",
  "Create Something",
  "Decide Something",
  "Find Focus",
  "Get Organized",
  "Make A Plan",
  "Need Encouragement",
  "Problem Solve",
  "Research Something",
  "Start A Task",
  "Talk It Through",
  "Understand Something",
  "Work On A Project",
] as const;

export type DayHelpNeed = (typeof DAY_HELP_NEEDS)[number] | "Other";

export const DAY_HELP_OTHER = "Other" as const;

const LEGACY_NEED_MAP: Record<string, string> = {
  Focus: "Find Focus",
  Calm: "Calm Down",
  Structure: "Get Organized",
  Clarity: "Understand Something",
  Support: "Need Encouragement",
  Motivation: "Need Encouragement",
  "Just Start": "Start A Task",
};

const ALL_KNOWN = new Set<string>([...DAY_HELP_NEEDS, DAY_HELP_OTHER]);

export function dayHelpNeedOptions(): { value: string; label: string }[] {
  return [
    ...DAY_HELP_NEEDS.map((label) => ({ value: label, label })),
    { value: DAY_HELP_OTHER, label: DAY_HELP_OTHER },
  ];
}

/** Normalize stored need — map legacy chip labels to current dropdown options. */
export function normalizeDayHelpNeed(raw: string | undefined | null): {
  selection: string;
  otherText: string;
} {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { selection: "", otherText: "" };
  if (ALL_KNOWN.has(trimmed)) {
    return { selection: trimmed, otherText: "" };
  }
  const mapped = LEGACY_NEED_MAP[trimmed];
  if (mapped) return { selection: mapped, otherText: "" };
  return { selection: DAY_HELP_OTHER, otherText: trimmed };
}

export function primaryHelpNeedFromState(state: DayState | null): string {
  if (!state?.needs?.length) return "";
  const first = state.needs[0]?.trim() ?? "";
  const { selection, otherText } = normalizeDayHelpNeed(first);
  if (selection === DAY_HELP_OTHER && otherText) return otherText;
  if (selection && selection !== DAY_HELP_OTHER) return selection;
  return first;
}

function levelLabel(level: DayLevel): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function formatDayFeeling(state: DayState | null): string {
  if (!state) return "—";
  return `${levelLabel(state.energy)} energy · ${levelLabel(state.overwhelm)} overwhelm`;
}

export function formatDayHelpDisplay(state: DayState | null): string {
  const need = primaryHelpNeedFromState(state);
  return need || "—";
}

export function formatDayNoteDisplay(state: DayState | null): string {
  const note = state?.note?.trim();
  return note || "—";
}

export function formatDaySnapshotTime(state: DayState | null): string | null {
  if (!state?.setAt) return null;
  try {
    return new Date(state.setAt).toLocaleString(undefined, {
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return null;
  }
}

/** Compact line for the AI system prompt — always reflects the latest update. */
export function dayStateSummary(state: DayState | null): string | undefined {
  if (!state) return undefined;
  const feeling = formatDayFeeling(state);
  const help = formatDayHelpDisplay(state);
  const note = formatDayNoteDisplay(state);
  const notePart = note !== "—" ? ` Anything else: ${note}.` : "";
  return `Feeling: ${feeling}. Would help most: ${help}.${notePart} (Latest Adjust My Day update — use this as active context.)`;
}
