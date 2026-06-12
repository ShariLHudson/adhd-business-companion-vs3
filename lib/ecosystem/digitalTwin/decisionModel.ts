// Founder Ecosystem — Phase 16 Decision Model.
// Observes HOW the founder decides from behavior: speed (created→resolved gap),
// research before deciding, action after deciding, and language signals for
// consensus-seeking vs independent. Observational only.

import type { FounderEvent } from "../events";
import type { DecisionModel, DecisionTrait, Scored } from "./digitalTwinTypes";
import {
  avgResolutionDays,
  chatTexts,
  confidenceFromEvidence,
  countType,
} from "./digitalTwinUtil";

export function buildDecisionModel(events: FounderEvent[]): DecisionModel {
  const texts = chatTexts(events);
  const made = countType(events, "decision.updated");
  const created = countType(events, "decision.created");
  const avgDays = avgResolutionDays(events, "decision.created", "decision.updated", "decisionId");

  const scores: Record<DecisionTrait, number> = {
    "fast-decision-maker": 0,
    "slow-decision-maker": 0,
    "research-driven": 0,
    "action-driven": 0,
    "consensus-seeking": 0,
    independent: 0,
  };
  const patterns: string[] = [];
  const examples: string[] = [];

  if (avgDays !== null) {
    if (avgDays <= 1) {
      scores["fast-decision-maker"] += made + 2;
      patterns.push("Decisions usually get resolved within a day.");
      examples.push("Decided and moved on the same day.");
    } else if (avgDays >= 3) {
      scores["slow-decision-maker"] += made + 1;
      patterns.push("Decisions tend to sit for a few days before resolving.");
    }
  }

  // Research before deciding.
  const research = countType(events, "research.completed");
  if (research > 0) {
    scores["research-driven"] += research;
    patterns.push("Often gathers information before committing.");
  }

  // Action right after a decision (a task/focus soon after decision.updated).
  const decisionTimes = events
    .filter((e) => e.type === "decision.updated")
    .map((e) => new Date(e.ts).getTime());
  const actionAfter = events.filter(
    (e) =>
      (e.type === "task.created" || e.type === "focus.started") &&
      decisionTimes.some((d) => {
        const dt = new Date(e.ts).getTime() - d;
        return dt >= 0 && dt <= 2 * 86_400_000;
      }),
  ).length;
  if (actionAfter > 0) {
    scores["action-driven"] += actionAfter;
    patterns.push("Tends to act soon after deciding.");
  }

  // Language signals.
  const asks = texts.filter((t) => /\b(should i|what do you think|help me decide|which one|ask the team|get input)\b/i.test(t)).length;
  const independent = texts.filter((t) => /\b(i'?ll just|i decided|i'?m going to|my call|going with)\b/i.test(t)).length;
  if (asks > 0) {
    scores["consensus-seeking"] += asks;
    patterns.push("Likes to talk decisions through before settling.");
  }
  if (independent > 0) {
    scores.independent += independent;
    patterns.push("Comfortable making the call independently.");
  }

  const traits: Scored<DecisionTrait>[] = Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([value, score]) => ({
      value: value as DecisionTrait,
      score,
      confidence: confidenceFromEvidence(score),
    }));

  const top = traits[0];
  const observation = top
    ? `It appears you're often a ${top.value.replace(/-/g, " ")}.`
    : created > 0
      ? "You have open decisions, but not enough resolved yet to read a pattern."
      : "Not enough decisions logged yet to read a pattern.";

  return { traits, patterns, examples, observation };
}
