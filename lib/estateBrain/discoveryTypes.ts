/**
 * Discovery Mode — understand before routing.
 *
 * @see docs/estate/ESTATE_DISCOVERY_MODE.md
 */

import type { EstateCoachingMenu } from "./estateCoachingTypes";
import type { EstateIntelligenceRoute } from "./intelligenceTypes";
import type { ImmediateCreateOpenPayload } from "@/lib/createExperience/createExperienceRouting";
import type { ImmediateEstateCoachingOpenPayload } from "./estateCoachingTypes";
import type { ImmediateResearchOpenPayload } from "./intelligenceTypes";

export type DiscoveryTopic =
  | "create_sop"
  | "focus"
  | "business_growth"
  | "research";

export type DiscoverySlot = "goal" | "obstacle" | "outcome" | "context";

export type DiscoveryConfidence = {
  goal: boolean;
  obstacle: boolean;
  outcome: boolean;
  context: boolean;
  score: number;
};

export type DiscoveryQuestion = {
  id: string;
  slot: DiscoverySlot;
  prompt: string;
  /** If answer matches, pre-score this slot */
  signalPatterns?: readonly RegExp[];
};

export type DiscoverySession = {
  topic: DiscoveryTopic;
  confidence: DiscoveryConfidence;
  answers: Record<string, string>;
  questionIndex: number;
  originalUserText: string;
  startedAtTurn: number;
};

export type EstateDiscoveryReadyAction =
  | {
      kind: "coaching_menu";
      menu: EstateCoachingMenu;
      preparationLine?: string;
    }
  | {
      kind: "create_open";
      payload: ImmediateCreateOpenPayload;
      preparationLine: string;
    }
  | {
      kind: "research_open";
      payload: ImmediateResearchOpenPayload;
      preparationLine: string;
    }
  | {
      kind: "navigate";
      payload: ImmediateEstateCoachingOpenPayload;
      route: EstateIntelligenceRoute;
      preparationLine: string;
    };

export type DiscoveryTurnResult =
  | {
      kind: "question";
      intro?: string;
      question: string;
      session: DiscoverySession;
    }
  | {
      kind: "ready";
      session: DiscoverySession;
      message: string;
      action: EstateDiscoveryReadyAction;
    };

export const DISCOVERY_CONFIDENCE_THRESHOLD = 90;

export const DISCOVERY_SLOT_POINTS: Record<DiscoverySlot, number> = {
  goal: 30,
  obstacle: 30,
  outcome: 30,
  context: 10,
};

export function computeDiscoveryConfidence(
  flags: Omit<DiscoveryConfidence, "score">,
): DiscoveryConfidence {
  let score = 0;
  if (flags.goal) score += DISCOVERY_SLOT_POINTS.goal;
  if (flags.obstacle) score += DISCOVERY_SLOT_POINTS.obstacle;
  if (flags.outcome) score += DISCOVERY_SLOT_POINTS.outcome;
  if (flags.context) score += DISCOVERY_SLOT_POINTS.context;
  return { ...flags, score };
}

export function isDiscoveryComplete(confidence: DiscoveryConfidence): boolean {
  return confidence.score >= DISCOVERY_CONFIDENCE_THRESHOLD;
}
