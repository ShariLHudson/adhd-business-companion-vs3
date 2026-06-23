// Open standalone tools (Breathe, Focus Audio, etc.) from chat — don't rely on the model alone.

import {
  detectAudioRequest,
  focusAudioOpenAck,
} from "./audioSuggestions";
import type { SidebarToolId } from "./companionUi";
import { shouldBlockStressAutoToolRouting } from "./stressRouting";
import { isExplicitBreatheRequest } from "./explicitBreatheRouting";

export type StandaloneToolLaunch = {
  tool: SidebarToolId;
  focusAudioCategory?: string;
};

const OPEN_VERB_RE =
  /\b(?:open|start|launch|show|play|try|let me try|want to try|need|want|can you open|will you open|go ahead)\b/i;

export function detectStandaloneToolRequest(
  text: string,
): StandaloneToolLaunch | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;

  if (isExplicitBreatheRequest(text)) {
    return { tool: "breathe" };
  }

  const audio = detectAudioRequest(text);
  if (audio.isAudio && !shouldBlockStressAutoToolRouting(text)) {
    return { tool: "focus-audio", focusAudioCategory: audio.categoryId };
  }

  if (
    (OPEN_VERB_RE.test(t) || /\b(?:let me try|i'll try)\b/i.test(t)) &&
    /\b(?:breathe(?:\s+and\s+reset)?|breathing|breath)\b/i.test(t)
  ) {
    if (shouldBlockStressAutoToolRouting(text)) return null;
    return { tool: "breathe" };
  }

  if (OPEN_VERB_RE.test(t) && /\b(?:focus timer|focus session)\b/i.test(t)) {
    if (shouldBlockStressAutoToolRouting(text)) return null;
    return { tool: "focus-timer" };
  }

  return null;
}

/** Assistant claimed it is opening a tool — client must actually launch it. */
export function detectAssistantToolLaunch(text: string): StandaloneToolLaunch | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  if (!/\bopening\b/i.test(t)) return null;

  if (/\b(?:breathe(?:\s+and\s+reset)?|breathing|breath)\b/i.test(t)) {
    return { tool: "breathe" };
  }
  if (/\b(?:focus audio|calm(?:ing)?|motivation|relaxing|background (?:music|sounds?))\b/i.test(t)) {
    const audio = detectAudioRequest(text);
    return {
      tool: "focus-audio",
      focusAudioCategory: audio.categoryId,
    };
  }
  if (/\bfocus (?:session|timer)\b/i.test(t)) {
    return { tool: "focus-timer" };
  }
  return null;
}

export function standaloneToolAck(
  tool: SidebarToolId,
  focusAudioCategory?: string,
): string {
  switch (tool) {
    case "breathe":
      return "Opening **Breathe & Reset** — follow along on screen. Chat will be right here when you're done.";
    case "focus-audio":
      return focusAudioCategory
        ? focusAudioOpenAck(focusAudioCategory)
        : "Opening **Focus Audio** — pick a sound or add your own link.";
    case "focus-timer":
      return "Starting a **Focus Session** for you.";
    default:
      return "Opening it now.";
  }
}
