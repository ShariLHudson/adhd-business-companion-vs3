/**
 * Estate Brain — adapters so legacy modules read one source of truth.
 */

import type { EstateExperienceDefinition } from "@/lib/estateExperiences/types";
import type { EstateRegistryEntry } from "@/lib/estateIntelligence/types";
import {
  allEstateBrainEntries,
  estateBrainExperiences,
} from "./knowledgeRegistry";
import type { EstateKnowledgeEntry } from "./types";

/** Map brain entry → Estate Experience definition */
export function brainEntryToExperienceDefinition(
  entry: EstateKnowledgeEntry,
): EstateExperienceDefinition {
  return {
    id: entry.experienceId,
    name: entry.name,
    emoji: experienceEmoji(entry.experienceId),
    arrivalPrompt: entry.defaultGreeting,
    purpose: entry.purpose,
    defaultSpaceId: entry.spaceId,
    arrivalSuggestions: entry.suggestedActivities,
    tools: entry.tools,
  };
}

function experienceEmoji(id: string): string {
  const map: Record<string, string> = {
    create: "🌟",
    momentum: "🚀",
    focus: "🎯",
    restore: "🌿",
    think: "🧠",
    journal: "📖",
    grow: "🏆",
    play: "🎨",
    business: "🤝",
    explore: "🌍",
  };
  return map[id] ?? "✨";
}

/** Experiences derived from Estate Brain */
export function experiencesFromBrain(): EstateExperienceDefinition[] {
  return estateBrainExperiences().map(brainEntryToExperienceDefinition);
}

/** Bridge to Estate Intelligence matcher index */
export function brainEntryToRegistryEntry(
  entry: EstateKnowledgeEntry,
): EstateRegistryEntry {
  return {
    id: entry.kind === "experience" ? entry.spaceId : entry.id,
    name: entry.name,
    category: "room",
    purpose: entry.description,
    memberDescription: entry.purpose,
    primarySection: entry.primarySection,
    keywords: [...entry.triggers, ...entry.aliases],
    phrases: entry.triggers.filter((t) => t.includes(" ")),
    emotionalStates: entry.userNeeds?.filter((n) =>
      ["overwhelmed", "anxious", "stressed"].includes(n),
    ),
    userNeeds: mapUserNeeds(entry.userNeeds),
    problemsSolved: [...entry.capabilities],
    outcomes: [...entry.suggestedActivities],
    relatedEntryIds: [...entry.relatedSpaceIds],
    status: "live",
  };
}

function mapUserNeeds(
  needs: readonly string[] | undefined,
): EstateRegistryEntry["userNeeds"] {
  if (!needs?.length) return undefined;
  const allowed = new Set([
    "calm",
    "momentum",
    "clarity",
    "decide",
    "research",
    "learn",
    "create",
    "rest",
    "organize",
    "reflect",
    "restore",
  ]);
  const mapped: NonNullable<EstateRegistryEntry["userNeeds"]> = [];
  for (const n of needs) {
    if (n === "overwhelmed" || n === "anxious" || n === "stressed") {
      if (!mapped.includes("restore")) mapped.push("restore");
      if (!mapped.includes("calm")) mapped.push("calm");
    } else if (n === "business") {
      if (!mapped.includes("momentum")) mapped.push("momentum");
    } else if (n === "focus") {
      if (!mapped.includes("clarity")) mapped.push("clarity");
    } else if (allowed.has(n)) {
      mapped.push(n as NonNullable<EstateRegistryEntry["userNeeds"]>[number]);
    }
  }
  return mapped.length ? mapped : undefined;
}

/** Estate Intelligence entries derived from Estate Brain */
export function registryEntriesFromBrain(): EstateRegistryEntry[] {
  return allEstateBrainEntries().map((e) => brainEntryToRegistryEntry(e));
}
