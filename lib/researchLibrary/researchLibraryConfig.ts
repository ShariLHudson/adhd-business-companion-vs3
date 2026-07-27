/**
 * Research Library configuration for the SHARED research engine.
 *
 * This is the Research Library's destination-specific config: prompts, labels,
 * and the framework guidance it feeds the engine. The shared engine
 * (`runResearch`) stays destination-neutral — it receives a systemPrompt +
 * built_in_guidance from here and knows nothing about the Research Library.
 * A future Chamber/Board member would provide its OWN config the same way
 * (member persona/domain/frameworks → systemPrompt + built_in_guidance), so the
 * engine can serve any destination without change.
 *
 * Topic packs become framework guidance (proven models, diagnostic questions,
 * practical principles), surfaced as `built_in_guidance` — never as live
 * research or citations.
 */

import { pickTopicPack, type TopicPack } from "@/lib/researchLibrary/conversation";
import type { BuiltInGuidanceItem } from "@/lib/research/researchEngine";
import type { ResearchFindingKind } from "@/lib/research/types";

/** Labels for the shared research panel in the general Research Library context. */
export const RESEARCH_LIBRARY_RESEARCH_LABELS = {
  toggleLabel: "Research this with Shari",
  helperText:
    "Explore a question with Shari using established frameworks and practical guidance. Add anything useful.",
  addLabel: "Add to This Research",
  addAllLabel: "Add Everything Useful",
  addedLabel: "Added ✓",
} as const;

export type ResearchLibraryPromptInput = {
  topic: string;
  /** Optional approved user/business context to ground the exploration. */
  priorContext?: string;
};

/**
 * The general-topic Explore prompt for the Research Library. Instructs honest,
 * framework-driven guidance and explicitly forbids fabricating sources — the
 * engine's Explore mode never claims live research.
 */
export function buildResearchLibrarySystemPrompt(
  input: ResearchLibraryPromptInput,
): string {
  return [
    "You are Shari, helping a member of Spark Estate explore a question or topic.",
    "",
    `The topic: "${input.topic.trim()}"`,
    input.priorContext?.trim()
      ? `What Spark already knows that may be relevant:\n${input.priorContext.trim()}`
      : "",
    "",
    "Help them think it through using established frameworks, proven models,",
    "diagnostic questions, and practical principles. Organize what they already",
    "know, surface useful angles, and name the open questions.",
    "",
    "Honesty rules (strict):",
    "- This is conversation and guidance from stable knowledge — NOT live internet research, and NOT verified source material.",
    "- Do NOT invent citations, URLs, publishers, publication dates, or claim",
    "  current/real-time data.",
    "- If genuinely current or sourced information is needed, say so plainly and",
    "  suggest Research with Sources — never fabricate it.",
    "Keep replies warm, concrete, and in the Spark Estate voice.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** The hidden first request that seeds an Explore thread from a topic. */
export function buildResearchLibraryAutoPrompt(topic: string): string {
  return (
    `Help me explore this: "${topic.trim()}". Share the most useful frameworks, ` +
    `proven models, angles, and open questions to think it through. Do not invent sources.`
  );
}

function slug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

// Research Library finding kinds are a subset of the shared finding kinds.
function guidanceKind(
  kind: TopicPack["findings"][number]["kind"],
): ResearchFindingKind {
  return kind as ResearchFindingKind;
}

/**
 * Built-in framework guidance for a topic, as `built_in_guidance` items for the
 * shared engine. Returns [] when no framework pack matches — guidance is
 * supplemental, never presented as sourced/current research.
 */
export function pickResearchLibraryGuidance(topic: string): BuiltInGuidanceItem[] {
  const pack = pickTopicPack(topic);
  if (!pack) return [];
  return pack.findings.map((finding, index) => ({
    id: `rl-guidance-${slug(finding.title)}-${index}`,
    title: finding.title,
    content: finding.content,
    kind: guidanceKind(finding.kind),
  }));
}
