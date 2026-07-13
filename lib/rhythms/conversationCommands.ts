/**
 * Deterministic conversation commands for rhythms + reminders (Phase 2).
 * Never routes to AI — local reply only.
 */

import {
  completeReminder,
  getActiveReminders,
  snoozeReminder,
  updateReminder,
  type Reminder,
} from "@/lib/reminderStore";
import {
  completeRhythmOccurrence,
  pauseRhythm,
  resumeRhythm,
  skipRhythmOccurrence,
  snoozeRhythm,
} from "./actions";
import { updateMemberRhythm, listActiveRhythms, listMemberRhythms } from "./store";
import type { MemberRhythm, RhythmTimeWindow } from "./types";

export type ConversationCommandResult = {
  handled: true;
  reply: string;
};

function matchByTitle<T extends { title: string }>(
  items: T[],
  needle: string,
): T | null {
  const n = needle.toLowerCase().trim();
  if (!n) return items[0] ?? null;
  const exact = items.find((i) => i.title.toLowerCase() === n);
  if (exact) return exact;
  const partial = items.find((i) => i.title.toLowerCase().includes(n));
  return partial ?? null;
}

function extractTarget(text: string, verb: string): string {
  const re = new RegExp(
    `${verb}\\s+(?:my\\s+|the\\s+)?(?:rhythm|reminder)?\\s*(?:for\\s+|about\\s+|called\\s+)?["']?(.+?)["']?$`,
    "i",
  );
  const m = text.trim().match(re);
  return (m?.[1] ?? "").replace(/\s+(rhythm|reminder)s?\s*$/i, "").trim();
}

function listRhythmsReply(): string {
  const active = listActiveRhythms();
  const paused = listMemberRhythms().filter((r) => r.status === "paused");
  if (active.length === 0 && paused.length === 0) {
    return "You don't have any rhythms yet. You can say something like “Every Friday remind me to review finances.”";
  }
  const lines: string[] = [];
  if (active.length) {
    lines.push(
      `Active rhythms:\n${active.map((r) => `• ${r.title} (${r.cadence})`).join("\n")}`,
    );
  }
  if (paused.length) {
    lines.push(
      `Paused:\n${paused.map((r) => `• ${r.title}`).join("\n")}`,
    );
  }
  return lines.join("\n\n");
}

function listRemindersReply(): string {
  const items = getActiveReminders();
  if (items.length === 0) {
    return "You don't have any active reminders right now.";
  }
  return `Active reminders:\n${items
    .slice(0, 12)
    .map((r) => {
      const when = r.scheduledAt
        ? new Date(r.scheduledAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })
        : "unscheduled";
      return `• ${r.title} — ${when}`;
    })
    .join("\n")}`;
}

function parseSnoozeMinutes(text: string): number {
  const m = text.match(/\b(\d+)\s*(minutes?|mins?|hours?|hrs?)\b/i);
  if (!m) return 30;
  const n = Number(m[1]);
  if (/hour/i.test(m[2]!)) return n * 60;
  return n;
}

function parseWindow(text: string): RhythmTimeWindow | null {
  if (/\bmorning\b/i.test(text)) return "morning";
  if (/\bafternoon\b/i.test(text)) return "afternoon";
  if (/\bevening\b/i.test(text)) return "evening";
  return null;
}

/**
 * Try to handle pause / resume / skip / snooze / stop / reschedule / list.
 * Returns null when the message is not a management command.
 */
