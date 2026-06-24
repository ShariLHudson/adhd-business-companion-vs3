/**
 * P0.18 — Strategy Offer Continuation™
 * Register ADHD strategy offers so "yes" opens Strategies + apply-coach.
 */

import {
  recommendStrategyFromUserText,
  type StrategyRecommendation,
} from "./strategyIntelligence";
import { STRATEGIES, getStrategy } from "./strategySystem";
import type { FrictionlessPendingAction } from "./frictionlessActionLayer";
import {
  clearFrictionlessPending,
  isFrictionlessAffirmation,
  saveFrictionlessPending,
} from "./frictionlessActionLayer";

export type StrategyOfferPendingAction = FrictionlessPendingAction & {
  type: "strategy_offer";
  target: "playbook";
  strategyId: string;
  strategyTitle: string;
};

const STRATEGY_OFFER_MESSAGE_RE =
  /\b(?:would you like to use it|want to use it)\b/i;

const STRATEGY_OFFER_CONTEXT_RE =
  /\b(?:strategy|may help|try this)\b/i;

/** Business strategy documents belong in Create — not ADHD apply-coach. */
const BUSINESS_STRATEGY_DOC_RE =
  /\b(?:help me (?:create|write|draft|build)|(?:create|write|draft|build) (?:a |an |my )?)(?:marketing|sales|business|launch|content|growth) strateg(?:y|ies)\b/i;

const BUSINESS_STRATEGY_PLAN_RE =
  /\b(?:marketing strategy|sales strategy|business strategy|launch strategy document|content strategy doc)\b/i;

const USE_IT_AFFIRMATION_RE = /^(?:use it|let'?s use it)\.?$/i;

export function isStrategyIntelligenceOfferMessage(
  assistantText: string,
): boolean {
  const t = assistantText.trim();
  if (!t) return false;
  return (
    STRATEGY_OFFER_MESSAGE_RE.test(t) && STRATEGY_OFFER_CONTEXT_RE.test(t)
  );
}

export function shouldSkipStrategyOfferForUserText(userText: string): boolean {
  const t = userText.trim();
  if (!t) return true;
  if (BUSINESS_STRATEGY_DOC_RE.test(t)) return true;
  if (
    BUSINESS_STRATEGY_PLAN_RE.test(t) &&
    /\b(?:create|write|draft|build|document|plan)\b/i.test(t)
  ) {
    return true;
  }
  return false;
}

export function isStrategyOfferAffirmation(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return isFrictionlessAffirmation(t) || USE_IT_AFFIRMATION_RE.test(t);
}

export function strategyOfferSummary(title: string): string {
  return `Use ${title.trim()}`;
}

export function strategyOfferAck(title: string): string {
  const name = title.trim();
  return name ? `Opening **${name}**.` : "Opening that strategy.";
}

export function resolveStrategyFromOfferMessage(
  assistantText: string,
  priorUserText?: string,
): { strategyId: string; title: string } | null {
  if (!isStrategyIntelligenceOfferMessage(assistantText)) return null;

  for (const s of STRATEGIES) {
    if (assistantText.includes(`**${s.title}**`)) {
      return { strategyId: s.id, title: s.title };
    }
  }

  const boldChunks = [...assistantText.matchAll(/\*\*([^*]+)\*\*/g)].map(
    (m) => m[1]!.trim(),
  );
  for (const chunk of boldChunks) {
    const lower = chunk.toLowerCase();
    for (const s of STRATEGIES) {
      if (s.title.toLowerCase() === lower) {
        return { strategyId: s.id, title: s.title };
      }
    }
  }

  const rec = priorUserText?.trim()
    ? recommendStrategyFromUserText(priorUserText)
    : null;
  if (rec) {
    return { strategyId: rec.strategyId, title: rec.title };
  }

  return null;
}

export function buildStrategyOfferPendingAction(input: {
  strategyId: string;
  strategyTitle: string;
  initialPrompt: string;
  offeredAtTurn: number;
}): StrategyOfferPendingAction {
  const title = input.strategyTitle.trim();
  return {
    type: "strategy_offer",
    target: "playbook",
    context: input.strategyId,
    strategyId: input.strategyId,
    strategyTitle: title,
    initialPrompt: input.initialPrompt.trim(),
    offeredAtTurn: input.offeredAtTurn,
    offerSummary: strategyOfferSummary(title),
  };
}

export function buildStrategyOfferPendingFromRecommendation(
  rec: StrategyRecommendation,
  initialPrompt: string,
  offeredAtTurn: number,
): StrategyOfferPendingAction {
  return buildStrategyOfferPendingAction({
    strategyId: rec.strategyId,
    strategyTitle: rec.title,
    initialPrompt,
    offeredAtTurn,
  });
}

export function registerStrategyOfferFromAssistant(input: {
  assistantText: string;
  priorUserText: string;
  offeredAtTurn: number;
}): StrategyOfferPendingAction | null {
  if (shouldSkipStrategyOfferForUserText(input.priorUserText)) return null;

  const resolved = resolveStrategyFromOfferMessage(
    input.assistantText,
    input.priorUserText,
  );
  if (!resolved || !getStrategy(resolved.strategyId)) return null;

  return buildStrategyOfferPendingAction({
    strategyId: resolved.strategyId,
    strategyTitle: resolved.title,
    initialPrompt: input.priorUserText,
    offeredAtTurn: input.offeredAtTurn,
  });
}

/** Latest strategy offer wins — replaces any stale frictionless pending. */
export function saveStrategyOfferPending(
  pending: StrategyOfferPendingAction,
): void {
  clearFrictionlessPending();
  saveFrictionlessPending(pending);
}

export function recoverStrategyOfferPendingFromChat(input: {
  userText: string;
  lastAssistantText: string;
  priorUserText?: string;
  currentTurn: number;
}): StrategyOfferPendingAction | null {
  if (!isStrategyOfferAffirmation(input.userText)) return null;
  if (!isStrategyIntelligenceOfferMessage(input.lastAssistantText)) return null;
  if (input.priorUserText && shouldSkipStrategyOfferForUserText(input.priorUserText)) {
    return null;
  }
  const resolved = resolveStrategyFromOfferMessage(
    input.lastAssistantText,
    input.priorUserText,
  );
  if (!resolved) return null;
  return buildStrategyOfferPendingAction({
    strategyId: resolved.strategyId,
    strategyTitle: resolved.title,
    initialPrompt: input.priorUserText?.trim() ?? "",
    offeredAtTurn: input.currentTurn - 1,
  });
}

export function isStrategyOfferPending(
  pending: FrictionlessPendingAction | null,
): pending is StrategyOfferPendingAction {
  return pending?.type === "strategy_offer" && Boolean(pending.strategyId);
}
