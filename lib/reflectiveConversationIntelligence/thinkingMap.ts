/**
 * Internal Thinking Map — hidden from members; updated each turn.
 */

import { classifyConversationArchetype } from "./archetype";
import type { RciMessage, ThinkingMap } from "./types";

export function emptyThinkingMap(): ThinkingMap {
  return {
    situation: null,
    goal: null,
    facts: [],
    optionsNamed: [],
    assumptions: [],
    constraints: [],
    unknowns: [],
    concerns: [],
    values: [],
    tradeOffs: [],
    resources: [],
    patterns: [],
    questionsAnswered: [],
    questionsWorthExploring: [],
    emergingInsights: [],
    archetype: "other",
    turnCount: 0,
    lastUserText: null,
  };
}

function pushUnique(list: string[], item: string, max = 12): void {
  const cleaned = item.trim();
  if (!cleaned || cleaned.length < 3) return;
  const key = cleaned.toLowerCase();
  if (list.some((x) => x.toLowerCase() === key)) return;
  list.push(cleaned.slice(0, 160));
  if (list.length > max) list.splice(0, list.length - max);
}

function extractOptions(text: string): string[] {
  const found: string[] = [];
  const orParts = text.split(/\b(?:or|versus|vs\.?)\b/i);
  if (orParts.length >= 2 && orParts.length <= 4) {
    for (const p of orParts) {
      const bit = p.trim().replace(/^[,.\s]+|[,.\s]+$/g, "");
      if (bit.length > 2 && bit.length < 80) found.push(bit);
    }
  }
  return found;
}

/**
 * Update Thinking Map from the latest user utterance + history.
 * Heuristic V1 — deterministic; no LLM.
 */
export function updateThinkingMap(
  previous: ThinkingMap | null | undefined,
  userText: string,
  messages: readonly RciMessage[],
): ThinkingMap {
  const map: ThinkingMap = previous
    ? {
        ...previous,
        facts: [...previous.facts],
        optionsNamed: [...previous.optionsNamed],
        assumptions: [...previous.assumptions],
        constraints: [...previous.constraints],
        unknowns: [...previous.unknowns],
        concerns: [...previous.concerns],
        values: [...previous.values],
        tradeOffs: [...previous.tradeOffs],
        resources: [...previous.resources],
        patterns: [...previous.patterns],
        questionsAnswered: [...previous.questionsAnswered],
        questionsWorthExploring: [...previous.questionsWorthExploring],
        emergingInsights: [...previous.emergingInsights],
      }
    : emptyThinkingMap();

  const t = userText.trim();
  map.lastUserText = t || null;
  map.turnCount =
    messages.filter((m) => m.role === "user").length + (t ? 0 : 0);
  // Count includes the turn being processed when caller already appended user msg.
  const userTurns = messages.filter((m) => m.role === "user").length;
  map.turnCount = Math.max(map.turnCount, userTurns);
  map.archetype = classifyConversationArchetype(t, messages);

  if (!map.situation && t) {
    map.situation = t.length <= 140 ? t : `${t.slice(0, 137)}…`;
  }

  if (/\b(?:want|hope|goal|trying to|need to)\b/i.test(t)) {
    pushUnique(map.facts, t.slice(0, 120));
    if (!map.goal) {
      const m = t.match(
        /\b(?:want|hope|trying to|need to)\s+(.{8,80}?)(?:[.!?]|$)/i,
      );
      if (m?.[1]) map.goal = m[1].trim();
    }
  }

  for (const opt of extractOptions(t)) {
    pushUnique(map.optionsNamed, opt, 8);
  }

  if (/\b(?:afraid|worry|concern|scared|anxious)\b/i.test(t)) {
    pushUnique(map.concerns, t.slice(0, 120));
    pushUnique(map.unknowns, "what feels at risk");
  }
  if (/\b(?:always|never|everyone|no one)\b/i.test(t)) {
    pushUnique(map.assumptions, "absolute language present");
  }
  if (/\b(?:time|money|energy|capacity|deadline)\b/i.test(t)) {
    pushUnique(map.constraints, t.slice(0, 100));
  }
  if (/\b(?:value|matter|important|fair|aligned)\b/i.test(t)) {
    pushUnique(map.values, t.slice(0, 100));
  }
  if (/\b(?:trade|cost|gain|lose|sacrifice)\b/i.test(t)) {
    pushUnique(map.tradeOffs, t.slice(0, 100));
  }
  if (/\b(?:again|usually|pattern|always do|keep)\b/i.test(t)) {
    pushUnique(map.patterns, "possible repeating pattern");
  }
  if (/\b(?:help|support|team|friend|tool)\b/i.test(t)) {
    pushUnique(map.resources, t.slice(0, 80));
  }

  // Unexplored prompts by archetype
  const exploring = new Set(map.questionsWorthExploring.map((q) => q.toLowerCase()));
  const addExplore = (q: string) => {
    if (!exploring.has(q.toLowerCase())) {
      map.questionsWorthExploring.push(q);
      exploring.add(q.toLowerCase());
    }
  };

  if (map.optionsNamed.length === 0 && map.archetype === "business-decision") {
    addExplore("what options feel real");
  }
  if (map.concerns.length === 0 && map.archetype === "fear-avoidance") {
    addExplore("what the avoidance is protecting");
  }
  if (map.values.length === 0) {
    addExplore("what matters most here");
  }
  if (!map.goal) {
    addExplore("what a good outcome would look like");
  }

  while (map.questionsWorthExploring.length > 10) {
    map.questionsWorthExploring.shift();
  }

  return map;
}

export function markQuestionExplored(
  map: ThinkingMap,
  questionText: string,
): ThinkingMap {
  const next = {
    ...map,
    questionsAnswered: [...map.questionsAnswered],
    questionsWorthExploring: [...map.questionsWorthExploring],
  };
  pushUnique(next.questionsAnswered, questionText, 20);
  const lower = questionText.toLowerCase();
  next.questionsWorthExploring = next.questionsWorthExploring.filter(
    (q) => !lower.includes(q.toLowerCase()) && !q.toLowerCase().includes(lower.slice(0, 24)),
  );
  return next;
}
