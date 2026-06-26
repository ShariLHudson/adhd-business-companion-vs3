import { getDayState } from "@/lib/companionStore";
import { resolveGuestArrivalMode } from "@/lib/honorTheirIntent";
import { CARRY_FORWARD_CATALOG, listCarryForwardForTone } from "./catalog";
import {
  alreadyCarriedForwardToday,
  getCarryForwardGreetingForDay,
  isFirstVisitOfDay,
  isGreetingOnCooldown,
  recordCarryForwardShown,
} from "./dayVisit";
import { inferYesterdayCloseTone } from "./inferYesterdayTone";
import { isValidCarryForwardLine } from "./rules";
import type { CarryForwardInput, CarryForwardVerdict } from "./types";
import { CARRY_FORWARD_PRINCIPLE } from "./types";

const SIMPLE_GREETING_RE =
  /^(?:good\s+(?:morning|afternoon|evening)|hello|hi|hey)(?:\s+there)?[!.]?\s*$/i;

function stableHash(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function suppressed(reason: string, tone: CarryForwardVerdict["yesterdayTone"]): CarryForwardVerdict {
  return {
    active: false,
    greeting: null,
    followUp: null,
    yesterdayTone: tone,
    entryId: null,
    suppressedReason: reason,
    constitutionalPrinciple: CARRY_FORWARD_PRINCIPLE,
  };
}

/**
 * Carry Forward™ — decide what is emotionally healthy to bring into today.
 */
export function evaluateCarryForward(input: CarryForwardInput = {}): CarryForwardVerdict {
  const now = input.now ?? new Date();
  const yesterdayTone =
    input.yesterdayTone ??
    inferYesterdayCloseTone({
      now,
      dayState: getDayState(),
      projectRecentlyCompleted: input.projectRecentlyCompleted,
      recoveryGentle: input.recoveryGentle,
      lowEnergy: input.lowEnergy,
    });

  if (input.isFirstMeeting) return suppressed("first-meeting", yesterdayTone);
  if (input.birthdayToday) return suppressed("birthday", yesterdayTone);
  if (input.celebrationActive) return suppressed("celebration", yesterdayTone);

  if (input.userText?.trim()) {
    const text = input.userText.trim();
    if (SIMPLE_GREETING_RE.test(text)) {
      return suppressed("simple-greeting", yesterdayTone);
    }
    const intent = resolveGuestArrivalMode({ userText: text });
    if (intent === "come_to_work") {
      return suppressed("honor-their-intent-work", yesterdayTone);
    }
  }

  const firstOfDay = input.isFirstVisitOfDay ?? isFirstVisitOfDay(now);
  if (!firstOfDay) return suppressed("not-first-visit-of-day", yesterdayTone);

  if (alreadyCarriedForwardToday(now)) {
    const replay = getCarryForwardGreetingForDay(now);
    if (replay) {
      return {
        active: true,
        greeting: replay.greeting,
        followUp: replay.followUp,
        yesterdayTone,
        entryId: replay.entryId,
        suppressedReason: null,
        constitutionalPrinciple: CARRY_FORWARD_PRINCIPLE,
      };
    }
  }

  const candidates = listCarryForwardForTone(yesterdayTone).filter(
    (entry) =>
      isValidCarryForwardLine(entry.line) &&
      (!entry.followUp || isValidCarryForwardLine(entry.followUp)) &&
      !isGreetingOnCooldown(entry.id, entry.cooldownDays, now),
  );

  if (!candidates.length) {
    const fallback = CARRY_FORWARD_CATALOG.find(
      (e) => e.tone === "morning_universal" && isValidCarryForwardLine(e.line),
    );
    if (!fallback) return suppressed("no-eligible-greeting", yesterdayTone);
    recordCarryForwardShown(fallback.id, now, {
      line: fallback.line,
      followUp: fallback.followUp,
    });
    return {
      active: true,
      greeting: fallback.line,
      followUp: fallback.followUp ?? null,
      yesterdayTone,
      entryId: fallback.id,
      suppressedReason: null,
      constitutionalPrinciple: CARRY_FORWARD_PRINCIPLE,
    };
  }

  const dayKey = now.toISOString().slice(0, 10);
  const seed = `${dayKey}:${input.sessionVisitIndex ?? 0}:carry-forward`;
  const pick = candidates[stableHash(seed) % candidates.length]!;

  recordCarryForwardShown(pick.id, now, { line: pick.line, followUp: pick.followUp });

  return {
    active: true,
    greeting: pick.line,
    followUp: pick.followUp ?? null,
    yesterdayTone,
    entryId: pick.id,
    suppressedReason: null,
    constitutionalPrinciple: CARRY_FORWARD_PRINCIPLE,
  };
}

export function formatCarryForwardGreeting(verdict: CarryForwardVerdict): string | null {
  if (!verdict.active || !verdict.greeting) return null;
  if (verdict.followUp) {
    return `${verdict.greeting} ${verdict.followUp}`;
  }
  return verdict.greeting;
}

export function carryForwardHintForChat(verdict: CarryForwardVerdict): string | null {
  if (!verdict.active) return null;
  return [
    "CARRY FORWARD™ (first visit of the day — encouragement only):",
    verdict.constitutionalPrinciple,
    `Yesterday tone (internal): ${verdict.yesterdayTone}.`,
    "Never reference missed tasks, streaks, scores, or productivity statistics.",
    "Once the guest speaks with clear work intent, Honor Their Intent™ takes over.",
  ].join("\n");
}
