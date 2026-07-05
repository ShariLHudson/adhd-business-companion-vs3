/**
 * Explicit member requests — open the tool immediately; no triage questions.
 */

import { isDirectEstateRoomRequest } from "@/lib/estateIntelligence/estateCommandRouter";
import {
  isEmotionalSupportMenuOffer,
  resolveEmotionalSupportMenuChoice,
} from "@/lib/conversation/emotionalDistressRouting";
import {
  clampFocusMinutes,
  parseFocusMinutesFromText,
} from "@/lib/focusDuration";

export type ExplicitCompanionAction =
  | { kind: "open-breathe"; message: string }
  | { kind: "open-focus-audio"; message: string; categoryId?: string }
  | { kind: "open-spin-wheel"; message: string }
  | { kind: "start-timer"; minutes: number; message: string };

const BREATHE_EXPLICIT_RE =
  /\b(?:breath(?:ing)?\s+exercises?|breathing exercises|do (?:some )?breathing|(?:need|want) to breathe|breathe (?:with me|together|now)|breathing reset|breathe and reset)\b/i;

const STRESSED_BREATHE_RE =
  /\b(?:stressed|overwhelm(?:ed)?|anxious|panic(?:king)?).{0,48}\b(?:breath|breathe)/i;

const SPIN_WHEEL_RE =
  /\b(?:spin(?:ning)?\s+(?:the\s+)?wheel|wheel of (?:focus|momentum)|spin for me)\b/i;

const TIMER_VERB_RE =
  /\b(?:set|start|run|open|need|want|give me)\s+(?:me\s+)?(?:a\s+)?(?:(\d{1,3})\s*[-–]?\s*)?min(?:ute)?s?(?:\s+(?:focus\s+)?(?:timer|pomodoro|session))?|\b(\d{1,3})\s*min(?:ute)?s?\s+timer\b/i;

const AFFIRMATIVE_START_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|start(?:\s+(?:now|that))?|let'?s (?:go|start|do it)|go ahead|please do|do it|sounds good)\.?$/i;

function inferMinutesFromText(text: string): number | null {
  const parsed = parseFocusMinutesFromText(text);
  if (parsed != null) return parsed;

  const m =
    text.match(/\b(\d{1,3})\s*min(?:ute)?s?\b/i) ??
    text.match(/\b(\d{1,3})\s*[-–]\s*minute\b/i);
  if (m?.[1]) return clampFocusMinutes(parseInt(m[1], 10));
  return null;
}

function resolveAffirmativeFollowUp(
  userText: string,
  lastAssistantText: string,
): ExplicitCompanionAction | null {
  if (!AFFIRMATIVE_START_RE.test(userText.trim())) return null;
  const assistant = lastAssistantText.trim();
  if (!assistant) return null;

  if (/\b(?:breath|breathe|breathing)\b/i.test(assistant)) {
    return {
      kind: "open-breathe",
      message: "Let's breathe together — follow along on screen.",
    };
  }

  if (/\b(?:timer|minute|min|pomodoro|focus session)\b/i.test(assistant)) {
    const minutes = inferMinutesFromText(assistant) ?? 25;
    return {
      kind: "start-timer",
      minutes,
      message: `Starting your ${minutes}-minute timer now.`,
    };
  }

  return null;
}

/** Explicit activity request — open the tool; do not triage or ask again. */
export function resolveExplicitCompanionAction(
  userText: string,
  lastAssistantText?: string,
): ExplicitCompanionAction | null {
  const text = userText.trim();
  if (!text) return null;
  if (isDirectEstateRoomRequest(userText)) return null;

  if (lastAssistantText && isEmotionalSupportMenuOffer(lastAssistantText)) {
    const choice = resolveEmotionalSupportMenuChoice(userText, lastAssistantText);
    if (choice === "breathe") {
      return {
        kind: "open-breathe",
        message:
          "Let's slow down together. I'll stay with you while we breathe.",
      };
    }
    if (choice === "focus-audio") {
      return {
        kind: "open-focus-audio",
        message: "I'll open something calming. Take what you need from it.",
        categoryId: "calm-brain",
      };
    }
  }

  if (BREATHE_EXPLICIT_RE.test(text) || STRESSED_BREATHE_RE.test(text)) {
    return {
      kind: "open-breathe",
      message:
        "Let's slow down together. I'll stay with you while we breathe.",
    };
  }

  if (SPIN_WHEEL_RE.test(text)) {
    return {
      kind: "open-spin-wheel",
      message: "Let's give it a spin.",
    };
  }

  if (TIMER_VERB_RE.test(text)) {
    const minutes = inferMinutesFromText(text) ?? 25;
    return {
      kind: "start-timer",
      minutes,
      message: `Starting your ${minutes}-minute timer now.`,
    };
  }

  if (lastAssistantText) {
    return resolveAffirmativeFollowUp(text, lastAssistantText);
  }

  return null;
}

/** @deprecated Use resolveExplicitCompanionAction */
export function resolveExplicitEstateActivity(
  userText: string,
): Pick<ExplicitCompanionAction, "kind" | "message"> | null {
  const action = resolveExplicitCompanionAction(userText);
  if (!action) return null;
  if (action.kind === "start-timer" || action.kind === "open-spin-wheel") {
    return null;
  }
  return { kind: action.kind, message: action.message };
}
