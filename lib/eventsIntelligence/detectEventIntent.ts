import {
  classifyPlatformIntent,
  looksLikeKnowledgeQuestion,
} from "@/lib/platformIntent/classifyPlatformIntent";
import type { EventFormat, EventTypeId } from "./types";

export type DetectedEventIntent = {
  isClearEventGoal: boolean;
  eventType: EventTypeId;
  eventTypeLabel: string;
  format: EventFormat;
  titleHint: string;
  /** Scale / duration cues from the request */
  multiDay: boolean;
  rawText: string;
};

const EVENT_GOAL_RE =
  /\b(?:help(?:\s+me)?|need\s+help|want\s+(?:to|help)|looking\s+to|trying\s+to|can\s+you\s+help|please\s+help|i(?:'d|\s+would)\s+like|create|plan|build|organize|host|run|design)\b[\s\S]{0,80}\b(?:retreat|workshop|webinar|conference|summit|panel|launch(?:\s+event)?|networking(?:\s+event)?|meetup|gathering|event|masterclass|church\s+event|community\s+event)\b|\b(?:retreat|workshop|webinar|conference|summit|panel)\b[\s\S]{0,40}\b(?:weekend|event|day|series)\b/i;

const REFLECTIVE_TRAP_RE =
  /\b(?:what(?:'s| is) (?:unclear|unfinished)|trying to get clear|quieter question|feel unfinished|explore what(?:'s| is) underneath)\b/i;

export function isEventsReflectiveTrap(text: string): boolean {
  return REFLECTIVE_TRAP_RE.test(text);
}

export function detectEventType(text: string): {
  eventType: EventTypeId;
  eventTypeLabel: string;
} {
  const t = text.toLowerCase();
  if (/\bretreat\b/.test(t)) return { eventType: "retreat", eventTypeLabel: "Retreat" };
  if (/\bwebinar\b/.test(t)) return { eventType: "webinar", eventTypeLabel: "Webinar" };
  if (/\bworkshop\b|masterclass\b/.test(t))
    return { eventType: "workshop", eventTypeLabel: "Workshop" };
  if (/\bconference\b|summit\b/.test(t))
    return { eventType: "conference", eventTypeLabel: "Conference" };
  if (/\bpanel\b/.test(t)) return { eventType: "panel", eventTypeLabel: "Panel" };
  if (/\blaunch\b/.test(t)) return { eventType: "launch", eventTypeLabel: "Launch event" };
  if (/\bnetwork(?:ing)?\b|meetup\b/.test(t))
    return { eventType: "networking", eventTypeLabel: "Networking event" };
  if (/\bchurch\b|community\s+event\b/.test(t))
    return { eventType: "church_community", eventTypeLabel: "Church / community event" };
  if (/\bmulti-?day\b|weekend\b/.test(t))
    return { eventType: "multi_day", eventTypeLabel: "Multi-day event" };
  if (/\bevent\b|gathering\b/.test(t))
    return { eventType: "custom", eventTypeLabel: "Event" };
  return { eventType: "custom", eventTypeLabel: "Event" };
}

export function detectEventFormat(text: string): EventFormat {
  const t = text.toLowerCase();
  if (/\bhybrid\b/.test(t)) return "hybrid";
  if (/\bvirtual\b|online\b|zoom\b|webinar\b/.test(t)) return "virtual";
  if (/\bin[- ]person\b|on[- ]site\b|retreat\b/.test(t)) return "in_person";
  return "unspecified";
}

/**
 * Clear event goal — acknowledge and begin guiding immediately.
 * Not a vague vibe check; not Talk It Out.
 */
export function detectEventIntent(userText: string): DetectedEventIntent {
  const rawText = userText.trim();
  const type = detectEventType(rawText);
  const format = detectEventFormat(rawText);
  const multiDay = /\b(?:weekend|multi-?day|two[- ]day|three[- ]day|several days)\b/i.test(
    rawText,
  );
  const isClearEventGoal =
    Boolean(rawText) &&
    (EVENT_GOAL_RE.test(rawText) ||
      (/\b(?:retreat|workshop|webinar|conference)\b/i.test(rawText) &&
        /\b(?:help|plan|create|build|organize|need)\b/i.test(rawText)));

  let titleHint = type.eventTypeLabel;
  if (type.eventType === "retreat" && multiDay) titleHint = "Retreat weekend";
  else if (multiDay && type.eventType === "custom") titleHint = "Multi-day event";

  return {
    isClearEventGoal,
    eventType: type.eventType,
    eventTypeLabel: type.eventTypeLabel,
    format,
    titleHint,
    multiDay,
    rawText,
  };
}

/** True when Events Intelligence should own the turn (not generic chat). */
export function shouldRouteToEventsIntelligence(input: {
  userText: string;
  activeChamberMemberId?: string | null;
  hasActiveEventRecord?: boolean;
}): boolean {
  const platform = classifyPlatformIntent(input.userText);

  // 045 KNOW / DECIDE — answer in conversation; never launch Create/runtime start
  if (platform.intent === "know" || platform.intent === "decide") {
    return false;
  }

  if (
    /\b(?:never ?mind|stop|different topic|talk about something else)\b/i.test(
      input.userText,
    )
  ) {
    return false;
  }

  // Mid-session foundation answers (not knowledge questions)
  if (
    input.hasActiveEventRecord &&
    !looksLikeKnowledgeQuestion(input.userText)
  ) {
    return true;
  }

  if (platform.intent === "create" || platform.intent === "improve") {
    const bp = platform.blueprint;
    if (bp?.specialtyRuntime === "events") return true;
    if (detectEventIntent(input.userText).isClearEventGoal) return true;
  }

  if (input.activeChamberMemberId === "events") {
    // Events doorway: only runtime-handle CREATE/CONTINUE, not KNOW
    return (
      platform.intent === "create" ||
      platform.intent === "continue" ||
      platform.intent === "improve" ||
      Boolean(input.hasActiveEventRecord)
    );
  }

  return false;
}
