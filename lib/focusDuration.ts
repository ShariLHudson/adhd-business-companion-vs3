/** Focus session duration — minute-level, with quick picks + custom entry. */

export const FOCUS_QUICK_PICKS = [5, 10, 12, 15, 20, 25, 30, 45, 60, 90] as const;

const PREFS_KEY = "companion-preferred-focus-minutes-v1";

export function clampFocusMinutes(value: number): number {
  if (!Number.isFinite(value)) return 25;
  return Math.min(180, Math.max(1, Math.round(value)));
}

export function loadPreferredFocusMinutes(): number {
  if (typeof window === "undefined") return 25;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return 25;
    const n = parseInt(raw, 10);
    return clampFocusMinutes(n);
  } catch {
    return 25;
  }
}

export function savePreferredFocusMinutes(minutes: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, String(clampFocusMinutes(minutes)));
  } catch {
    /* noop */
  }
}

/** Parse user text like "17 minutes", "17", "focus for 17 min". */
export function parseFocusMinutesFromText(text: string): number | null {
  const t = text.trim();
  if (!t) return null;

  const patterns = [
    /^(\d{1,3})\s*min(?:ute)?s?\.?$/i,
    /^for\s+(\d{1,3})\s*min(?:ute)?s?\.?$/i,
    /^(\d{1,3})\s*[-–]?\s*min(?:ute)?s?\s+(?:focus|timer|session|block)/i,
    /(?:focus|work|timer|session)\s+(?:for\s+)?(\d{1,3})\s*min/i,
    /^(?:do|try|start|run|set)\s+(?:a\s+)?(\d{1,3})\s*min/i,
    /\bset\s+(?:a\s+)?(\d{1,3})\s*min(?:ute)?s?\s+timer/i,
    /\b(\d{1,3})\s*min(?:ute)?s?\s+timer\b/i,
    /\btimer\s+for\s+(\d{1,3})\s*min/i,
  ];

  for (const re of patterns) {
    const m = t.match(re);
    if (m?.[1]) return clampFocusMinutes(parseInt(m[1], 10));
  }

  if (/^\d{1,3}$/.test(t)) {
    const n = parseInt(t, 10);
    if (n >= 1 && n <= 180) return n;
  }

  return null;
}

export function formatFocusDuration(minutes: number): string {
  const m = clampFocusMinutes(minutes);
  if (m % 60 === 0 && m >= 60) return `${m / 60} hr`;
  return `${m} min`;
}
