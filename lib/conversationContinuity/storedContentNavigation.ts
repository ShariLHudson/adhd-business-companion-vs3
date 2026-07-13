/**
 * Stored-content and explicit destination intents when no stronger owner applies.
 */

import type { MyDayAndWorkOpener } from "@/lib/estate/myDayAndWorkNavigation";
import { resolveMyDayAndWorkOpenerFromText } from "@/lib/estate/myDayAndWorkNavigation";
import type { BoardroomEntryIntent } from "@/lib/boardroom/boardroomEntry";

export type StoredContentDestination =
  | {
      kind: "my_day";
      opener: MyDayAndWorkOpener;
      reason: string;
    }
  | {
      kind: "estate";
      destination:
        | "evidence-vault"
        | "my-business-estate"
        | "boardroom";
      boardroomIntent?: BoardroomEntryIntent;
      reason: string;
    };

/**
 * Prefer stronger continuity owners first (caller responsibility).
 * This only classifies destination intents.
 */
export function detectStoredContentOrNavigationDestination(
  userText: string,
): StoredContentDestination | null {
  const t = userText.trim();
  if (!t) return null;

  // Broader than My Day aliases — ownership gate must not miss these.
  if (
    /\b(?:i need to see|show(?:\s+me)?|see|view|open)\b[\s\S]{0,40}\b(?:all\s+)?(?:my\s+)?(?:current\s+)?projects?\b/i.test(
      t,
    )
  ) {
    return {
      kind: "my_day",
      opener: "project-homes",
      reason: "stored_content_projects",
    };
  }
  if (
    /\b(?:show(?:\s+me)?|open|see|view)\b[\s\S]{0,24}\b(?:my\s+)?reminders?\b/i.test(
      t,
    )
  ) {
    return {
      kind: "my_day",
      opener: "reminders",
      reason: "stored_content_reminders",
    };
  }
  if (/\b(?:open|show(?:\s+me)?|take me to)\b[\s\S]{0,16}\brhythms?\b/i.test(t)) {
    return {
      kind: "my_day",
      opener: "rhythms",
      reason: "stored_content_rhythms",
    };
  }

  if (
    /\b(?:show(?:\s+me)?|open|see|view|browse)\b[\s\S]{0,40}\b(?:my\s+)?evidence(?:\s+vault)?\b/i.test(
      t,
    ) ||
    /\bevidence\s+vault\b/i.test(t)
  ) {
    return {
      kind: "estate",
      destination: "evidence-vault",
      reason: "stored_content_evidence",
    };
  }

  if (
    /\b(?:open|show(?:\s+me)?|take me to)\b[\s\S]{0,40}\bmy\s+business\s+estate\b/i.test(
      t,
    ) ||
    /\bmy\s+business\s+estate\b/i.test(t)
  ) {
    return {
      kind: "estate",
      destination: "my-business-estate",
      reason: "stored_content_business_estate",
    };
  }

  if (
    /\breview\s+(?:my\s+)?past\s+board\b/i.test(t) ||
    /\bpast\s+board\s+discussions?\b/i.test(t) ||
    /\bboard\s+(?:discussion\s+)?history\b/i.test(t) ||
    /\bprevious\s+board\s+discussions?\b/i.test(t) ||
    /\bshow(?:\s+me)?\s+(?:my\s+)?past\s+board\b/i.test(t)
  ) {
    return {
      kind: "estate",
      destination: "boardroom",
      boardroomIntent: "past",
      reason: "stored_content_board_history",
    };
  }

  const opener = resolveMyDayAndWorkOpenerFromText(t);
  if (opener) {
    return {
      kind: "my_day",
      opener,
      reason: "explicit_my_day_destination",
    };
  }

  return null;
}
