/**
 * Recognition message library — warm, human, never guilt-based.
 *
 * Each category reserves MESSAGE_SLOT_CAPACITY slots for future copy.
 * Empty strings are placeholders — skipped at pick time.
 * Add new lines by replacing "" entries or appending before the pad.
 */

export const MESSAGE_SLOT_CAPACITY = 10;

export type MessageCategory =
  | "birthday"
  | "anniversary"
  | "membership_anniversary"
  | "encouragement"
  | "milestone"
  | "celebration"
  | "vacation_countdown"
  | "custom_event";

/** Pad a starter pool to MESSAGE_SLOT_CAPACITY reserved slots. */
export function padMessageSlots(
  starters: readonly string[],
  capacity = MESSAGE_SLOT_CAPACITY,
): readonly string[] {
  const out = [...starters];
  while (out.length < capacity) out.push("");
  return out;
}

export const RECOGNITION_MESSAGE_LIBRARY = {
  birthday: padMessageSlots([
    "Happy birthday, {name}. I'm glad you're here — today is about you.",
    "It's your day, {name}. However you spend it, you deserve something good.",
    "Happy birthday. You don't have to earn today — just enjoy a piece of it.",
  ]),
  anniversary: padMessageSlots([
    "Today is {label} — I remembered because you told me it matters.",
    "{label} is today. Glad I get to mark it with you, {name}.",
    "An anniversary worth noting: {label}. However you feel today, I'm here.",
  ]),
  membership_anniversary: padMessageSlots([
    "You've been part of this ecosystem for {duration} — I'm glad you're still here.",
    "{duration} with us. That's real presence, not a streak — just you showing up when it matters.",
    "Today marks {duration}. Thanks for building your work here, {name}.",
  ]),
  encouragement: padMessageSlots([
    "I see you keeping at it, {name}. That counts, even on the quiet days.",
    "You're moving forward — not perfectly, but genuinely. That matters.",
    "Whatever today brings, you don't have to carry it alone.",
  ]),
  milestone: padMessageSlots([
    "You hit a milestone: {milestone}. Worth pausing to notice.",
    "{milestone} — that's progress you can point to, {name}.",
    "Something shifted: {milestone}. Take a breath and let it land.",
  ]),
  celebration: padMessageSlots([
    "This is worth celebrating — {milestone}.",
    "Look what you did: {milestone}. I'm genuinely happy for you.",
    "{milestone}. A small win is still a win.",
  ]),
  vacation_countdown: padMessageSlots([
    "{label} is coming up in {days} days — a little something to look forward to.",
    "{days} days until {label}. You've earned the anticipation.",
    "Almost time for {label} — {days} days to go.",
  ]),
  custom_event: padMessageSlots([
    "Today is {label} — I remembered because you told me it matters.",
    "{label} is today. Glad I get to mark it with you, {name}.",
    "You marked {label} as important. I'm glad to remember it with you.",
  ]),
} as const satisfies Record<MessageCategory, readonly string[]>;

export function activeMessages(category: MessageCategory): string[] {
  return RECOGNITION_MESSAGE_LIBRARY[category].filter(Boolean);
}

export function pickRotatingMessage(
  category: MessageCategory,
  rotationKey: string,
  vars: Record<string, string> = {},
): string {
  const pool = activeMessages(category);
  if (!pool.length) return "";
  let hash = 0;
  for (let i = 0; i < rotationKey.length; i++) {
    hash = (hash * 31 + rotationKey.charCodeAt(i)) | 0;
  }
  const idx = Math.abs(hash) % pool.length;
  let text = pool[idx];
  for (const [key, value] of Object.entries(vars)) {
    text = text.replaceAll(`{${key}}`, value);
  }
  return text.replace(/\{name\}/g, vars.name?.trim() || "friend");
}
