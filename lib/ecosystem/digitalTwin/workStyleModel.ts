// Founder Ecosystem — Phase 16 Work Style Model.
// Observes how the founder approaches work (behavior, not personality). Multiple
// traits allowed, each with a confidence. Observational framing only.

import type { FounderEvent } from "../events";
import type { WorkStyleModel, WorkStyleTrait } from "./digitalTwinTypes";
import { chatTexts, scoreTexts, scoredTraits } from "./digitalTwinUtil";

const WORK_RE: Record<WorkStyleTrait, RegExp> = {
  visionary: /\b(vision|big picture|future|long.?term|mission|imagine|dream|where this is going)\b/i,
  builder: /\b(build|building|product|website|set up|develop|ship|prototype|mvp|create the)\b/i,
  operator: /\b(operation|process|workflow|admin|logistics|systemi|automat|bookkeep|fulfil|maintain)\b/i,
  teacher: /\b(teach|explain|course|workshop|educate|lesson|guide|share what i|mentor)\b/i,
  creator: /\b(content|write|post|design|video|caption|story|creative|brand|reel)\b/i,
  strategist: /\b(strateg|analy|prioriti|positioning|roadmap|market|decide between|plan the)\b/i,
  connector: /\b(network|partner|collab|introduc|community|relationship|reach out|connect with)\b/i,
};

const OBSERVE: Record<WorkStyleTrait, string> = {
  visionary: "frame work around the bigger picture",
  builder: "get energy from building and shipping things",
  operator: "keep things running and systematized",
  teacher: "naturally explain and share what you learn",
  creator: "lean into creative, content-driven work",
  strategist: "step back and think strategically before moving",
  connector: "build momentum through people and relationships",
};

export function buildWorkStyleModel(events: FounderEvent[]): WorkStyleModel {
  const texts = chatTexts(events);
  const scores = scoreTexts(texts, WORK_RE) as Record<WorkStyleTrait, number>;

  // Structural reinforcement from what the founder actually does.
  scores.builder += events.filter(
    (e) => e.type === "project.created" || e.type === "document.created",
  ).length;
  scores.operator += events.filter((e) => e.type === "timeblock.created").length;
  scores.strategist += events.filter((e) => e.type === "decision.created").length;
  scores.visionary += events.filter((e) => e.type === "opportunity.created").length;
  scores.creator += events.filter(
    (e) => e.type === "document.created" && /content|post|email|copy/i.test(String(e.data?.title ?? "")),
  ).length;

  const traits = scoredTraits<WorkStyleTrait>(scores, 1);
  const top = traits[0];
  const observation = top
    ? `You tend to ${OBSERVE[top.value]}.`
    : "Not enough activity yet to see a clear work style.";

  return {
    traits: traits.length ? traits : [{ value: "builder", score: 0, confidence: "low" }],
    observation,
  };
}
