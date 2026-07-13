/**
 * Collect due rhythm/reminder deliverables for the companion fire loop.
 */

import { getTimeBlocks } from "@/lib/companionStore";
import { afterReminderFired } from "@/lib/reminderAlerts";
import { remindersReadyToFire } from "@/lib/reminderIntelligence";
import { getActiveReminders } from "@/lib/reminderStore";
import {
  markRhythmPrompted,
} from "./actions";
import {
  filterDeliverables,
  recordDelivery,
  type Deliverable,
} from "./loadManager";
import { getRhythmPrefs } from "./prefs";
import { resolveNextDueAt, windowEndForRhythm } from "./scheduling";
import {
  listActiveRhythms,
  updateMemberRhythm,
} from "./store";

/**
 * Unified due collection: rhythms + legacy-ready reminders, through the
 * Notification Load Manager (caps, quiet hours, linked dedupe).
 */
export function collectDueDeliverables(now = Date.now()): Deliverable[] {
  const at = new Date(now);
  const rhythms = listActiveRhythms().map((r) => {
    if (!r.nextDueAt) {
      const nextDueAt = resolveNextDueAt(r, at);
      if (nextDueAt) updateMemberRhythm(r.id, { nextDueAt });
      return { ...r, nextDueAt: nextDueAt ?? r.nextDueAt };
    }
    // Past flexible window without delivery — roll forward quietly.
    if (r.nextDueAt && new Date(r.nextDueAt).getTime() <= now) {
      const end = windowEndForRhythm(r, new Date(r.nextDueAt));
      if (end && now > end.getTime()) {
        const nextDueAt = resolveNextDueAt(
          { ...r, lastPromptedAt: at.toISOString() },
          at,
        );
        if (nextDueAt) updateMemberRhythm(r.id, { nextDueAt });
        return { ...r, nextDueAt };
      }
    }
    return r;
  });

  // Preserve reminder recurrence / event-offset readiness from P0.24.
  const dueReminders = remindersReadyToFire(
    getActiveReminders(),
    getTimeBlocks(),
    now,
  );

  return filterDeliverables(rhythms, dueReminders, at);
}

export function afterDeliverableFired(d: Deliverable, now = Date.now()): void {
  recordDelivery(d);
  if (d.kind === "rhythm" && d.rhythmId) {
    markRhythmPrompted(d.rhythmId);
    const rhythm = listActiveRhythms().find((r) => r.id === d.rhythmId);
    if (rhythm) {
      const nextDueAt = resolveNextDueAt(
        { ...rhythm, lastPromptedAt: new Date(now).toISOString() },
        new Date(now + 60_000),
      );
      updateMemberRhythm(d.rhythmId, {
        lastPromptedAt: new Date(now).toISOString(),
        nextDueAt,
      });
    }
  }
  if (d.kind === "reminder" && d.reminderId) {
    const reminder = getActiveReminders().find((r) => r.id === d.reminderId);
    if (reminder) afterReminderFired(reminder, now);
  }
}

export function shouldDeliverBrowserNotification(): boolean {
  const prefs = getRhythmPrefs();
  return prefs.deliveryBrowser;
}

export function shouldDeliverInApp(): boolean {
  return getRhythmPrefs().deliveryInApp;
}
