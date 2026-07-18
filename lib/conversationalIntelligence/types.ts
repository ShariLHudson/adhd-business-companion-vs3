/**
 * Conversational Intelligence (CI) — shared delivery layer.
 * RCI decides WHAT; CI decides HOW Shari says it.
 */

import type { AiTone } from "@/lib/companionStore";
import type {
  RciConversationArchetype,
  RciResponseKind,
} from "@/lib/reflectiveConversationIntelligence";

export type CiExperienceId =
  | "talk-it-out"
  | "journal-gazebo"
  | "decision-compass"
  | "chamber"
  | "board"
  | "general-chat"
  | "founder-studio"
  | "other";

/** Immediate conversational goal — shapes delivery, not reasoning. */
export type ConversationalGoal =
  | "think-aloud"
  | "untangle-ideas"
  | "compare-options"
  | "process-experience"
  | "gain-perspective"
  | "understand-emotions"
  | "organize-thoughts"
  | "build-confidence"
  | "other";

/** Delivery tone band — never dramatic or poetic. */
export type ExpressionToneBand =
  | "business"
  | "overwhelm"
  | "creative"
  | "celebration"
  | "reflection"
  | "everyday";

export type CuriosityObjective =
  | "clarify"
  | "compare"
  | "prioritize"
  | "examine-assumptions"
  | "explore-values"
  | "identify-constraints"
  | "surface-uncertainty"
  | "connect-ideas"
  | "imagine-outcomes"
  | "notice-patterns";

export type CiDeliveryInput = {
  experienceId: CiExperienceId;
  draftText: string;
  userText: string;
  responseKind: RciResponseKind | "help_offer" | "other";
  archetype?: RciConversationArchetype;
  aiTone?: AiTone;
  recentAssistantTexts?: readonly string[];
  /** Soft: prefer observation-only when draft already has a question. */
  preferBrevity?: boolean;
};

export type CiQualityCert = {
  soundsHuman: boolean;
  notScripted: boolean;
  avoidsRepetition: boolean;
  buildsOnUser: boolean;
  movesForward: boolean;
  leavesRoom: boolean;
  passed: boolean;
  failures: string[];
};

export type CiDeliveryResult = {
  text: string;
  goal: ConversationalGoal;
  toneBand: ExpressionToneBand;
  curiosityObjective: CuriosityObjective | null;
  quality: CiQualityCert;
  regenerated: boolean;
};
