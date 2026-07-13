/**
 * Detect explicit capability requests that must be fulfilled from any room (#183).
 * Intent always has priority over location.
 */

import type { AppSection } from "@/lib/companionUi";
import type { VisualThinkingViewId } from "@/lib/visualThinkingStudio";
import { detectSparkVisualEngineViewRequest } from "@/lib/sparkVisualEngine";
import { pickUniversalAccessFulfillLine } from "./universalAccessStandard";
import {
  BREATHE_UNIVERSAL_PATTERN,
  detectBreathePatternHint,
} from "./breatheUniversalAccess";

export type UniversalCapabilityId =
  | "clear-my-mind"
  | "visual-thinking"
  | "focus-timer"
  | "calendar"
  | "projects"
  | "journal"
  | "evidence-vault"
  | "destination-gallery"
  | "decision-compass"
  | "plan-my-day"
  | "breathe"
  | "peaceful-places"
  | "google-workspace"
  | "content-create"
  | "strategies"
  | "saved-work"
  | "templates"
  | "client-avatars"
  | "momentum-games"
  | "spin-wheel";

export type UniversalCapabilityRequest = {
  capabilityId: UniversalCapabilityId;
  /** Shell section to open when applicable. */
  section: AppSection;
  /** Short fulfill line — never block language. */
  ack: string;
  /** Optional sidebar/nav hint. */
  nav?: string;
  /** Spark Visual Engine studio view (#184) when opening visual-focus. */
  visualStudioViewId?: VisualThinkingViewId;
  /** Breathe pattern hint when the member named one. */
  breathePatternId?: "relaxing" | "box" | "relax478" | "equal";
};

type Rule = {
  id: UniversalCapabilityId;
  section: AppSection;
  nav?: string;
  pattern: RegExp;
  ackSeed: number;
};

/**
 * Explicit open/start/show/create language — not soft suggestions.
 * Clear My Mind capture chatter ("anything else?") must not match.
 */
