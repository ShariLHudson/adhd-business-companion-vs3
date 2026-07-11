/**
 * Visual Discovery Interview Library (242).
 * Map-specific discovery goals — Mind Map is the live MVP interview.
 * Other maps are defined for Atlas / future slices; engine stays shared.
 */

export type VisualDiscoveryMapKind =
  | "mind-map"
  | "decision-map"
  | "strategy-map"
  | "timeline"
  | "relationship-map";

export type VisualDiscoveryInterviewSpec = {
  mapKind: VisualDiscoveryMapKind;
  discover: readonly string[];
  exampleQuestions: readonly string[];
};

/** Binding: every visual method has its own interview — never one interview for all maps. */
export const VISUAL_DISCOVERY_INTERVIEW_LIBRARY: Record<
  VisualDiscoveryMapKind,
  VisualDiscoveryInterviewSpec
> = {
  "mind-map": {
    mapKind: "mind-map",
    discover: [
      "Main topic",
      "Major ideas",
      "Natural groups",
      "Relationships",
      "Desired outcome",
    ],
    exampleQuestions: [
      "What are we mapping?",
      "What ideas immediately come to mind?",
      "Is there an end goal?",
    ],
  },
  "decision-map": {
    mapKind: "decision-map",
    discover: [
      "Decision",
      "Options",
      "Constraints",
      "Risks",
      "Success criteria",
    ],
    exampleQuestions: [
      "What decision are you facing?",
      "What options are on the table?",
      "What would success look like?",
    ],
  },
  "strategy-map": {
    mapKind: "strategy-map",
    discover: ["Vision", "Goals", "Resources", "Obstacles", "Priorities"],
    exampleQuestions: [
      "What vision are we aiming toward?",
      "What goals matter most right now?",
      "What obstacles are in the way?",
    ],
  },
  timeline: {
    mapKind: "timeline",
    discover: ["Beginning", "End", "Milestones", "Dependencies"],
    exampleQuestions: [
      "Where does this timeline begin?",
      "What is the end point?",
      "What milestones sit in between?",
    ],
  },
  "relationship-map": {
    mapKind: "relationship-map",
    discover: [
      "People",
      "Systems",
      "Connections",
      "Influence",
      "Communication",
      "Friction",
    ],
    exampleQuestions: [
      "Who or what is involved?",
      "How do they connect?",
      "Where is the friction?",
    ],
  },
};

export function getVisualDiscoveryInterviewSpec(
  mapKind: VisualDiscoveryMapKind,
): VisualDiscoveryInterviewSpec {
  return VISUAL_DISCOVERY_INTERVIEW_LIBRARY[mapKind];
}

/** Universal pre-question memory checks (242 / 243 Pattern 3). */
export const VISUAL_DISCOVERY_MEMORY_CHECKS = [
  "conversation",
  "clear-my-mind",
  "journal",
  "projects",
  "uploaded-files",
  "previous-maps",
] as const;

export type VisualDiscoveryMemoryCheck =
  (typeof VISUAL_DISCOVERY_MEMORY_CHECKS)[number];
