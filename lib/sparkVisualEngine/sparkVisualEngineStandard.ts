/**
 * Spark Visual Engine Standard — runtime mirror of Architecture Library #184.
 *
 * Visual Thinking is a capability, not a destination.
 * Callable from any room via Universal Access (#183).
 *
 * @see docs/estate/recognition/library/184_SPARK_VISUAL_ENGINE_STANDARD.md
 */

import type { VisualThinkingViewId } from "@/lib/visualThinkingStudio";

export const SPARK_VISUAL_ENGINE_LAW =
  "Visual Thinking is a capability, not a destination. The Visual Engine must be callable from anywhere." as const;

/** Member-facing language preferred over internal product names. */
export const SPARK_VISUAL_ENGINE_MEMBER_PHRASES = [
  "Visualize This",
  "Map This Out",
  "Show Me Visually",
  "Create a Mind Map",
  "Create a Workflow",
  "Show the Connections",
] as const;

/** Canonical Visual Engine views (#184). */
export type SparkVisualEngineViewId =
  | "thought-map"
  | "mind-map"
  | "project-map"
  | "process-map"
  | "relationship-map"
  | "timeline"
  | "priority-view"
  | "decision-view"
  | "possibility-view"
  | "journey-view";

export type SparkVisualEngineViewDef = {
  id: SparkVisualEngineViewId;
  title: string;
  /** Maps onto existing Visual Thinking Studio view ids. */
  studioViewId: VisualThinkingViewId;
  bestFor: string;
  aliases: RegExp[];
};

export const SPARK_VISUAL_ENGINE_VIEWS: readonly SparkVisualEngineViewDef[] = [
  {
    id: "thought-map",
    title: "Thought Map",
    studioViewId: "brain-dump-map",
    bestFor: "raw thoughts, brain dumps, and idea clusters",
    aliases: [
      /\bthought\s*maps?\b/i,
      /\bbrain\s*dump\s*maps?\b/i,
      /\bidea\s*clusters?\b/i,
    ],
  },
  {
    id: "mind-map",
    title: "Mind Map",
    studioViewId: "mind-map",
    bestFor: "concepts, topics, and branching ideas",
    aliases: [
      /\bmind\s*maps?\b/i,
      /\bmindmaps?\b/i,
      /\bmind\s*mapping\b/i,
      /\bidea\s*maps?\b/i,
      /\bbrain\s*maps?\b/i,
      /\bconcept\s*maps?\b/i,
      /\btopic\s*maps?\b/i,
    ],
  },
  {
    id: "project-map",
    title: "Project Map",
    studioViewId: "project-map",
    bestFor: "goals, milestones, tasks, and resources",
    aliases: [/\bproject\s*maps?\b/i, /\bvisualize(?:\s+this)?\s+project\b/i],
  },
  {
    id: "process-map",
    title: "Process Map",
    studioViewId: "process-flow",
    bestFor: "workflows, systems, SOPs, and step-by-step operations",
    aliases: [
      /\bprocess\s*maps?\b/i,
      /\bworkflows?\b/i,
      /\bflow\s*charts?\b/i,
      /\bSOPs?\b/i,
      /\bsystem\s*maps?\b/i,
      /\bbusiness\s+process(?:es)?\b/i,
      /\bstep[-\s]?by[-\s]?step\s*maps?\b/i,
    ],
  },
  {
    id: "relationship-map",
    title: "Relationship Map",
    studioViewId: "business-ecosystem-map",
    bestFor: "connections between people, ideas, projects, themes, or systems",
    aliases: [
      /\brelationship\s*maps?\b/i,
      /\bshow(?:\s+the)?\s+connections?\b/i,
      /\bhow(?:\s+these)?\s+connect\b/i,
      /\bnetwork\s*maps?\b/i,
      /\bconnection\s*maps?\b/i,
    ],
  },
  {
    id: "timeline",
    title: "Timeline",
    studioViewId: "timeline",
    bestFor: "dates, sequences, plans, phases, and order of events",
    aliases: [
      /\btimelines?\b/i,
      /\broadmaps?\b/i,
      /\bsequence\b/i,
      /\border this\b/i,
      /\bphases?\b/i,
      /\bplan over time\b/i,
      /\bshow this as a timeline\b/i,
    ],
  },
  {
    id: "priority-view",
    title: "Priority View",
    studioViewId: "priority-matrix",
    bestFor: "urgency, importance, quick wins, energy, and effort",
    aliases: [
      /\bpriority\s*(?:view|matrix|map)s?\b/i,
      /\bprioritize(?:\s+this)?\b/i,
    ],
  },
  {
    id: "decision-view",
    title: "Decision View",
    studioViewId: "decision-tree",
    bestFor: "options, pros, cons, risks, unknowns, and next steps",
    aliases: [
      /\bdecision\s*(?:tree|map|view)s?\b/i,
      /\bcompare options\b/i,
      /\bpros and cons\b/i,
      /\bmap the choices\b/i,
    ],
  },
  {
    id: "possibility-view",
    title: "Possibility View",
    studioViewId: "idea-cluster-map",
    bestFor: "expansion, brainstorming, creative options, and future paths",
    aliases: [
      /\bpossibility\s*(?:view|map)s?\b/i,
      /\bpossibilities\b/i,
      /\bexpand this\b/i,
      /\bexplore ideas\b/i,
      /\bshow opportunities\b/i,
      /\bwhat could this become\b/i,
    ],
  },
  {
    id: "journey-view",
    title: "Journey View",
    studioViewId: "customer-journey-map",
    bestFor: "customer journeys, member journeys, learning paths, and transformation paths",
    aliases: [
      /\bjourney\s*(?:view|map)s?\b/i,
      /\bcustomer journeys?\b/i,
      /\bmember journeys?\b/i,
      /\blearning paths?\b/i,
    ],
  },
] as const;

export const SPARK_VISUAL_ENGINE_SUGGEST_LINE =
  "This might be easier to see visually. Would you like me to map it out?" as const;

/**
 * Detect an explicit Visual Engine view request (#184).
 * Soft brainstorm chatter without a visual/map verb does not match Possibility View.
 */
export function detectSparkVisualEngineViewRequest(
  text: string,
): SparkVisualEngineViewDef | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  /**
   * Real visual verbs only — bare "map" inside "mind map" / product "launch"
   * must not count as an explicit view request (#184).
   */
  const explicitVisualVerb =
    /\b(?:create|make|build|show|open|visualize|draw)\b/i.test(trimmed) ||
    /\bmap(?:\s+(?:this|it|out)|ping)\b/i.test(trimmed);

  for (const view of SPARK_VISUAL_ENGINE_VIEWS) {
    if (!view.aliases.some((re) => re.test(trimmed))) continue;
    /** Soft noun mentions without a visual verb are not navigation (#184). */
    if (!explicitVisualVerb) continue;
    /** Timeline "schedule" alone is calendar territory — require visual framing. */
    if (
      view.id === "timeline" &&
      /\bschedule\b/i.test(trimmed) &&
      !/\b(?:timeline|roadmap|sequence|phases|visually|map)\b/i.test(trimmed)
    ) {
      continue;
    }
    return view;
  }

  return null;
}

export function sparkVisualEngineStudioViewId(
  text: string,
): VisualThinkingViewId | null {
  return detectSparkVisualEngineViewRequest(text)?.studioViewId ?? null;
}
