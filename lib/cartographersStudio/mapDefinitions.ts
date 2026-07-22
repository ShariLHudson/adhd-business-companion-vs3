/**
 * Canonical Cartography map definitions — single source of truth for
 * wall labels, entry copy, guided steps, routes, and capabilities.
 */

import type { VisualFocusMode } from "@/lib/visualFocus/types";

export type CartographersFramedMapId =
  | "mind-map"
  | "decision-map"
  | "relationship-map"
  | "process-map"
  | "journey-map"
  | "timeline-map"
  | "strategy-map"
  | "project-map"
  | "opportunity-map"
  | "priority-map";

export type CartographyStepDefinition = {
  id: string;
  title: string;
  question: string;
  fieldKey: string;
  optional?: boolean;
  example?: string;
  /** list = comma/newline separated items */
  inputKind?: "text" | "multiline" | "list";
};

export type CartographyMapDefinition = {
  id: CartographersFramedMapId;
  name: string;
  shortDescription: string;
  whenUseful: string;
  outcomeDescription: string;
  wallImage?: string;
  icon?: string;
  route: string;
  visualFocusMode: VisualFocusMode;
  builderType: "mind-map-discovery" | "guided-steps";
  steps: CartographyStepDefinition[];
  resultRenderer: string;
  supportsPrint: boolean;
  supportsDuplicate?: boolean;
  supportsExport?: boolean;
  isActive: boolean;
};

