/**
 * Auto-launch when the user already agreed — one decision, one action.
 */

import { isActionAcceptance } from "./assistedActionBridge";
import { detectAudioRequest } from "./audioSuggestions";
import { extractExplicitFocusMinutes } from "./doItNowActions";
import { parseFocusMinutesFromText } from "./focusDuration";
import type { PendingAction } from "./pendingAction";
import { matchesPendingAcceptance } from "./pendingAction";
import type { WorkspaceOffer } from "./workspaceMode";

const DURATION_ONLY_RE = /^(\d{1,3})\s*(?:min(?:ute)?s?)?\.?$/i;

const AFFIRMATION_RE =
  /^(?:yes|yep|yeah|yup|sure|ok(?:ay)?|please|let'?s(?: go| do it)?|sounds good|do it|go ahead|that works|perfect|great)\b/i;

const ASSISTANT_FOCUS_RE =
  /\b(?:focus session|focus timer|focus block|pomodoro|timed focus|\d+\s*[-–]?\s*min(?:ute)?s?)\b/i;

const ASSISTANT_EXPERIENCE_RE =
  /\b(?:focus session|focus timer|clear my mind|brain dump|time block|day designer|breathe|breathing|recovery|lighter day)\b/i;

function isFocusRelatedAction(action: PendingAction): boolean {
  switch (action.kind) {
    case "do-it-now":
      return action.offer.kind === "focus";
    case "tool":
      return action.suggestion.action.type === "tool"
        ? action.suggestion.action.tool === "focus-timer"
        : false;
    case "action-bridge":
      return action.bridge.tool === "focus-timer";
    default:
      return false;
  }
}

/** User picked a duration after Shari asked how long (e.g. "10" after "10 or 15 minutes?"). */
export function matchesDurationFollowUp(
  userText: string,
  priorAssistantText: string,
  action: PendingAction,
): boolean {
  const t = userText.trim();
  const m = t.match(DURATION_ONLY_RE);
  if (!m?.[1]) return false;
  if (!/\b(?:\d+\s*(?:or|\/)\s*\d+|\d+\s*(?:or|\/)\s*\d+\s*min|how (?:long|many)|minutes? work|min(?:ute)?s?)\b/i.test(
    priorAssistantText,
  )) {
    return false;
  }
  if (!ASSISTANT_FOCUS_RE.test(priorAssistantText) && !isFocusRelatedAction(action)) {
    return false;
  }
  return isFocusRelatedAction(action);
}

/** User affirmed after Shari offered a specific experience in the prior turn. */
export function matchesExperienceFollowUp(
  userText: string,
  priorAssistantText: string,
  action: PendingAction,
): boolean {
  const t = userText.trim();
  if (!t) return false;
  if (!AFFIRMATION_RE.test(t) && !isActionAcceptance(t)) return false;
  if (!ASSISTANT_EXPERIENCE_RE.test(priorAssistantText)) return false;

  switch (action.kind) {
    case "workspace":
      if (
        action.offer.section === "brain-dump" &&
        /\b(?:clear my mind|brain dump)\b/i.test(priorAssistantText)
      ) {
        return true;
      }
      if (
        action.offer.section === "time-block" &&
        /\b(?:time block|schedule|planning)\b/i.test(priorAssistantText)
      ) {
        return true;
      }
      if (
        action.offer.section === "focus-audio" &&
        (detectAudioRequest(priorAssistantText).isAudio ||
          /\b(?:focus audio|focus music|music|audio)\b/i.test(priorAssistantText))
      ) {
        return true;
      }
      return false;
    case "tool":
      if (action.suggestion.action.type !== "tool") return false;
      if (
        action.suggestion.action.tool === "brain-dump" &&
        /\b(?:clear my mind|brain dump)\b/i.test(priorAssistantText)
      ) {
        return true;
      }
      if (
        action.suggestion.action.tool === "focus-timer" &&
        ASSISTANT_FOCUS_RE.test(priorAssistantText)
      ) {
        return true;
      }
      if (
        action.suggestion.action.tool === "breathe" &&
        /\b(?:breathe|breathing)\b/i.test(priorAssistantText)
      ) {
        return true;
      }
      if (
        action.suggestion.action.tool === "focus-audio" &&
        (detectAudioRequest(priorAssistantText).isAudio ||
          /\b(?:focus audio|focus music|music|audio)\b/i.test(priorAssistantText))
      ) {
        return true;
      }
      return false;
    case "action-bridge":
      return /\b(?:open|start|try|let'?s)\b/i.test(priorAssistantText);
    case "do-it-now":
      return action.offer.kind === "focus" && ASSISTANT_FOCUS_RE.test(priorAssistantText);
    case "assisted":
      return /\b(?:help|draft|create|build)\b/i.test(priorAssistantText);
    default:
      return false;
  }
}

/** Should we auto-launch a pending action from the user's message? */
export function shouldAutoLaunchPendingAction(
  userText: string,
  priorAssistantText: string,
  action: PendingAction,
): boolean {
  if (matchesPendingAcceptance(userText, action)) return true;
  if (extractExplicitFocusMinutes(userText) !== null && isFocusRelatedAction(action)) {
    return true;
  }
  const parsedFocus = parseFocusMinutesFromText(userText);
  if (parsedFocus !== null && isFocusRelatedAction(action)) {
    return true;
  }
  if (matchesDurationFollowUp(userText, priorAssistantText, action)) return true;
  return false;
}

/** Never auto-launch tools because the assistant mentioned them — consent required. */
export function shouldAutoLaunchAfterAssistantOffer(
  _userText: string,
  _priorAssistantText: string,
  _assistantResponse: string,
  _action: PendingAction,
): boolean {
  return false;
}

/** Open workspace immediately when the user clearly asked for it (no second confirm). */
export function shouldAutoOpenWorkspaceFromIntent(
  userText: string,
  offer: WorkspaceOffer,
): boolean {
  const t = userText.trim();
  if (!t) return false;

  switch (offer.section) {
    case "brain-dump":
      return /\b(?:brain dump|clear my mind|empty (?:my |your )?head|get (?:it )?out of my head)\b/i.test(
        t,
      );
    case "time-block":
      return /\b(?:time ?block|schedule (?:my |the )?day|plan (?:my |the )?day|block out time)\b/i.test(
        t,
      );
    case "focus-audio":
      return detectAudioRequest(t).isAudio;
    case "content-generator":
      return /\b(?:open create|start (?:a )?draft|write (?:a |the )?(?:post|email|script|caption))\b/i.test(
        t,
      );
    case "playbook":
      return /\b(?:open (?:my )?strategies|show (?:me )?strategies)\b/i.test(t);
    case "templates-library":
      return /\bopen (?:the )?templates?\b/i.test(t);
    case "projects":
      return /\bopen (?:my )?projects?\b/i.test(t);
    default:
      return false;
  }
}
