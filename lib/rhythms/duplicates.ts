/**
 * Duplicate detection before creating similar active reminders/rhythms (Phase 2).
 */

import { getActiveReminders, type Reminder } from "@/lib/reminderStore";
import { listActiveRhythms, type MemberRhythm } from "./store";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titlesSimilar(a: string, b: string): boolean {
  const na = normalizeTitle(a);
  const nb = normalizeTitle(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  if (na.length >= 8 && (nb.includes(na) || na.includes(nb))) return true;
  return false;
}

export function findSimilarActiveRhythm(
  title: string,
  rhythms: MemberRhythm[] = listActiveRhythms(),
): MemberRhythm | null {
  return rhythms.find((r) => titlesSimilar(r.title, title)) ?? null;
}

export function findSimilarActiveReminder(
  title: string,
  reminders: Reminder[] = getActiveReminders(),
): Reminder | null {
  return reminders.find((r) => titlesSimilar(r.title, title)) ?? null;
}