export const CARTOGRAPHY_MAP_DEFINITIONS: readonly CartographyMapDefinition[] = [
  {
    id: "mind-map",
    name: "Mind Map",
    shortDescription: "Organize ideas and discover connections.",
    whenUseful:
      "When thoughts feel scattered and you need to explore without a rigid order.",
    outcomeDescription:
      "A living map with one clear center and branches you can keep editing.",
    route: "cartographers-studio / mind-map",
    visualFocusMode: "mind-map",
    builderType: "mind-map-discovery",
    steps: [
      {
        id: "topic",
        title: "Getting Clear",
        question: "What is the main topic?",
        fieldKey: "topic",
        example: "Product launch",
      },
      {
        id: "everything",
        title: "Adding Details",
        question: "What ideas come to mind? Capture everything.",
        fieldKey: "everything",
        inputKind: "multiline",
        example: "Audience, pricing, channels, worries…",
      },
      {
        id: "outcome",
        title: "Connecting Ideas",
        question: "What would a helpful map help you do?",
        fieldKey: "desiredOutcome",
        optional: true,
        example: "See the whole launch at once",
      },
    ],
    resultRenderer: "radial-mind-map",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "decision-map",
    name: "Decision Map",
    shortDescription: "Compare options before making a choice.",
    whenUseful:
      "When more than one path feels possible and you need to see tradeoffs clearly.",
    outcomeDescription:
      "A visual comparison of options, benefits, concerns, and a preferred direction.",
    route: "cartographers-studio / decision-map",
    visualFocusMode: "decision-tree",
    builderType: "guided-steps",
    steps: [
      {
        id: "decision",
        title: "Getting Clear",
        question: "What decision are you facing?",
        fieldKey: "decision",
        example: "Hire a VA this quarter?",
      },
      {
        id: "options",
        title: "Adding Details",
        question: "What options are on the table?",
        fieldKey: "options",
        inputKind: "list",
        example: "Hire now, wait, outsource project-by-project",
      },
      {
        id: "benefits",
        title: "Adding Details",
        question: "What benefits matter most?",
        fieldKey: "benefits",
        inputKind: "list",
        optional: true,
      },
      {
        id: "concerns",
        title: "Connecting Ideas",
        question: "What concerns or risks do you see?",
        fieldKey: "concerns",
        inputKind: "list",
        optional: true,
      },
      {
        id: "preferred",
        title: "Reviewing",
        question: "Which direction are you leaning toward right now?",
        fieldKey: "preferred",
        optional: true,
      },
    ],
    resultRenderer: "decision-branch",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "relationship-map",
    name: "Relationship Map",
    shortDescription: "Understand how people, ideas, or systems connect.",
    whenUseful:
      "When influence and dependency are hard to hold in a list.",
    outcomeDescription:
      "A network view of who and what connects — with editable links.",
    route: "cartographers-studio / relationship-map",
    visualFocusMode: "relationship-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "center",
        title: "Getting Clear",
        question: "Who or what sits at the center?",
        fieldKey: "center",
        example: "My coaching business",
      },
      {
        id: "entities",
        title: "Adding Details",
        question: "Who or what else is involved?",
        fieldKey: "entities",
        inputKind: "list",
        example: "Clients, partners, content channels",
      },
      {
        id: "connections",
        title: "Connecting Ideas",
        question: "How do they connect or influence each other?",
        fieldKey: "connections",
        inputKind: "multiline",
        optional: true,
      },
      {
        id: "friction",
        title: "Reviewing",
        question: "Where is there tension, gap, or friction?",
        fieldKey: "friction",
        inputKind: "list",
        optional: true,
      },
    ],
    resultRenderer: "vertical-flow",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "process-map",
    name: "Process Map",
    shortDescription: "See steps, bottlenecks, and flow from start to finish.",
    whenUseful: "When a repeatable sequence needs to be visible and improvable.",
    outcomeDescription:
      "An ordered path from start to finish with handoffs and endings.",
    route: "cartographers-studio / process-map",
    visualFocusMode: "process-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "processName",
        title: "Getting Clear",
        question: "What process are we mapping?",
        fieldKey: "processName",
        example: "Client onboarding",
      },
      {
        id: "start",
        title: "Adding Details",
        question: "Where does it begin?",
        fieldKey: "start",
        example: "New inquiry arrives",
      },
      {
        id: "steps",
        title: "Adding Details",
        question: "What are the ordered steps?",
        fieldKey: "steps",
        inputKind: "list",
        example: "Discovery call, proposal, kickoff, delivery",
      },
      {
        id: "decisions",
        title: "Connecting Ideas",
        question: "Where do decisions or branches happen?",
        fieldKey: "decisions",
        inputKind: "list",
        optional: true,
      },
      {
        id: "end",
        title: "Reviewing",
        question: "How does this process end?",
        fieldKey: "end",
        optional: true,
        example: "Follow-up and testimonial ask",
      },
    ],
    resultRenderer: "process-flow",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "journey-map",
    name: "Journey Map",
    shortDescription: "Chart the path from where you are to where you want to go.",
    whenUseful:
      "When the human experience of a path matters — not only the tasks.",
    outcomeDescription:
      "A staged path from current state to destination with turning points.",
    route: "cartographers-studio / journey-map",
    visualFocusMode: "journey-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "start",
        title: "Getting Clear",
        question: "Where are you (or your client) starting?",
        fieldKey: "start",
        example: "Curious but overwhelmed",
      },
      {
        id: "destination",
        title: "Getting Clear",
        question: "Where do you want to arrive?",
        fieldKey: "destination",
        example: "Confident and enrolled",
      },
      {
        id: "stages",
        title: "Adding Details",
        question: "What stages sit along the way?",
        fieldKey: "stages",
        inputKind: "list",
        example: "Discover, consider, decide, begin, thrive",
      },
      {
        id: "turningPoints",
        title: "Connecting Ideas",
        question: "What turning points or milestones matter?",
        fieldKey: "turningPoints",
        inputKind: "list",
        optional: true,
      },
      {
        id: "current",
        title: "Reviewing",
        question: "Where are you on this journey right now?",
        fieldKey: "current",
        optional: true,
      },
    ],
    resultRenderer: "journey-stages",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "timeline-map",
    name: "Timeline",
    shortDescription: "Place events in order and see what comes next.",
    whenUseful: "When sequence and approximate timing matter more than branching.",
    outcomeDescription:
      "An ordered visual path of beginning, milestones, and destination.",
    route: "cartographers-studio / timeline-map",
    visualFocusMode: "timeline-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "subject",
        title: "Getting Clear",
        question: "What is this timeline about?",
        fieldKey: "subject",
        example: "Course launch",
      },
      {
        id: "beginning",
        title: "Adding Details",
        question: "Where does it begin?",
        fieldKey: "beginning",
        example: "Outline complete",
      },
      {
        id: "milestones",
        title: "Adding Details",
        question: "What milestones sit in between?",
        fieldKey: "milestones",
        inputKind: "list",
        example: "Record modules, build sales page, open cart",
      },
      {
        id: "end",
        title: "Connecting Ideas",
        question: "What is the end point?",
        fieldKey: "end",
        example: "Cart closes",
      },
      {
        id: "timing",
        title: "Reviewing",
        question: "Any dates or approximate timing to note?",
        fieldKey: "timing",
        optional: true,
        example: "6–8 weeks",
      },
    ],
    resultRenderer: "timeline",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "strategy-map",
    name: "Strategy Map",
    shortDescription: "Connect vision, priorities, and action into one course.",
    whenUseful:
      "When you know where you want to go and need to build how to get there.",
    outcomeDescription:
      "A visual path linking vision, goals, obstacles, and next actions.",
    route: "cartographers-studio / strategy-map",
    visualFocusMode: "strategy-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "vision",
        title: "Getting Clear",
        question: "What vision are you aiming toward?",
        fieldKey: "vision",
        example: "Grow revenue without burning out",
      },
      {
        id: "goals",
        title: "Adding Details",
        question: "What goals matter most right now?",
        fieldKey: "goals",
        inputKind: "list",
      },
      {
        id: "resources",
        title: "Adding Details",
        question: "What resources or strengths can you use?",
        fieldKey: "resources",
        inputKind: "list",
        optional: true,
      },
      {
        id: "obstacles",
        title: "Connecting Ideas",
        question: "What obstacles are in the way?",
        fieldKey: "obstacles",
        inputKind: "list",
        optional: true,
      },
      {
        id: "priorities",
        title: "Reviewing",
        question: "What are the first priorities?",
        fieldKey: "priorities",
        inputKind: "list",
      },
    ],
    resultRenderer: "radial",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "project-map",
    name: "Project Map",
    shortDescription: "Break a large initiative into phases, deliverables, and tasks.",
    whenUseful:
      "When a project feels overwhelming and you need structure without a task list.",
    outcomeDescription:
      "A visual breakdown of phases and deliverables you can keep editing.",
    route: "cartographers-studio / project-map",
    visualFocusMode: "project-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "project",
        title: "Getting Clear",
        question: "What project are you breaking down?",
        fieldKey: "project",
        example: "Course launch",
      },
      {
        id: "phases",
        title: "Adding Details",
        question: "What are the major phases?",
        fieldKey: "phases",
        inputKind: "list",
        example: "Content, landing page, emails, promotion",
      },
      {
        id: "deliverables",
        title: "Adding Details",
        question: "What key deliverables sit under those phases?",
        fieldKey: "deliverables",
        inputKind: "list",
        optional: true,
      },
      {
        id: "first",
        title: "Reviewing",
        question: "What is the natural first piece to start?",
        fieldKey: "first",
        optional: true,
      },
    ],
    resultRenderer: "vertical-flow",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "opportunity-map",
    name: "Opportunity Map",
    shortDescription: "Explore possibilities, benefits, risks, and first steps.",
    whenUseful:
      "When several possibilities are open and you need to see upside and risk together.",
    outcomeDescription:
      "A visual scan of opportunities with benefits, risks, and first steps.",
    route: "cartographers-studio / opportunity-map",
    visualFocusMode: "opportunity-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "focus",
        title: "Getting Clear",
        question: "What area of opportunity are you exploring?",
        fieldKey: "focus",
        example: "New offer ideas",
      },
      {
        id: "opportunities",
        title: "Adding Details",
        question: "What possibilities do you see?",
        fieldKey: "opportunities",
        inputKind: "list",
      },
      {
        id: "benefits",
        title: "Adding Details",
        question: "What benefits would each unlock?",
        fieldKey: "benefits",
        inputKind: "list",
        optional: true,
      },
      {
        id: "risks",
        title: "Connecting Ideas",
        question: "What risks or costs come with them?",
        fieldKey: "risks",
        inputKind: "list",
        optional: true,
      },
      {
        id: "firstSteps",
        title: "Reviewing",
        question: "What first steps would make one real?",
        fieldKey: "firstSteps",
        inputKind: "list",
        optional: true,
      },
    ],
    resultRenderer: "opportunity-radar",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
  {
    id: "priority-map",
    name: "Priority Map",
    shortDescription: "Sort what matters by impact, urgency, and effort.",
    whenUseful:
      "When everything feels important and you need a calmer focus choice.",
    outcomeDescription:
      "An ordered or quadrant-style view of priorities with a selected focus.",
    route: "cartographers-studio / priority-map",
    visualFocusMode: "priority-map",
    builderType: "guided-steps",
    steps: [
      {
        id: "context",
        title: "Getting Clear",
        question: "What are you prioritizing among?",
        fieldKey: "context",
        example: "This month’s work",
      },
      {
        id: "items",
        title: "Adding Details",
        question: "What possible priorities are on the list?",
        fieldKey: "items",
        inputKind: "list",
      },
      {
        id: "impact",
        title: "Adding Details",
        question: "Which ones have the highest impact?",
        fieldKey: "impact",
        inputKind: "list",
        optional: true,
      },
      {
        id: "urgency",
        title: "Connecting Ideas",
        question: "Which ones are most urgent?",
        fieldKey: "urgency",
        inputKind: "list",
        optional: true,
      },
      {
        id: "focus",
        title: "Reviewing",
        question: "What do you want as the selected focus?",
        fieldKey: "focus",
        optional: true,
      },
    ],
    resultRenderer: "priority-matrix",
    supportsPrint: true,
    supportsDuplicate: true,
    isActive: true,
  },
] as const;

