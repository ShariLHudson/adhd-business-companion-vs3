/**
 * Canonical Founder local-date helpers for daily FIRE portfolios.
 *
 * Limitation: uses the runtime's local calendar (browser on client, Node process
 * timezone on SSR). There is no separate founder-configured date boundary in the
 * repository yet — both sides should stay consistent for a given environment.
 */

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

/** `YYYY-MM-DD` from the runtime's local calendar. */
export function toFounderLocalDateKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Human-readable date for FIRE cover meta (local calendar). */
export function formatFounderLocalDateDisplay(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

export function firePortfolioIdForDateKey(dateKey: string): string {
  if (!DATE_KEY_RE.test(dateKey)) {
    throw new Error(`Invalid founder date key: ${dateKey}`);
  }
  return `fire-${dateKey}`;
}

/**
 * Stable issue number from the date key (days since 2024-01-01, local parts).
 * Deterministic — never random, never wall-clock milliseconds.
 */
export function stableFireIssueNumberForDateKey(dateKey: string): number {
  if (!DATE_KEY_RE.test(dateKey)) {
    throw new Error(`Invalid founder date key: ${dateKey}`);
  }
  const [y, m, d] = dateKey.split("-").map(Number);
  const utcDay = Date.UTC(y, m - 1, d);
  const epoch = Date.UTC(2024, 0, 1);
  return 1 + Math.floor((utcDay - epoch) / 86_400_000);
}

/** Parse `YYYY-MM-DD` into a local Date at noon (avoids DST edge shifts). */
export function founderLocalDateFromKey(dateKey: string): Date {
  if (!DATE_KEY_RE.test(dateKey)) {
    throw new Error(`Invalid founder date key: ${dateKey}`);
  }
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function isFounderLocalDateKey(value: string): boolean {
  return DATE_KEY_RE.test(value);
}
