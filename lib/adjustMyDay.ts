import type { DayLevel, DayState } from "./companionStore";

export const DAY_ENERGY_LEVELS = [
  { id: "off-charts", label: "🚀 Off The Charts" },
  { id: "full-tank", label: "⚡ Full Tank" },
  { id: "ready-to-roll", label: "😊 Ready To Roll" },
  { id: "doing-okay", label: "🙂 Doing Okay" },
  { id: "running-on-fumes", label: "😴 Running On Fumes" },
  { id: "need-recharge", label: "🛌 Need A Recharge" },
] as const;

export const DAY_MOTIVATION_LEVELS = [
  { id: "cant-wait", label: "🔥 Can't Wait To Start" },
  { id: "lets-do-this", label: "✨ Let's Do This" },
  { id: "get-it-done", label: "👍 I'll Get It Done" },
  { id: "need-push", label: "🤷 Need A Little Push" },
  { id: "dragging", label: "🐢 Dragging My Feet" },
  { id: "not-happening", label: "🧱 Not Happening Today" },
] as const;

export const DAY_VIBES = [
  { id: "feeling-good", label: "😎 Feeling Good" },
  { id: "doing-okay", label: "😊 Doing Okay" },
  { id: "mixed-bag", label: "😐 Mixed Bag" },
  { id: "struggling", label: "😕 Struggling A Bit" },
  { id: "rough-day", label: "😩 Rough Day" },
] as const;

export const DAY_HELP_OPTIONS = [
  { id: "brain-dump", label: "🧠 Brain Dump" },
  { id: "build-something", label: "🛠️ Build Something" },
  { id: "calm-my-mind", label: "🌤️ Calm My Mind" },
  { id: "focus-session", label: "🎯 Focus Session" },
  { id: "get-started", label: "🚀 Get Started" },
  { id: "make-a-plan", label: "📋 Make A Plan" },
  { id: "research", label: "🔍 Research Something" },
  { id: "solve-problem", label: "⚖️ Solve A Problem" },
  { id: "talk-through", label: "💬 Talk It Through" },
  { id: "time-block", label: "⏰ Time Block My Day" },
  { id: "other", label: "✏️ Other" },
] as const;

export type DayEnergyLevelId = (typeof DAY_ENERGY_LEVELS)[number]["id"];
export type DayMotivationLevelId = (typeof DAY_MOTIVATION_LEVELS)[number]["id"];
export type DayVibeId = (typeof DAY_VIBES)[number]["id"];
export type DayHelpOptionId = (typeof DAY_HELP_OPTIONS)[number]["id"];

export const DAY_HELP_OTHER = "other" as const;

const LEGACY_NEED_MAP: Record<string, DayHelpOptionId> = {
  "Adjust My Schedule": "time-block",
  "Brain Dump": "brain-dump",
  "Calm Down": "calm-my-mind",
  "Calm My Mind": "calm-my-mind",
  "Celebrate A Win": "talk-through",
  "Create Something": "build-something",
  "Build Something": "build-something",
  "Decide Something": "solve-problem",
  "Find Focus": "focus-session",
  Focus: "focus-session",
  "Get Organized": "make-a-plan",
  "Make A Plan": "make-a-plan",
  "Need Encouragement": "talk-through",
  "Problem Solve": "solve-problem",
  "Research Something": "research",
  "Start A Task": "get-started",
  "Get Started": "get-started",
  "Talk It Through": "talk-through",
  "Understand Something": "research",
  "Work On A Project": "build-something",
  Other: "other",
};

export function dayHelpNeedOptions(): { value: string; label: string }[] {
  return DAY_HELP_OPTIONS.map((o) => ({ value: o.id, label: o.label }));
}

export function labelForEnergyLevel(id: string | undefined | null): string {
  return DAY_ENERGY_LEVELS.find((o) => o.id === id)?.label ?? "—";
}

export function labelForMotivationLevel(id: string | undefined | null): string {
  return DAY_MOTIVATION_LEVELS.find((o) => o.id === id)?.label ?? "—";
}

export function labelForVibe(id: string | undefined | null): string {
  if (!id) return "—";
  return DAY_VIBES.find((o) => o.id === id)?.label ?? "—";
}

export function labelForHelpNeed(id: string, custom?: string): string {
  if (id === DAY_HELP_OTHER && custom?.trim()) return custom.trim();
  const opt = DAY_HELP_OPTIONS.find((o) => o.id === id);
  return opt?.label ?? id;
}

