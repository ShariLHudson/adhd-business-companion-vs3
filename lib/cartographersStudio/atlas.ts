/**
 * Cartographer's Atlas — teaching center for visual methods.
 * Teaches visual thinking; Create This Map launches the same Discovery path as frames.
 */

import type { CartographersFramedMapId } from "./framedMaps";

export type CartographersAtlasEntry = {
  id: CartographersFramedMapId;
  name: string;
  whatItIs: string;
  whyItWorks: string;
  bestUsedFor: string;
  whenNotToUse: string;
  example: string;
  relatedMethods: string[];
  /** Only Mind Map is creatable in the MVP vertical slice. */
  canCreate: boolean;
  hoverBlurb: string;
};

export const CARTOGRAPHERS_ATLAS_ENTRIES: readonly CartographersAtlasEntry[] = [
  {
    id: "mind-map",
    name: "Mind Map",
    hoverBlurb: "Organize ideas and discover connections.",
    whatItIs:
      "A living map with one clear center and branches that grow as your thinking grows.",
    whyItWorks:
      "It matches how ideas arrive — in clusters and sparks — before you force them into a list or outline.",
    bestUsedFor:
      "Brainstorming, clarifying a topic, gathering everything related to a project, or seeing connections you would miss in a linear note.",
    whenNotToUse:
      "When you already need a ranked decision, a step-by-step process, or a dated schedule — those want Decision, Process, or Timeline maps.",
    example:
      "Center: “Product launch.” Branches: audience, offer, channels, timeline worries, open questions.",
    relatedMethods: ["Strategy Map", "System Map", "Opportunity Map"],
    canCreate: true,
  },
  {
    id: "decision-map",
    name: "Decision Map",
    hoverBlurb: "Compare options before making a choice.",
    whatItIs:
      "A structured comparison of options, criteria, and tradeoffs so a choice can settle.",
    whyItWorks:
      "It externalizes the swirl of “what if” so you can weigh what matters instead of looping.",
    bestUsedFor:
      "Choosing between offers, paths, vendors, or next moves when more than one option feels viable.",
    whenNotToUse:
      "When you are still exploring the problem space — start with a Mind Map, then decide.",
    example:
      "Options A/B/C against criteria like energy cost, revenue, and alignment with your season.",
    relatedMethods: ["Priority Map", "Opportunity Map", "Mind Map"],
    canCreate: true,
  },
  {
    id: "relationship-map",
    name: "Relationship Map",
    hoverBlurb: "Understand how people, ideas, or systems connect.",
    whatItIs:
      "A network view of people, ideas, or systems and the links between them.",
    whyItWorks:
      "Influence and dependency are hard to hold in a list — seeing the web reveals leverage and friction.",
    bestUsedFor:
      "Stakeholder webs, idea ecosystems, team dynamics, or how parts of a business affect each other.",
    whenNotToUse:
      "When you need sequence or deadlines — use Timeline or Process instead.",
    example:
      "You, clients, partners, and content channels with arrows for who influences whom.",
    relatedMethods: ["Journey Map", "Strategy Map", "Mind Map"],
    canCreate: true,
  },
  {
    id: "process-map",
    name: "Process Map",
    hoverBlurb: "See steps, bottlenecks, and flow from start to finish.",
    whatItIs: "A flow of steps from start to finish, including handoffs and bottlenecks.",
    whyItWorks:
      "It turns a fuzzy “how we do this” into a visible path you can improve.",
    bestUsedFor:
      "Onboarding, delivery workflows, content pipelines, or any repeatable sequence.",
    whenNotToUse:
      "When you are still inventing the idea — Mind Map first, process later.",
    example:
      "Lead → discovery call → proposal → kickoff → delivery → follow-up.",
    relatedMethods: ["Timeline Map", "Journey Map", "System Map"],
    canCreate: true,
  },
  {
    id: "journey-map",
    name: "Journey Map",
    hoverBlurb: "Chart the path from where you are to where you want to go.",
    whatItIs:
      "A path from current state to desired state, with stages of experience along the way.",
    whyItWorks:
      "It keeps the human experience in view — not only tasks, but how it feels to move through.",
    bestUsedFor:
      "Client experience, reader journeys, personal transformation arcs, or go-to-market paths.",
    whenNotToUse:
      "When you need a pure step sequence — Process Map is clearer for that.",
    example:
      "Stranger → curious visitor → first win → loyal member.",
    relatedMethods: ["Process Map", "Timeline Map", "Relationship Map"],
    canCreate: true,
  },
  {
    id: "timeline-map",
    name: "Timeline Map",
    hoverBlurb: "Place events in order and see what comes next.",
    whatItIs: "Events and milestones placed in order across time.",
    whyItWorks:
      "Sequence and pacing become visible — what is overdue, what is next, what can wait.",
    bestUsedFor:
      "Launches, seasons of work, content calendars, or personal milestones.",
    whenNotToUse:
      "When relationships or options matter more than dates.",
    example:
      "Research week → draft week → soft launch → full launch.",
    relatedMethods: ["System Map", "Process Map", "Priority Map"],
    canCreate: true,
  },
  {
    id: "strategy-map",
    name: "Strategy Map",
    hoverBlurb: "Connect vision, priorities, and action into one course.",
    whatItIs:
      "A bridge from vision and priorities down to the actions that carry them.",
    whyItWorks:
      "It keeps strategy from floating — every action can point back to why it matters.",
    bestUsedFor:
      "Quarterly focus, business direction, or aligning a team around one course.",
    whenNotToUse:
      "When you only need a quick idea dump — Mind Map is lighter.",
    example:
      "Vision → three priorities → supporting initiatives → next actions.",
    relatedMethods: ["Mind Map", "System Map", "Priority Map"],
    canCreate: true,
  },
  {
    id: "opportunity-map",
    name: "Opportunity Map",
    hoverBlurb: "Explore possibilities, benefits, risks, and first steps.",
    whatItIs:
      "A canvas for possibilities — benefits, risks, and first steps for each option.",
    whyItWorks:
      "It lets you explore without committing, so promising paths can surface calmly.",
    bestUsedFor:
      "New offers, pivots, partnerships, or “what if we tried…” seasons.",
    whenNotToUse:
      "When a decision is already due — move to Decision Map.",
    example:
      "Three opportunity cards with upside, risk, and a smallest next step.",
    relatedMethods: ["Decision Map", "Mind Map", "Strategy Map"],
    canCreate: true,
  },
  {
    id: "system-map",
    name: "System Map",
    hoverBlurb: "See how people, processes, and information work together.",
    whatItIs:
      "A view of components, flows, dependencies, and friction points in one system.",
    whyItWorks:
      "It makes invisible handoffs and bottlenecks visible so you can improve the whole, not just one step.",
    bestUsedFor:
      "Onboarding systems, delivery operations, tech stacks, or any multi-part process web.",
    whenNotToUse:
      "When you only need a linear checklist — Process Map or Timeline Map is lighter.",
    example:
      "Inquiry → discovery → proposal → kickoff, with tools and people attached to each stage.",
    relatedMethods: ["Process Map", "Relationship Map", "Strategy Map"],
    canCreate: true,
  },
  {
    id: "priority-map",
    name: "Priority Map",
    hoverBlurb: "Sort what matters by impact, urgency, and effort.",
    whatItIs:
      "A sorting view for what matters by impact, urgency, and effort.",
    whyItWorks:
      "It interrupts the “everything is urgent” feeling with honest tradeoffs.",
    bestUsedFor:
      "Weekly focus, backlog triage, or choosing what to do with limited energy.",
    whenNotToUse:
      "When you do not yet know what the options are — gather with a Mind Map first.",
    example:
      "High impact / low effort in the “do now” zone; the rest parked or deferred.",
    relatedMethods: ["Decision Map", "Timeline Map", "System Map"],
    canCreate: true,
  },
] as const;

export function getAtlasEntry(
  id: CartographersFramedMapId,
): CartographersAtlasEntry | undefined {
  return CARTOGRAPHERS_ATLAS_ENTRIES.find((entry) => entry.id === id);
}

export const CARTOGRAPHERS_ATLAS_INTRO = {
  title: "Cartographer's Atlas",
  subtitle: "Learn visual thinking — then create when you're ready.",
  body: "Each method teaches a different way of seeing. Explore freely. When a map is ready, Create This Map opens the same Discovery Interview as the framed map on the wall.",
} as const;
