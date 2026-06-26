/**
 * Carry Forward™ greeting library — natural variations; never analytical.
 */

import type { CarryForwardGreetingEntry } from "./types";

function g(
  partial: Omit<CarryForwardGreetingEntry, "cooldownDays"> & { cooldownDays?: number },
): CarryForwardGreetingEntry {
  return { cooldownDays: 21, ...partial };
}

const MORNING_UNIVERSAL: CarryForwardGreetingEntry[] = [
  g({ id: "cf-m-01", tone: "morning_universal", line: "Good morning." }),
  g({ id: "cf-m-02", tone: "morning_universal", line: "Morning." }),
  g({ id: "cf-m-03", tone: "morning_universal", line: "I'm glad you're here." }),
  g({ id: "cf-m-04", tone: "morning_universal", line: "Good morning. Come in." }),
  g({ id: "cf-m-05", tone: "morning_universal", line: "Morning — good to see you." }),
  g({ id: "cf-m-06", tone: "morning_universal", line: "Hi. Fresh day." }),
  g({ id: "cf-m-07", tone: "morning_universal", line: "Good morning. Take your time." }),
  g({ id: "cf-m-08", tone: "morning_universal", line: "Morning. I'm glad you came." }),
];

const ENDED_WELL: CarryForwardGreetingEntry[] = [
  g({
    id: "cf-well-01",
    tone: "ended_well",
    line: "Good morning. Yesterday felt like a good step forward.",
    followUp: "I hope today builds on that.",
  }),
  g({
    id: "cf-well-02",
    tone: "ended_well",
    line: "Morning. I smiled thinking about yesterday.",
    followUp: "Let's see what today has in store.",
  }),
  g({
    id: "cf-well-03",
    tone: "ended_well",
    line: "Good morning. Yesterday had a good rhythm to it.",
  }),
  g({
    id: "cf-well-04",
    tone: "ended_well",
    line: "Morning. We ended yesterday on a hopeful note.",
  }),
  g({
    id: "cf-well-05",
    tone: "ended_well",
    line: "Good morning. Yesterday felt like you found your footing.",
  }),
  g({
    id: "cf-well-06",
    tone: "ended_well",
    line: "Morning. There's a little momentum carrying into today.",
  }),
];

const ENDED_UNFINISHED: CarryForwardGreetingEntry[] = [
  g({
    id: "cf-unfin-01",
    tone: "ended_unfinished",
    line: "Good morning. Yesterday didn't get finished, and that's okay.",
    followUp: "We have a brand-new day.",
  }),
  g({
    id: "cf-unfin-02",
    tone: "ended_unfinished",
    line: "Morning. We left a few things waiting for us yesterday.",
    followUp: "They'll still be there whenever you're ready.",
  }),
  g({
    id: "cf-unfin-03",
    tone: "ended_unfinished",
    line: "Good morning. Not everything wrapped up yesterday — and that's allowed.",
  }),
  g({
    id: "cf-unfin-04",
    tone: "ended_unfinished",
    line: "Morning. Today doesn't ask you to make up for yesterday.",
  }),
  g({
    id: "cf-unfin-05",
    tone: "ended_unfinished",
    line: "Good morning. A clean start — no catching up required.",
  }),
];

const ENDED_OVERWHELMED: CarryForwardGreetingEntry[] = [
  g({
    id: "cf-over-01",
    tone: "ended_overwhelmed",
    line: "Morning. I'm really glad you came back today.",
    followUp: "We'll take today one step at a time.",
  }),
  g({
    id: "cf-over-02",
    tone: "ended_overwhelmed",
    line: "Good morning. Yesterday was a lot.",
    followUp: "Today can be gentler.",
  }),
  g({
    id: "cf-over-03",
    tone: "ended_overwhelmed",
    line: "Morning. I'm glad you're here.",
    followUp: "No rush. One thing at a time.",
  }),
  g({
    id: "cf-over-04",
    tone: "ended_overwhelmed",
    line: "Good morning. You made it back — that matters.",
  }),
];