/** Map new energy levels to legacy DayLevel for coaching heuristics. */
export function energyLevelToLegacy(id: DayEnergyLevelId): DayLevel {
  switch (id) {
    case "off-charts":
    case "full-tank":
      return "high";
    case "running-on-fumes":
    case "need-recharge":
      return "low";
    default:
      return "medium";
  }
}

/** Map motivation to legacy overwhelm field (low drive ≈ harder day). */
export function motivationLevelToLegacyOverwhelm(id: DayMotivationLevelId): DayLevel {
  switch (id) {
    case "cant-wait":
    case "lets-do-this":
      return "low";
    case "not-happening":
    case "dragging":
      return "high";
    default:
      return "medium";
  }
}

/** Normalize stored need — map legacy labels to current option ids. */
export function normalizeDayHelpNeed(raw: string | undefined | null): {
  selection: string;
  otherText: string;
} {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return { selection: "", otherText: "" };
  const byId = DAY_HELP_OPTIONS.find((o) => o.id === trimmed);
  if (byId) return { selection: byId.id, otherText: "" };
  const mapped = LEGACY_NEED_MAP[trimmed];
  if (mapped) return { selection: mapped, otherText: "" };
  return { selection: DAY_HELP_OTHER, otherText: trimmed };
}

export function primaryHelpNeedFromState(state: DayState | null): string {
  if (!state?.needs?.length) return "";
  const first = state.needs[0]?.trim() ?? "";
  const { selection, otherText } = normalizeDayHelpNeed(first);
  return labelForHelpNeed(selection, otherText);
}

export function formatDayEnergyDisplay(state: DayState | null): string {
  if (!state) return "—";
  if (state.energyLevel) return labelForEnergyLevel(state.energyLevel);
  const legacy =
    state.energy === "high"
      ? "⚡ Full Tank"
      : state.energy === "low"
        ? "😴 Running On Fumes"
        : "🙂 Doing Okay";
  return legacy;
}

export function formatDayMotivationDisplay(state: DayState | null): string {
  if (!state) return "—";
  if (state.motivationLevel) return labelForMotivationLevel(state.motivationLevel);
  const legacy =
    state.overwhelm === "high"
      ? "🐢 Dragging My Feet"
      : state.overwhelm === "low"
        ? "✨ Let's Do This"
        : "👍 I'll Get It Done";
  return legacy;
}

/** @deprecated use formatDayEnergyDisplay + formatDayMotivationDisplay */
export function formatDayFeeling(state: DayState | null): string {
  if (!state) return "—";
  return `${formatDayEnergyDisplay(state)} · ${formatDayMotivationDisplay(state)}`;
}

export function formatDayVibeDisplay(state: DayState | null): string {
  return labelForVibe(state?.vibe ?? null);
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

export function migrateLegacyDayState(parsed: DayState): DayState {
  let energyLevel = parsed.energyLevel;
  let motivationLevel = parsed.motivationLevel;
  if (!energyLevel) {
    energyLevel =
      parsed.energy === "high"
        ? "full-tank"
        : parsed.energy === "low"
          ? "running-on-fumes"
          : "doing-okay";
  }
  if (!motivationLevel) {
    motivationLevel =
      parsed.overwhelm === "high"
        ? "dragging"
        : parsed.overwhelm === "low"
          ? "lets-do-this"
          : "get-it-done";
  }
  return {
    ...parsed,
    energyLevel,
    motivationLevel,
    energy: energyLevelToLegacy(energyLevel),
    overwhelm: motivationLevelToLegacyOverwhelm(motivationLevel),
  };
}

/** Compact line for the AI system prompt — always reflects the latest update. */
export function dayStateSummary(state: DayState | null): string | undefined {
  if (!state) return undefined;
  const s = migrateLegacyDayState(state);
  const vibe =
    s.vibe && s.vibe !== undefined ? ` Vibe: ${labelForVibe(s.vibe)}.` : "";
  const energy = formatDayEnergyDisplay(s);
  const motivation = formatDayMotivationDisplay(s);
  const help = formatDayHelpDisplay(s);
  const note = formatDayNoteDisplay(s);
  const notePart = note !== "—" ? ` Context: ${note}.` : "";
  return `Energy: ${energy}. Motivation: ${motivation}.${vibe} Would help most: ${help}.${notePart} (Latest Adjust My Day — use as active context; low fuel = smaller steps; low motivation = gentle starts.)`;
}
