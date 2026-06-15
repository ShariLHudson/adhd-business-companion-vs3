/**
 * Opportunity signals from conversations and existing intelligence stores.
 */

import { getBrainDumps, getProjects } from "@/lib/companionStore";
import { userIntelligenceEngine } from "@/lib/ecosystem/userIntelligenceEngine";
import { getActivationStore } from "@/lib/activation/activationStore";
import { getLoopStore } from "@/lib/loop-intelligence/loopStore";
import { getRelationships } from "@/lib/relationship-intelligence/relationshipStore";
import type { OpportunityInput, OpportunitySignalHit, OpportunityType } from "./types";

const MS_DAY = 86_400_000;

const TEXT_PATTERNS: {
  signalId: string;
  label: string;
  re: RegExp;
  type: OpportunityType;
  topic: string;
  weight: number;
}[] = [
  {
    signalId: "write_about",
    label: "Wants to write about topic",
    re: /\b(write about|blog about|post about|content on|newsletter about)\b/i,
    type: "content_opportunity",
    topic: "recurring theme",
    weight: 4,
  },
  {
    signalId: "people_ask",
    label: "People keep asking",
    re: /\b(people keep asking|asked me a lot|get this question|everyone asks)\b/i,
    type: "lead_magnet_opportunity",
    topic: "frequent question",
    weight: 5,
  },
  {
    signalId: "workshop_idea",
    label: "Workshop or training idea",
    re: /\b(workshop|masterclass|training|teach a class|run a session)\b/i,
    type: "workshop_opportunity",
    topic: "teaching idea",
    weight: 4,
  },
  {
    signalId: "offer_idea",
    label: "Offer or package idea",
    re: /\b(offer|package|bundle|pricing|sell this|monetize)\b/i,
    type: "offer_opportunity",
    topic: "offer concept",
    weight: 4,
  },
  {
    signalId: "template_repeat",
    label: "Repeating workflow",
    re: /\b(every time i|keep doing the same|repeat this process|same steps again)\b/i,
    type: "workflow_opportunity",
    topic: "repeatable workflow",
    weight: 4,
  },
  {
    signalId: "product_friction",
    label: "Product friction mentioned",
    re: /\b(wish the app|would be nice if|feature request|hard to use|confusing flow)\b/i,
    type: "product_opportunity",
    topic: "product improvement",
    weight: 5,
  },
  {
    signalId: "burnout_topic",
    label: "Burnout topic",
    re: /\b(burnout|burned out|exhausted founders|adhd overwhelm)\b/i,
    type: "workshop_opportunity",
    topic: "burnout support",
    weight: 3,
  },
];

function countSignal(
  kind: "struggle" | "question" | "emotion",
  category: string,
  sinceMs: number,
): number {
  return userIntelligenceEngine
    .getCounts()
    .filter((c) => c.kind === kind && c.category === category)
    .reduce((sum, c) => {
      const seen = new Date(c.lastSeen).getTime();
      return seen >= sinceMs ? sum + c.count : sum;
    }, 0);
}

export function scanTextOpportunitySignals(text: string): OpportunitySignalHit[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const hits: OpportunitySignalHit[] = [];
  for (const p of TEXT_PATTERNS) {
    if (!p.re.test(trimmed)) continue;
    hits.push({
      signalId: p.signalId,
      label: p.label,
      source: "conversation",
      opportunityType: p.type,
      topic: p.topic,
      weight: p.weight,
      detail: `Language in chat: ${p.label.toLowerCase()}`,
    });
  }
  return hits;
}

