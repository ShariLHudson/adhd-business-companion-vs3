/**
 * Creation knowledge — document types from Universal Creation plugins.
 */

import { UNIVERSAL_DOCUMENT_PLUGINS } from "@/lib/universalCreation/documentRegistry";
import type { SparkKnowledgeEntry } from "./types";

export const UNIVERSAL_DOCUMENT_LABELS = UNIVERSAL_DOCUMENT_PLUGINS.map(
  (p) => p.label,
);

function creationEntry(
  id: string,
  label: string,
  purpose: string,
  description: string,
  triggers: string[],
  when: string,
  who: string,
  related: string[],
  nextSteps: string[],
): SparkKnowledgeEntry {
  return {
    id: `create-${id}`,
    kind: "creation",
    name: label,
    purpose,
    description,
    triggers,
    aliases: [],
    sourceRegistry: "universalCreation/documentRegistry",
    explain: {
      what: description,
      why: purpose,
      when,
      who,
      how: "Discovery conversation first — then we build together in Create.",
      related,
      nextSteps,
    },
  };
}

export const CREATION_KNOWLEDGE: readonly SparkKnowledgeEntry[] =
  UNIVERSAL_DOCUMENT_PLUGINS.filter((p) => p.id !== "document").map((p) =>
    creationEntry(
      p.id,
      p.label,
      `Create a ${p.label.toLowerCase()} that fits your business.`,
      p.intro.split("\n")[0] ?? p.label,
      p.detectPatterns.map((re) => re.source),
      "When you need to ship this type of work.",
      "Entrepreneurs building assets for clients, team, or audience.",
      p.enhancements.slice(0, 2).map((e) => e.label),
      p.completionActions.slice(0, 2).map((a) => a.label),
    ),
  );

export function creationKnowledgeById(
  id: string,
): SparkKnowledgeEntry | undefined {
  return CREATION_KNOWLEDGE.find((c) => c.id === id || c.id === `create-${id}`);
}
