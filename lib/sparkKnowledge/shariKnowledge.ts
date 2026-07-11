/**
 * Shari Knowledge Registry — unified index over all Estate knowledge sources.
 */

import {
  allEstateBrainEntries,
  ESTATE_CAPABILITIES,
  ESTATE_EXPERTS,
} from "@/lib/estateBrain";
import type { EstateKnowledgeEntry } from "@/lib/estateBrain/types";
import {
  getCanonicalEstatePlaceById,
  matchCanonicalPlaceInText,
} from "@/lib/estate/canonicalEstateRegistry";
import { estateRoomKnowledgeHintForChat } from "@/lib/estateKnowledge";
import { buildCanonResponseHint, retrieveCanonContext } from "@/lib/canonContext";
import { CREATION_KNOWLEDGE } from "./creationKnowledge";
import { THINKING_FRAMEWORKS } from "./thinkingFrameworkRegistry";
import type {
  SparkKnowledgeEntry,
  SparkKnowledgeExplainable,
  SparkKnowledgeKind,
  SparkKnowledgeSearchMatch,
  SparkKnowledgeSearchResult,
  ShariKnowledgeHintOptions,
} from "./types";

function normalize(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function brainToKnowledge(entry: EstateKnowledgeEntry): SparkKnowledgeEntry {
  return {
    id: entry.id,
    kind: entry.kind,
    name: entry.name,
    purpose: entry.purpose,
    description: entry.description,
    triggers: entry.triggers,
    aliases: entry.aliases,
    sourceRegistry: "estateBrain/knowledgeRegistry",
    explain: {
      what: entry.description,
      why: entry.purpose,
      when: `When a member needs ${entry.purpose.toLowerCase()}`,
      who: "Members whose goals match this experience or space.",
      how: `Conversation first — ${entry.defaultGreeting}`,
      related: [...entry.relatedSpaceIds, ...entry.nextSuggestions],
      nextSteps: entry.suggestedActivities,
    },
  };
}

function capabilityToKnowledge(
  cap: (typeof ESTATE_CAPABILITIES)[number],
): SparkKnowledgeEntry {
  return {
    id: cap.id,
    kind: "capability",
    name: cap.name,
    purpose: `Fulfill ${cap.name.toLowerCase()} needs.`,
    description: `Routes to ${cap.experienceId} — ${cap.spaceId}.`,
    triggers: cap.triggers,
    aliases: [],
    sourceRegistry: "estateBrain/capabilityRegistry",
    explain: {
      what: cap.name,
      why: `Spark can ${cap.name.toLowerCase()} without the member hunting menus.`,
      when: `When triggers match: ${cap.triggers.slice(0, 3).join(", ")}`,
      who: "Any member with this intent.",
      how: "Invisible routing — expert selected automatically.",
      related: cap.expertIds,
      nextSteps: [cap.spaceId],
    },
  };
}

function expertToKnowledge(
  expert: (typeof ESTATE_EXPERTS)[number],
): SparkKnowledgeEntry {
  return {
    id: expert.id,
    kind: "expert",
    name: expert.name,
    purpose: `Internal ${expert.name.toLowerCase()} expertise.`,
    description: expert.specialties.join(", "),
    triggers: expert.triggers,
    aliases: [],
    sourceRegistry: "estateBrain/expertRegistry",
    explain: {
      what: expert.name,
      why: "Members never select experts — Shari assembles quietly.",
      when: `When work touches ${expert.specialties.slice(0, 2).join(" or ")}.`,
      who: "Invisible to members.",
      how: "Integrated into responses and preparation.",
      related: expert.categories,
      nextSteps: [],
    },
  };
}

let cachedIndex: SparkKnowledgeEntry[] | null = null;

/** All knowledge entries from every source registry */
export function allSparkKnowledgeEntries(): readonly SparkKnowledgeEntry[] {
  if (cachedIndex) return cachedIndex;
  cachedIndex = [
    ...allEstateBrainEntries().map(brainToKnowledge),
    ...ESTATE_CAPABILITIES.map(capabilityToKnowledge),
    ...THINKING_FRAMEWORKS,
    ...CREATION_KNOWLEDGE,
    ...ESTATE_EXPERTS.map(expertToKnowledge),
  ];
  return cachedIndex;
}

export function sparkKnowledgeById(
  id: string,
): SparkKnowledgeEntry | undefined {
  return allSparkKnowledgeEntries().find((e) => e.id === id);
}

export function sparkKnowledgeByKind(
  kind: SparkKnowledgeKind,
): SparkKnowledgeEntry[] {
  return allSparkKnowledgeEntries().filter((e) => e.kind === kind);
}

function scoreEntry(
  query: string,
  entry: SparkKnowledgeEntry,
): SparkKnowledgeSearchMatch | null {
  const q = normalize(query);
  let score = 0;
  const reasons: string[] = [];

  if (normalize(entry.name) === q) {
    score += 50;
    reasons.push("exact name");
  }
  if (q.includes(normalize(entry.name))) {
    score += 30;
    reasons.push("name in query");
  }

  for (const trigger of entry.triggers) {
    const t = normalize(trigger);
    if (q.includes(t)) {
      score += t.split(" ").length > 1 ? 28 : 18;
      reasons.push(`trigger: ${trigger}`);
    }
  }

  for (const alias of entry.aliases) {
    if (q.includes(normalize(alias))) {
      score += 22;
      reasons.push(`alias: ${alias}`);
    }
  }

  if (score === 0) return null;
  return { entry, score, reasons };
}

export function searchSparkKnowledge(query: string): SparkKnowledgeSearchResult {
  const matches: SparkKnowledgeSearchMatch[] = [];
  for (const entry of allSparkKnowledgeEntries()) {
    const match = scoreEntry(query, entry);
    if (match) matches.push(match);
  }
  matches.sort((a, b) => b.score - a.score);
  return {
    query,
    matches,
    best: matches[0] ?? null,
  };
}

export function explainSparkKnowledge(
  id: string,
): SparkKnowledgeExplainable | null {
  return sparkKnowledgeById(id)?.explain ?? null;
}

/** LLM hint block — Shari's permanent Estate knowledge mandate */
export function shariKnowledgeHintForChat(
  options?: ShariKnowledgeHintOptions,
): string | null {
  const parts: string[] = [];
  const userText = options?.userText?.trim();

  if (userText) {
    const canon = retrieveCanonContext({ userText });
    if (canon.topics.length > 0) {
      parts.push(buildCanonResponseHint(userText));
    }

    const search = searchSparkKnowledge(userText);
    if (search.best && search.best.score >= 18) {
      const { entry, reasons } = search.best;
      parts.push(
        "SHARI KNOWLEDGE REGISTRY (mandatory — speak from this, do not invent):",
        `Matched: ${entry.name} (${entry.kind}) — ${reasons.join(", ")}.`,
        `What: ${entry.explain.what}`,
        `Why: ${entry.explain.why}`,
        `When to recommend: ${entry.explain.when}`,
        `How: ${entry.explain.how}`,
        entry.explain.nextSteps.length
          ? `Natural next: ${entry.explain.nextSteps.slice(0, 2).join(" · ")}`
          : "",
        "Tell the story conversationally — as someone who lives here, not a help article.",
      );
    }

    const place = matchCanonicalPlaceInText(userText);
    if (place) {
      const roomHint = estateRoomKnowledgeHintForChat(place.id);
      if (roomHint) {
        parts.push(roomHint);
      } else {
        const related = place.relatedPlaces
          .slice(0, 2)
          .map((id) => getCanonicalEstatePlaceById(id)?.officialName)
          .filter(Boolean);
        parts.push(
          "",
          `ESTATE PLACE — ${place.officialName}:`,
          place.primaryFeeling,
          place.permanentObjects.length
            ? `Atmosphere: ${place.permanentObjects.join(", ")}.`
            : "",
          related.length ? `Nearby feeling: ${related.join(", ")}.` : "",
          "Speak warmly about this place — never read a brochure.",
        );
      }
    }
  }

  if (options?.matchedEntryId) {
    const entry = sparkKnowledgeById(options.matchedEntryId);
    if (entry && !parts.some((p) => p.includes(entry.name))) {
      parts.push(
        `Active knowledge: ${entry.name} — ${entry.purpose}`,
        entry.description,
      );
    }
  }

  const filtered = parts.filter(Boolean);
  return filtered.length > 0 ? filtered.join("\n") : null;
}

export function estateGuideHint(): string {
  return [
    "SHARI ESTATE GUIDE MODE:",
    "If Spark Estate can do it, Shari knows it.",
    "Explain what · why · when · who · how · related · what comes next.",
    "Never a menu dump. One warm recommendation at most.",
    "Members ask — Shari teaches, recommends, researches, or guides.",
  ].join("\n");
}
