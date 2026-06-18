/**
 * Momentum Appointments — shame-free time intentions.
 * Success = movement, not perfect execution. Momentum Over Perfection.
 */

import type { BlockStatus, TimeBlock } from "./companionStore";
import { todayStr } from "./companionStore";

export const MOMENTUM_APPOINTMENT_TITLE = "Momentum Appointments";
export const MOMENTUM_APPOINTMENT_BANK = "Ready When You Are";
export const DEFAULT_MOMENTUM_GOAL = "Move this forward.";

export type MomentumWhenPreset =
  | "now"
  | "morning"
  | "afternoon"
  | "evening"
  | "specific";

export const MOMENTUM_WHEN_OPTIONS: {
  id: MomentumWhenPreset;
  label: string;
}[] = [
  { id: "now", label: "Now" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
  { id: "specific", label: "Specific time" },
];

export const MOMENTUM_DURATION_OPTIONS = [15, 30, 45] as const;

export type MomentumCheckInOutcome =
  | "finished"
  | "progress"
  | "other-important"
  | "not-today";

export type MomentumNotTodayAction =
  | "try-tomorrow"
  | "make-smaller"
  | "reschedule"
  | "parking-lot"
  | "let-go"
  | "talk-through";

export type MomentumOtherImportantPayload = {
  whatGotAttention: string;
  updateAppointment: boolean;
  newTitle?: string;
};

/** Normalize legacy failure language — never surface "missed" to users. */
export function normalizeBlockStatus(status: BlockStatus): BlockStatus {
  if (status === "missed") return "not-today";
  return status;
}

export function normalizeTimeBlock(block: TimeBlock): TimeBlock {
  const status = normalizeBlockStatus(block.status);
  if (status === block.status) return block;
  return { ...block, status };
}

export type MomentumStatusDisplay = {
  label: string;
  symbol: string;
  tone: "neutral" | "positive" | "soft";
};

/** Movement-based statuses — all valid outcomes. */
export function momentumStatusDisplay(
  status: BlockStatus,
): MomentumStatusDisplay {
  switch (normalizeBlockStatus(status)) {
    case "pending":
      return { label: "Ready When You Are", symbol: "○", tone: "neutral" };
    case "triggered":
      return { label: "Started", symbol: "◐", tone: "positive" };
    case "progress":
      return { label: "Made Progress", symbol: "◑", tone: "positive" };
    case "completed":
      return { label: "Finished", symbol: "●", tone: "positive" };
    case "not-today":
      return { label: "Not Today", symbol: "○", tone: "soft" };
    case "snoozed":
      return { label: "Waiting For A Better Time", symbol: "○", tone: "soft" };
    default:
      return { label: "Still Available", symbol: "○", tone: "neutral" };
  }
}

export function statusForCheckInOutcome(
  outcome: MomentumCheckInOutcome,
): BlockStatus {
  switch (outcome) {
    case "finished":
      return "completed";
    case "progress":
    case "other-important":
      return "progress";
    case "not-today":
      return "not-today";
  }
}

export function checkInAckMessage(
  outcome: MomentumCheckInOutcome,
  title: string,
): string {
  switch (outcome) {
    case "finished":
      return `Nice — **${title}** is done. That counts.`;
    case "progress":
      return `Progress on **${title}** — momentum matters more than finishing.`;
    case "other-important":
      return `You moved something important today — reality counts more than the plan. **${title}** is still here when you're ready.`;
    case "not-today":
      return `Today went a different direction. **${title}** is still here when you're ready.`;
  }
}

export function notTodayFollowUpMessage(action: MomentumNotTodayAction): string {
  switch (action) {
    case "try-tomorrow":
      return "Moved to tomorrow — still on your list, zero guilt.";
    case "make-smaller":
      return "Let's shrink it — even five minutes forward counts.";
    case "reschedule":
      return "Pick a new time whenever it fits — no rush.";
    case "parking-lot":
      return "Parked for later — it's safe, not forgotten.";
    case "let-go":
      return "Released with kindness. You can always add a new appointment later.";
    case "talk-through":
      return "Let's talk it through — overwhelm, fear, and resistance are valid. No judgment.";
  }
}

export function otherImportantFollowUpPrompt(title: string): string {
  return `What ended up getting your attention today instead of **${title}**?`;
}

export function otherImportantUpdateOffer(attention: string): string {
  const snippet = attention.trim().slice(0, 80);
  return `That sounds important${snippet ? ` — "${snippet}"` : ""}. Would you like me to update your Momentum Appointment based on what actually happened?`;
}

export function talkThroughChatOpener(block: TimeBlock): string {
  return (
    `I wanted to work on **${block.title}** but it didn't happen today. ` +
    `Can you help me understand what's in the way — overwhelm, fear, uncertainty, or something else? No pressure to fix it right now.`
  );
}

export function formatMomentumDuration(block: TimeBlock): string {
  if (block.durationFlexible) return "Flexible";
  if (block.durationMin <= 0) return "Flexible";
  if (block.durationMin === 60) return "1 hour";
  if (block.durationMin % 60 === 0) return `${block.durationMin / 60} hr`;
  return `${block.durationMin} min`;
}

export function formatMomentumWhen(block: TimeBlock): string {
  if (!block.date) return "Ready when you are";
  const preset = block.whenPreset;
  if (preset === "morning") return "Morning";
  if (preset === "afternoon") return "Afternoon";
  if (preset === "evening") return "Evening";
  if (preset === "now") return "Now";
  if (block.startTime) return block.startTime;
  return "Scheduled";
}

function padTime(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function applyWhenPreset(
  preset: MomentumWhenPreset,
  opts?: { date?: string; startTime?: string },
): { date: string; startTime: string; whenPreset: MomentumWhenPreset } {
  const date = opts?.date?.trim() || todayStr();
  if (preset === "specific") {
    return {
      date,
      startTime: opts?.startTime?.trim() || "09:00",
      whenPreset: "specific",
    };
  }
  if (preset === "now") {
    const now = new Date();
    return {
      date: todayStr(),
      startTime: padTime(now.getHours(), now.getMinutes()),
      whenPreset: "now",
    };
  }
  const times: Record<Exclude<MomentumWhenPreset, "specific" | "now">, string> =
    {
      morning: "09:00",
      afternoon: "14:00",
      evening: "18:00",
    };
  return {
    date: preset === "morning" || preset === "afternoon" || preset === "evening"
      ? todayStr()
      : date,
    startTime: times[preset as keyof typeof times] ?? "09:00",
    whenPreset: preset,
  };
}

export function momentumAppointmentHintForChat(): string {
  return [
    "MOMENTUM APPOINTMENTS (mandatory — shame-free scheduling):",
    "- User-facing name: Momentum Appointments (not Time Block).",
    "- Success = movement, not completion. Ready When You Are, Started, Made Progress, and Finished are ALL valid.",
    "- Never say missed, overdue, incomplete, or failed. Use: Not Today, Waiting For A Better Time, Still Available, Ready When You Are.",
    "- When an appointment arrives, ask \"How did it go?\" — never \"Did you do it?\"",
    "- Every outcome is accepted without judgment. Momentum Over Perfection.",
  ].join("\n");
}
