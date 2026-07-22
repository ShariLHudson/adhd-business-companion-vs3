/**
 * Build a researched map draft for any map type.
 *
 * Combines the member's known facts (if any) with a map-type framework and the
 * chosen detail level, and records sources + per-branch confidence so nothing
 * is silently presented as fact.
 */

import type { VisualFocusNode } from "../types";
import { buildMapFramework } from "./mapTypeFrameworks";
import type {
  BuildResearchedDraftInput,
  MapNodeResearch,
  ResearchAssistedMapMeta,
  ResearchedDraftResult,
  ResearchFreshness,
  ResearchSource,
} from "./types";

let nodeCounter = 0;
function newNodeId(): string {
  nodeCounter += 1;
  return `rn-${Date.now().toString(36)}-${nodeCounter}-${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function node(label: string, children: VisualFocusNode[] = []): VisualFocusNode {
  return { id: newNodeId(), label: label.trim() || "Untitled", children };
}

function cleanTopic(topic: string, fallback: string): string {
  const t = topic.trim();
  if (!t) return fallback;
  // Title-case only the first letter; keep member's wording otherwise.
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** Spark's built-in knowledge, recorded honestly (not a fabricated citation). */
function sparkKnowledgeSource(now: string): ResearchSource {
  return {
    id: "spark-estate-knowledge",
    title: "Spark Estate built-in guidance",
    organization: "Spark Estate",
    accessedAt: now,
    authorityLevel: "authoritative",
  };
}

function freshnessFor(timeSensitive: boolean): {
  freshness: ResearchFreshness;
  refreshRecommendation?: string;
} {
  if (timeSensitive) {
    return {
      freshness: "time-sensitive",
      refreshRecommendation:
        "Tools, settings, or timing may change — worth confirming the current details before you rely on this.",
    };
  }
  return { freshness: "review-periodically" };
}

/**
 * Build a first useful researched map. Never blocks on complete knowledge.
 */
export function buildResearchAssistedDraft(
  input: BuildResearchedDraftInput,
): ResearchedDraftResult {
  const { mapType, detailLevel } = input;
  const now = new Date().toISOString();
  const topic = cleanTopic(input.topic, fallbackTitleForMode(mapType));
  const framework = buildMapFramework(mapType, input.topic, detailLevel);

  const nodeResearch: MapNodeResearch[] = [];
  const researchedFacts: string[] = [];

  const source = sparkKnowledgeSource(now);

  const sectionNodes: VisualFocusNode[] = framework.sections.map((section) => {
    const children = section.children.map((c) => node(c));
    const sectionNode = node(section.label, children);
    nodeResearch.push({
      nodeId: sectionNode.id,
      sourceIds: [source.id],
      confidence: section.confidence,
      researchedAt: now,
    });
    researchedFacts.push(section.label);
    return sectionNode;
  });

  const root = node(topic, sectionNodes);
  // The root itself is member-anchored, not researched.

  const { freshness, refreshRecommendation } = freshnessFor(framework.timeSensitive);

  const research: ResearchAssistedMapMeta = {
    researchAssisted: true,
    detailLevel,
    topic: input.topic.trim() || topic,
    audience: input.audience,
    userKnownFacts: (input.knownFacts ?? []).map((f) => f.trim()).filter(Boolean),
    researchedFacts,
    assumptions: framework.assumptions,
    unresolvedQuestions: framework.unresolvedQuestions,
    sources: [source],
    nodeResearch,
    researchedAt: now,
    freshness,
    refreshRecommendation,
  };

  return {
    title: topic,
    root,
    summaryHint: summaryHintForMode(mapType, detailLevel),
    research,
  };
}

function summaryHintForMode(
  mode: BuildResearchedDraftInput["mapType"],
  detail: BuildResearchedDraftInput["detailLevel"],
): string {
  const depth =
    detail === "overview"
      ? "A simple overview"
      : detail === "detailed"
        ? "A detailed version"
        : "A practical working version";
  switch (mode) {
    case "process-map":
      return `${depth} of the steps, in order.`;
    case "decision-tree":
      return `${depth} of the options and tradeoffs.`;
    case "journey-map":
      return `${depth} of the stages along the way.`;
    case "timeline-map":
      return `${depth} of the milestones over time.`;
    case "strategy-map":
      return `${depth} linking the goal to how you get there.`;
    case "opportunity-map":
      return `${depth} of possibilities and what to test.`;
    case "system-map":
      return `${depth} of how the parts connect.`;
    case "priority-map":
      return `${depth} of what matters and why.`;
    case "relationship-map":
      return `${depth} of who and what connects.`;
    case "mind-map":
    default:
      return `${depth} of the main ideas.`;
  }
}

function fallbackTitleForMode(
  mode: BuildResearchedDraftInput["mapType"],
): string {
  return mode
    .replace(/-tree$/, " map")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