const EXPLICIT_VERB =
  /\b(?:open|start|show|create|make|build|schedule|visualize|map this(?:\s+out)?|save(?:\s+this)?\s+to|send(?:\s+this)?\s+to|take me to|go to|bring up|launch (?:the |a |an |my |this )|i (?:want|need) (?:a |to |my )?|can you (?:open|start|show|create|make)|let'?s (?:open|start|make|create))\b/i;

const RULES: readonly Rule[] = [
  {
    id: "visual-thinking",
    section: "visual-focus",
    nav: "visual-thinking",
    pattern:
      /\b(?:mind\s*map|visual thinking|visualize(?:\s+this)?|spark visual|workflow map|make this visual|map this out|show me visually|flowchart|process map|thought map|relationship map|decision tree|show the connections)\b/i,
    ackSeed: 0,
  },
  {
    id: "focus-timer",
    section: "focus-timer",
    nav: "focus",
    pattern: /\b(?:focus timer|focus session|pomodoro|start(?:\s+a)?\s+timer)\b/i,
    ackSeed: 1,
  },
  {
    id: "calendar",
    section: "time-block",
    nav: "create",
    pattern:
      /\b(?:calendar|schedule this|time block|add to calendar|put this on my calendar)\b/i,
    ackSeed: 2,
  },
  {
    id: "projects",
    section: "project-homes",
    nav: "create",
    pattern: /\b(?:my projects|open projects|show projects|project homes?)\b/i,
    ackSeed: 3,
  },
  {
    id: "journal",
    section: "growth-journal",
    nav: "journal",
    pattern: /\b(?:my journal|open(?:\s+my)?\s+journal|journal gazebo|write in my journal)\b/i,
    ackSeed: 0,
  },
  {
    id: "evidence-vault",
    section: "evidence-bank",
    nav: "evidence-bank",
    pattern:
      /\b(?:evidence vault|evidence bank|open evidence|show (?:my )?evidence)\b/i,
    ackSeed: 1,
  },
  {
    id: "destination-gallery",
    section: "destination-gallery",
    nav: "create",
    pattern:
      /\b(?:destination gallery|send this somewhere|save (?:this )?to (?:google )?(?:drive|docs)|google drive|google docs)\b/i,
    ackSeed: 2,
  },
  {
    id: "google-workspace",
    section: "google-workspace",
    nav: "create",
    pattern: /\b(?:google workspace|open google)\b/i,
    ackSeed: 3,
  },
  {
    id: "decision-compass",
    section: "decision-compass",
    nav: "create",
    pattern: /\b(?:decision compass|help me decide|open decision)\b/i,
    ackSeed: 0,
  },
  {
    id: "plan-my-day",
    section: "plan-my-day",
    nav: "plan-my-day",
    pattern: /\b(?:plan my day|open plan my day|today'?s plan)\b/i,
    ackSeed: 1,
  },
  {
    id: "breathe",
    section: "breathe",
    pattern: BREATHE_UNIVERSAL_PATTERN,
    ackSeed: 2,
  },
  {
    id: "peaceful-places",
    section: "focus-audio",
    nav: "focus",
    pattern:
      /\b(?:peaceful places|soundscape|open soundscapes|play (?:rain|birds|fireplace))\b/i,
    ackSeed: 3,
  },
  {
    id: "content-create",
    section: "content-generator",
    nav: "create",
    pattern: /\b(?:content generator|create content|open create|creative studio)\b/i,
    ackSeed: 0,
  },
  {
    id: "strategies",
    section: "playbook",
    nav: "playbook",
    pattern: /\b(?:strategies|playbook|open strateg)\b/i,
    ackSeed: 3,
  },
  {
    id: "saved-work",
    section: "saved-work",
    nav: "saved-work",
    pattern: /\b(?:saved work|open saved|my saved)\b/i,
    ackSeed: 1,
  },
  {
    id: "templates",
    section: "templates-library",
    nav: "templates",
    pattern: /\b(?:templates?(?:\s+library)?|open templates?)\b/i,
    ackSeed: 2,
  },
  {
    id: "client-avatars",
    section: "client-avatars",
    nav: "create",
    pattern:
      /\b(?:client avatars?|ideal client|open (?:my )?(?:icp|client avatar))\b/i,
    ackSeed: 0,
  },
  {
    id: "momentum-games",
    section: "quick-recharge",
    nav: "focus",
    pattern: /\b(?:momentum games?|open games|quick recharge)\b/i,
    ackSeed: 1,
  },
  {
    id: "spin-wheel",
    section: "spin-wheel",
    nav: "focus",
    pattern: /\b(?:spin(?:\s+the)?\s+wheel|decision wheel)\b/i,
    ackSeed: 2,
  },
  {
    id: "clear-my-mind",
    section: "brain-dump",
    nav: "clear-my-mind",
    pattern: /\b(?:clear my mind|brain dump|open clear my mind)\b/i,
    ackSeed: 1,
  },
] as const;

/**
 * Returns a capability launch when the member explicitly requests one.
 * Soft capture chatter without an open/start verb does not match.
 */
export function detectUniversalCapabilityRequest(
  text: string,
): UniversalCapabilityRequest | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  for (const rule of RULES) {
    if (!rule.pattern.test(trimmed)) continue;
    /** Clear My Mind self-open while already capturing needs an explicit verb. */
    if (rule.id === "clear-my-mind" && !EXPLICIT_VERB.test(trimmed)) {
      continue;
    }
    /**
     * Most capabilities require an explicit verb so capture chatter does not navigate.
     * Product-name / action-phrase rules may match without a separate open verb.
     */
    const nounStrong =
      rule.id === "evidence-vault" ||
      rule.id === "focus-timer" ||
      rule.id === "plan-my-day" ||
      rule.id === "spin-wheel" ||
      rule.id === "breathe";
    if (!nounStrong && !EXPLICIT_VERB.test(trimmed)) continue;

    const visual =
      rule.id === "visual-thinking"
        ? detectSparkVisualEngineViewRequest(trimmed)
        : null;

    const breathePattern =
      rule.id === "breathe" ? detectBreathePatternHint(trimmed) : undefined;

    return {
      capabilityId: rule.id,
      section: rule.section,
      nav: rule.nav,
      ack: pickUniversalAccessFulfillLine(rule.ackSeed),
      ...(visual ? { visualStudioViewId: visual.studioViewId } : {}),
      ...(breathePattern ? { breathePatternId: breathePattern } : {}),
    };
  }

  /** #184 — explicit Visual Engine view phrases not covered by RULES pattern. */
  const visualOnly = detectSparkVisualEngineViewRequest(trimmed);
  if (visualOnly && EXPLICIT_VERB.test(trimmed)) {
    return {
      capabilityId: "visual-thinking",
      section: "visual-focus",
      nav: "visual-thinking",
      ack: pickUniversalAccessFulfillLine(0),
      visualStudioViewId: visualOnly.studioViewId,
    };
  }

  return null;
}

export function isUniversalCapabilityRequest(text: string): boolean {
  return detectUniversalCapabilityRequest(text) !== null;
}