const ENDED_WITH_WIN: CarryForwardGreetingEntry[] = [
  g({
    id: "cf-win-01",
    tone: "ended_with_win",
    line: "Good morning. I hope you took a moment to appreciate what you accomplished yesterday.",
  }),
  g({
    id: "cf-win-02",
    tone: "ended_with_win",
    line: "Morning. Yesterday had a real win in it.",
  }),
  g({
    id: "cf-win-03",
    tone: "ended_with_win",
    line: "Good morning. Something good landed yesterday — worth carrying that forward.",
  }),
  g({
    id: "cf-win-04",
    tone: "ended_with_win",
    line: "Morning. Yesterday's progress still counts today.",
  }),
];

const ENDED_FRUSTRATION: CarryForwardGreetingEntry[] = [
  g({
    id: "cf-frust-01",
    tone: "ended_frustration",
    line: "Yesterday was one of those days.",
    followUp: "This one gets to be different.",
  }),
  g({
    id: "cf-frust-02",
    tone: "ended_frustration",
    line: "Good morning. Yesterday had its friction.",
    followUp: "Today starts fresh.",
  }),
  g({
    id: "cf-frust-03",
    tone: "ended_frustration",
    line: "Morning. Yesterday wasn't easy.",
    followUp: "I'm glad you're here anyway.",
  }),
  g({
    id: "cf-frust-04",
    tone: "ended_frustration",
    line: "Good morning. Rough edges yesterday — open door today.",
  }),
];

const ENDED_QUIET: CarryForwardGreetingEntry[] = [
  g({ id: "cf-quiet-01", tone: "ended_quiet", line: "Good morning." }),
  g({ id: "cf-quiet-02", tone: "ended_quiet", line: "Morning." }),
  g({ id: "cf-quiet-03", tone: "ended_quiet", line: "I'm glad you're here." }),
  g({ id: "cf-quiet-04", tone: "ended_quiet", line: "Good morning. Come in." }),
  g({ id: "cf-quiet-05", tone: "ended_quiet", line: "Hi." }),
];

const NATURAL_MEMORY: CarryForwardGreetingEntry[] = [
  g({
    id: "cf-mem-01",
    tone: "ended_well",
    line: "It feels good to see you again.",
  }),
  g({
    id: "cf-mem-02",
    tone: "ended_quiet",
    line: "I've been thinking about our conversation yesterday.",
  }),
  g({
    id: "cf-mem-03",
    tone: "ended_well",
    line: "We ended yesterday on a hopeful note.",
  }),
  g({
    id: "cf-mem-04",
    tone: "ended_unfinished",
    line: "Yesterday felt full — today can breathe.",
  }),
];

export const CARRY_FORWARD_CATALOG: CarryForwardGreetingEntry[] = [
  ...MORNING_UNIVERSAL,
  ...ENDED_WELL,
  ...ENDED_UNFINISHED,
  ...ENDED_OVERWHELMED,
  ...ENDED_WITH_WIN,
  ...ENDED_FRUSTRATION,
  ...ENDED_QUIET,
  ...NATURAL_MEMORY,
];

export const CARRY_FORWARD_BY_ID: ReadonlyMap<string, CarryForwardGreetingEntry> =
  new Map(CARRY_FORWARD_CATALOG.map((e) => [e.id, e]));

export function listCarryForwardForTone(
  tone: CarryForwardGreetingEntry["tone"] | "unknown",
): CarryForwardGreetingEntry[] {
  if (tone === "unknown" || tone === "ended_quiet") {
    return CARRY_FORWARD_CATALOG.filter(
      (e) => e.tone === "ended_quiet" || e.tone === "morning_universal",
    );
  }
  return CARRY_FORWARD_CATALOG.filter(
    (e) => e.tone === tone || e.tone === "morning_universal",
  );
}