const BY_ID = Object.fromEntries(
  CARTOGRAPHY_MAP_DEFINITIONS.map((d) => [d.id, d]),
) as Record<CartographersFramedMapId, CartographyMapDefinition>;

const BY_MODE = Object.fromEntries(
  CARTOGRAPHY_MAP_DEFINITIONS.map((d) => [d.visualFocusMode, d]),
) as Partial<Record<VisualFocusMode, CartographyMapDefinition>>;

export function getCartographyMapDefinition(
  id: CartographersFramedMapId,
): CartographyMapDefinition {
  return BY_ID[id];
}

export function getCartographyMapDefinitionByMode(
  mode: VisualFocusMode,
): CartographyMapDefinition | undefined {
  return BY_MODE[mode];
}

export function activeCartographyMaps(): CartographyMapDefinition[] {
  return CARTOGRAPHY_MAP_DEFINITIONS.filter((d) => d.isActive);
}

export function visualFocusModeForWallMap(
  id: CartographersFramedMapId,
): VisualFocusMode {
  return BY_ID[id].visualFocusMode;
}

export function wallMapIdForVisualFocusMode(
  mode: VisualFocusMode,
): CartographersFramedMapId | null {
  return BY_MODE[mode]?.id ?? null;
}

/** Canonical display name — never invent a second label. */
export function canonicalMapName(
  idOrMode: CartographersFramedMapId | VisualFocusMode,
): string {
  if (idOrMode in BY_ID) {
    return BY_ID[idOrMode as CartographersFramedMapId].name;
  }
  return BY_MODE[idOrMode as VisualFocusMode]?.name ?? String(idOrMode);
}

export function assertWallMapNamingConsistent(): boolean {
  return CARTOGRAPHY_MAP_DEFINITIONS.every((d) => {
    return d.name.trim().length > 0 && d.isActive === true;
  });
}
