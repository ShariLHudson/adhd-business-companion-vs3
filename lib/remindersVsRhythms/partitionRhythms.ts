/**
 * Clear list states for Rhythms: Today / Active / Paused.
 */

import type { MemberRhythm } from "@/lib/rhythms/types";

function isSameLocalDay(iso: string | undefined, now = new Date()): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function partitionRhythmsForLists(rhythms: MemberRhythm[]): {
  today: MemberRhythm[];
  active: MemberRhythm[];
  paused: MemberRhythm[];
} {
  const nonArchived = rhythms.filter((r) => r.status !== "archived");
  const paused = nonArchived.filter((r) => r.status === "paused");
  const live = nonArchived.filter((r) => r.status === "active");
  const today = live.filter(
    (r) => isSameLocalDay(r.nextDueAt) || isSameLocalDay(r.lastPromptedAt),
  );
  const todayIds = new Set(today.map((r) => r.id));
  const active = live.filter((r) => !todayIds.has(r.id));
  return { today, active, paused };
}
