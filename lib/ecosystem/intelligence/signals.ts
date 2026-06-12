// Shared signal helpers for the Intelligence engines. Pure, no side effects.

import type { FounderEvent } from "../events";

export const MARKETING_RE =
  /\bmarketing|funnel|audience|content|post|reach|seo|ads?|campaign|newsletter|social\b/i;
export const SALES_RE =
  /\bsales|sell|close|pitch|proposal|lead|prospect|outreach|follow ?up|invoice|client call\b/i;
export const OUTREACH_RE =
  /\boutreach|cold (email|call)|dm|reach out|follow ?up|prospect|networking\b/i;
export const PROCRASTINATION_RE =
  /\bprocrastinat|putting off|avoid(ing|ed)?|can'?t (start|get going)|keep delaying|haven'?t started|distract/i;
export const LOW_ENERGY_RE =
  /\blow energy|no energy|tired|exhaust|drained|burn(t|ed)? out\b/i;
export const OVERWHELM_RE =
  /\boverwhelm|too much|so much|drowning|everything at once\b/i;

export const dayKey = (ts: string) => ts.slice(0, 10);
export const hourOf = (ts: string) => new Date(ts).getUTCHours();
export const weekday = (ts: string) =>
  ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][
    new Date(ts).getUTCDay()
  ]!;
export const daysBetween = (a: string, b: string) =>
  Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86400000;
export const daysAgoFrom = (now: string, ts: string) =>
  (new Date(now).getTime() - new Date(ts).getTime()) / 86400000;

export const asStr = (v: unknown): string => (typeof v === "string" ? v : "");
export const asNum = (v: unknown): number =>
  typeof v === "number" ? v : 0;

export function eventText(e: FounderEvent): string {
  return [e.userMessage, asStr(e.data?.text), asStr(e.data?.title)]
    .filter(Boolean)
    .join(" ");
}

export function severityFromFrequency(n: number): "low" | "medium" | "high" {
  if (n >= 6) return "high";
  if (n >= 3) return "medium";
  return "low";
}
