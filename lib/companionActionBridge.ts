import type { SidebarToolId } from "./companionUi";
import {
  extractExplicitFocusMinutes,
  isPhysicalWellnessSuggestion,
} from "./doItNowActions";

export type ActionBridge = {
  id: string;
  label: string;
  emoji: string;
  tool: SidebarToolId;
  /** Focus timer — start immediately at this length. */
  minutes?: number;
};

function focusBridge(minutes: number): ActionBridge {
  return {
    id: "focus-session",
    emoji: "🎯",
    label: `Start ${minutes}-Min Focus Session`,
    tool: "focus-timer",
    minutes,
  };
}

/** Map Shari's reply → one-click tool launch when she recommends an action. */
export function detectActionBridge(assistantText: string): ActionBridge | null {
  const t = assistantText.trim();
  if (!t) return null;
  const lower = t.toLowerCase();

  // Physical wellness micro-actions use Do It Now (wait state) — not Focus.
  if (isPhysicalWellnessSuggestion(t)) return null;

  const focusMins = extractExplicitFocusMinutes(t);
  if (focusMins !== null) {
    return focusBridge(focusMins);
  }

  if (
    /\b(spin the wheel|try the wheel|use the wheel|let the wheel pick|wheel to choose|spin wheel)\b/i.test(
      lower,
    ) ||
    /\beverything feels equally important\b/i.test(lower)
  ) {
    return {
      id: "spin-wheel",
      emoji: "🎡",
      label: "Spin The Wheel",
      tool: "spin-wheel",
    };
  }

  if (
    /\b(brain dump|clear (?:your |my )?head|clear your mind|get (?:everything |your thoughts |it )out(?: of your head)?|empty (?:your head|it all)|pour (?:it )?all out|jot everything down|unload (?:your|what's on your) mind)\b/i.test(
      lower,
    )
  ) {
    return {
      id: "clear-mind",
      emoji: "🧠",
      label: "Open Clear My Mind",
      tool: "brain-dump",
    };
  }

  if (
    /\b(time ?block|open (?:the )?planning|schedule (?:it|this)|block out time|place it on (?:your|my) (?:day|calendar))\b/i.test(
      lower,
    )
  ) {
    return {
      id: "time-block",
      emoji: "📅",
      label: "Open Time Block",
      tool: "time-block",
    };
  }

  if (
    /\b(breathe(?:\s+and\s+reset)?|breathing exercise|take a (?:moment to )?breathe|take a breath|start breathing|try breathing|ground yourself(?: first)?|calm your nervous system)\b/i.test(
      lower,
    )
  ) {
    return {
      id: "breathe",
      emoji: "🌿",
      label: "Start Breathe",
      tool: "breathe",
    };
  }

  if (
    /\b(focus audio|open (?:the )?audio|background (?:music|sounds?)|calming (?:music|sounds?|audio)|relaxing (?:music|audio|sounds?)|motivation(?:al)? (?:music|audio|sounds?)|concentration music)\b/i.test(
      lower,
    )
  ) {
    return {
      id: "focus-audio",
      emoji: "🎧",
      label: "Open Focus Audio",
      tool: "focus-audio",
    };
  }

  return null;
}