export function tryResolveRememberManagementCommand(
  userText: string,
): ConversationCommandResult | null {
  const text = userText.trim();
  if (!text) return null;

  if (
    /\b(list|show|what are)\s+(my\s+)?rhythms\b/i.test(text) ||
    /\bmy rhythms\b/i.test(text)
  ) {
    return { handled: true, reply: listRhythmsReply() };
  }

  if (
    /\b(list|show|what are)\s+(my\s+)?reminders\b/i.test(text) ||
    /\bmy reminders\b/i.test(text)
  ) {
    return { handled: true, reply: listRemindersReply() };
  }

  const isRhythmCmd = /\brhythm\b/i.test(text);
  const isReminderCmd = /\breminder\b/i.test(text);

  if (/\bpause\b/i.test(text)) {
    if (isReminderCmd && !isRhythmCmd) {
      const target = extractTarget(text, "pause");
      const rem = matchByTitle(getActiveReminders(), target);
      if (!rem) {
        return {
          handled: true,
          reply: target
            ? `I couldn't find an active reminder matching “${target}.”`
            : "Which reminder should I pause? You can say “pause reminder about invoices.”",
        };
      }
      updateReminder(rem.id, { status: "cancelled" });
      return {
        handled: true,
        reply: `Okay — I stopped the reminder “${rem.title}.”`,
      };
    }
    const target = extractTarget(text, "pause");
    const rhythm =
      matchByTitle(listActiveRhythms(), target) ??
      matchByTitle(
        listMemberRhythms().filter((r) => r.status === "active"),
        target,
      );
    if (!rhythm) {
      return {
        handled: true,
        reply: target
          ? `I couldn't find an active rhythm matching “${target}.”`
          : "Which rhythm should I pause?",
      };
    }
    pauseRhythm(rhythm.id);
    return {
      handled: true,
      reply: `Paused “${rhythm.title}.” You can resume it anytime.`,
    };
  }

  if (/\bresume\b/i.test(text)) {
    const target = extractTarget(text, "resume");
    const paused = listMemberRhythms().filter((r) => r.status === "paused");
    const rhythm = matchByTitle(paused, target);
    if (!rhythm) {
      return {
        handled: true,
        reply: target
          ? `I couldn't find a paused rhythm matching “${target}.”`
          : "Which rhythm should I resume?",
      };
    }
    resumeRhythm(rhythm.id);
    return {
      handled: true,
      reply: `Resumed “${rhythm.title}.”`,
    };
  }

  if (/\bskip\b/i.test(text)) {
    const target = extractTarget(text, "skip");
    const rhythm = matchByTitle(listActiveRhythms(), target);
    if (!rhythm) {
      return {
        handled: true,
        reply: target
          ? `I couldn't find a rhythm matching “${target}” to skip.`
          : "Which rhythm should I skip this time?",
      };
    }
    skipRhythmOccurrence(rhythm.id);
    return {
      handled: true,
      reply: `Skipped this occurrence of “${rhythm.title}.” The rhythm continues next time — no guilt.`,
    };
  }

  if (/\bsnooze\b/i.test(text)) {
    const minutes = parseSnoozeMinutes(text);
    const target = extractTarget(text, "snooze").replace(
      /\s+for\s+\d+\s*(minutes?|mins?|hours?|hrs?)\s*$/i,
      "",
    );
    if (isReminderCmd && !isRhythmCmd) {
      const rem = matchByTitle(getActiveReminders(), target);
      if (!rem) {
        return {
          handled: true,
          reply: "Which reminder should I snooze?",
        };
      }
      const until = new Date(Date.now() + minutes * 60_000).toISOString();
      snoozeReminder(rem.id, until);
      return {
        handled: true,
        reply: `Snoozed “${rem.title}” for ${minutes} minutes.`,
      };
    }
    const rhythm = matchByTitle(listActiveRhythms(), target);
    if (!rhythm) {
      return {
        handled: true,
        reply: "Which rhythm should I snooze?",
      };
    }
    snoozeRhythm(rhythm.id, minutes);
    return {
      handled: true,
      reply: `Snoozed “${rhythm.title}” for ${minutes} minutes.`,
    };
  }

  if (/\b(stop|cancel|archive|delete)\b/i.test(text) && (isRhythmCmd || isReminderCmd)) {
    const target = text
      .replace(/^(?:please\s+)?(?:stop|cancel|archive|delete)\s+/i, "")
      .replace(/^(?:my\s+|the\s+)?(?:rhythm|reminder)\s*(?:for\s+|about\s+|called\s+)?/i, "")
      .replace(/\s+(rhythm|reminder)s?\s*$/i, "")
      .trim();
    if (isReminderCmd && !isRhythmCmd) {
      const rem = matchByTitle(getActiveReminders(), target);
      if (!rem) {
        return { handled: true, reply: "Which reminder should I stop?" };
      }
      completeReminder(rem.id);
      return {
        handled: true,
        reply: `Stopped the reminder “${rem.title}.”`,
      };
    }
    const rhythm =
      matchByTitle(listActiveRhythms(), target) ??
      matchByTitle(listMemberRhythms(), target);
    if (!rhythm) {
      return { handled: true, reply: "Which rhythm should I stop?" };
    }
    updateMemberRhythm(rhythm.id, { status: "archived", nextDueAt: undefined });
    return {
      handled: true,
      reply: `Stopped “${rhythm.title}.” It's archived — say the word if you want it back later.`,
    };
  }

  if (/\breschedule\b/i.test(text) && isRhythmCmd) {
    const window = parseWindow(text);
    const target = extractTarget(text, "reschedule").replace(
      /\s+to\s+(morning|afternoon|evening)\s*$/i,
      "",
    );
    const rhythm = matchByTitle(listActiveRhythms(), target);
    if (!rhythm) {
      return { handled: true, reply: "Which rhythm should I reschedule?" };
    }
    if (!window) {
      return {
        handled: true,
        reply: `When should “${rhythm.title}” land — morning, afternoon, or evening?`,
      };
    }
    updateMemberRhythm(rhythm.id, { window });
    return {
      handled: true,
      reply: `Rescheduled “${rhythm.title}” to the ${window}.`,
    };
  }

  return null;
}

/** Exported for tests — title matching helper. */
export function __testMatchByTitle<T extends { title: string }>(
  items: T[],
  needle: string,
): T | null {
  return matchByTitle(items, needle);
}

export type { MemberRhythm, Reminder };