export function gatherIntelligenceOpportunitySignals(
  input: OpportunityInput = {},
): OpportunitySignalHit[] {
  const now = input.now ?? new Date();
  const since7d = now.getTime() - 7 * MS_DAY;
  const hits: OpportunitySignalHit[] = [];

  const overwhelm = countSignal("struggle", "overwhelm", since7d);
  if (overwhelm >= 2) {
    hits.push({
      signalId: "repeated_overwhelm",
      label: "Repeated overwhelm struggles",
      source: "struggle_pattern",
      opportunityType: "workshop_opportunity",
      topic: "overwhelm support",
      weight: overwhelm,
      detail: `Overwhelm mentioned ${overwhelm} times recently`,
    });
  }

  const contentStruggle = countSignal("struggle", "content_creation", since7d);
  if (contentStruggle >= 2) {
    hits.push({
      signalId: "content_struggle",
      label: "Content creation struggle",
      source: "struggle_pattern",
      opportunityType: "content_opportunity",
      topic: "content support",
      weight: contentStruggle,
      detail: "Repeated content creation friction",
    });
  }

  const openIdeas = getBrainDumps().filter((e) => !e.done).length;
  if (openIdeas >= 4) {
    hits.push({
      signalId: "saved_ideas",
      label: "Many saved ideas",
      source: "saved_idea",
      opportunityType: "lead_magnet_opportunity",
      topic: "parked ideas",
      weight: Math.min(openIdeas, 6),
      detail: `${openIdeas} open brain-dump items`,
    });
  }

  const stalled = getProjects().filter(
    (p) => p.status === "paused" || p.status === "not-started",
  ).length;
  if (stalled >= 2) {
    hits.push({
      signalId: "stalled_projects",
      label: "Stalled projects",
      source: "stalled_project",
      opportunityType: "workflow_opportunity",
      topic: "project momentum",
      weight: stalled,
      detail: `${stalled} projects paused or not started`,
    });
  }

  for (const rel of getRelationships().slice(0, 5)) {
    hits.push({
      signalId: `rel_${rel.id}`,
      label: `Warm relationship: ${rel.name}`,
      source: "relationship",
      opportunityType: "relationship_opportunity",
      topic: rel.name,
      weight: rel.importance === "high" ? 4 : 3,
      detail: rel.lastContext.slice(0, 80),
    });
  }

  const loopSnaps = getLoopStore().snapshots.slice(-10);
  const loopCounts = new Map<string, number>();
  for (const s of loopSnaps) {
    loopCounts.set(s.loopType, (loopCounts.get(s.loopType) ?? 0) + 1);
  }
  for (const [loopType, count] of loopCounts) {
    if (count < 2) continue;
    hits.push({
      signalId: `loop_${loopType}`,
      label: `Recurring loop: ${loopType}`,
      source: "loop_pattern",
      opportunityType: "content_opportunity",
      topic: loopType.replace(/_loop$/, "").replaceAll("_", " "),
      weight: count,
      detail: `Loop pattern surfaced ${count} times`,
    });
  }

  const activationSnaps = getActivationStore().history.slice(-15);
  const blockerCounts = new Map<string, number>();
  for (const snap of activationSnaps) {
    const b = snap.likelyBlockers[0]?.type;
    if (!b) continue;
    blockerCounts.set(b, (blockerCounts.get(b) ?? 0) + 1);
  }
  for (const [blocker, count] of blockerCounts) {
    if (count < 2) continue;
    hits.push({
      signalId: `blocker_${blocker}`,
      label: `Common blocker: ${blocker}`,
      source: "blocker_pattern",
      opportunityType: "product_opportunity",
      topic: blocker.replaceAll("_", " "),
      weight: count,
      detail: `Users stuck on ${blocker} repeatedly`,
    });
  }

  if (input.activationBlocker) {
    hits.push({
      signalId: "current_blocker",
      label: "Current activation blocker",
      source: "blocker_pattern",
      opportunityType: "product_opportunity",
      topic: input.activationBlocker,
      weight: 3,
      detail: "Active stuck pattern in this session",
    });
  }

  if (input.loopType) {
    hits.push({
      signalId: "current_loop",
      label: "Current loop pattern",
      source: "loop_pattern",
      opportunityType: "content_opportunity",
      topic: input.loopType,
      weight: 3,
      detail: "Active loop in this session",
    });
  }

  return hits;
}

export function collectOpportunitySignals(
  input: OpportunityInput = {},
): OpportunitySignalHit[] {
  const text = input.text?.trim() ?? "";
  const fromText = scanTextOpportunitySignals(text);
  const fromIntel = gatherIntelligenceOpportunitySignals(input);
  const merged = [...fromText, ...fromIntel];
  const seen = new Set<string>();
  return merged.filter((h) => {
    const key = `${h.opportunityType}:${h.topic}:${h.signalId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
