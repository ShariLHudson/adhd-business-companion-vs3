// First-time home starter taps — local-only counts for product learning.

export type StarterChipId =
  | "help_me_write"
  | "im_overwhelmed"
  | "what_should_i_work_on";

export type StarterChipCounts = Record<StarterChipId, number>;

const STORAGE_KEY = "companion-starter-chip-counts-v1";

const ZERO: StarterChipCounts = {
  help_me_write: 0,
  im_overwhelmed: 0,
  what_should_i_work_on: 0,
};

export function getStarterChipCounts(): StarterChipCounts {
  if (typeof window === "undefined") return { ...ZERO };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...ZERO };
    const parsed = JSON.parse(raw) as Partial<StarterChipCounts>;
    return {
      help_me_write: Number(parsed.help_me_write) || 0,
      im_overwhelmed: Number(parsed.im_overwhelmed) || 0,
      what_should_i_work_on: Number(parsed.what_should_i_work_on) || 0,
    };
  } catch {
    return { ...ZERO };
  }
}

/** Increment tap count for a home starter chip. */
export function trackStarterChip(id: StarterChipId): StarterChipCounts {
  const next = getStarterChipCounts();
  next[id] += 1;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  }
  return next;
}

/** Dev / support: read counts from browser console via getStarterChipCounts(). */
export function starterChipSummary(counts = getStarterChipCounts()): string {
  return `help_me_write: ${counts.help_me_write}, im_overwhelmed: ${counts.im_overwhelmed}, what_should_i_work_on: ${counts.what_should_i_work_on}`;
}
