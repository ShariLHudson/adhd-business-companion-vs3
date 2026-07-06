import type { FounderRoomMeta } from "./types";
import { FOUNDER_STUDIO_BASE } from "./founderConfig";

export const FOUNDER_ROOMS: readonly FounderRoomMeta[] = [
  {
    id: "morning",
    href: `${FOUNDER_STUDIO_BASE}/morning`,
    title: "Morning Briefing",
    question: "What matters today?",
    purpose: "Start with clarity — critical items, calm priorities, and today's focus.",
    accent: "gold",
  },
  {
    id: "strategy",
    href: `${FOUNDER_STUDIO_BASE}/strategy`,
    title: "Strategy Studio",
    question: "Where are we headed?",
    purpose: "Long-view decisions, positioning, and ecosystem direction.",
    accent: "teal",
  },
  {
    id: "innovation",
    href: `${FOUNDER_STUDIO_BASE}/innovation`,
    title: "Innovation Lab",
    question: "What ideas are emerging?",
    purpose: "Experiments, prototypes, and future product seeds.",
    accent: "aqua",
  },
  {
    id: "spark-command",
    href: `${FOUNDER_STUDIO_BASE}/spark-command`,
    title: "Spark Command Center",
    question: "What should we build or improve?",
    purpose: "Product priorities, Spark quality, and build decisions.",
    accent: "bronze",
  },
  {
    id: "opportunity-vault",
    href: `${FOUNDER_STUDIO_BASE}/opportunity-vault`,
    title: "Opportunity Vault",
    question: "How can this become profitable?",
    purpose: "Revenue ideas, offers, and monetization paths.",
    accent: "gold",
  },
  {
    id: "knowledge-library",
    href: `${FOUNDER_STUDIO_BASE}/knowledge-library`,
    title: "Executive Archives",
    question: "What did we already decide?",
    purpose: "Previous FIRE briefs — issue history, focus, and executive summaries.",
    accent: "purple",
  },
  {
    id: "reflection",
    href: `${FOUNDER_STUDIO_BASE}/reflection`,
    title: "Reflection Room",
    question: "What did we learn?",
    purpose: "Founder journaling, pattern review, and wisdom capture.",
    accent: "teal",
  },
  {
    id: "creation-studio",
    href: `${FOUNDER_STUDIO_BASE}/creation-studio`,
    title: "Creation Studio",
    question: "What should we create from what we learned?",
    purpose: "Workshops, courses, newsletters, campaigns, and lead magnets.",
    accent: "aqua",
  },
  {
    id: "automation-studio",
    href: `${FOUNDER_STUDIO_BASE}/automation-studio`,
    title: "Automation Studio",
    question: "What can be automated?",
    purpose: "Research, reporting, social, Drive PDFs, Cursor prompts, and handoffs.",
    accent: "bronze",
  },
  {
    id: "team-hub",
    href: `${FOUNDER_STUDIO_BASE}/team-hub`,
    title: "Team Hub™",
    question:
      "What needs to be executed, assigned, reviewed, or approved?",
    purpose: "Founder thinks. Team Hub executes.",
    accent: "gold",
  },
  {
    id: "executive-intelligence",
    href: `${FOUNDER_STUDIO_BASE}/executive-intelligence`,
    title: "Executive Intelligence",
    question: "What is entering the ecosystem?",
    purpose:
      "Signals, timeline, and inbox — the pipeline every future engine feeds.",
    accent: "teal",
  },
  {
    id: "executive-strategy",
    href: `${FOUNDER_STUDIO_BASE}/executive-strategy`,
    title: "Executive Strategy Center™",
    question: "What deserves your clearest thinking?",
    purpose:
      "Visual thinking for decisions, roadmaps, and leadership — not execution.",
    accent: "gold",
  },
  {
    id: "executive-research",
    href: `${FOUNDER_STUDIO_BASE}/executive-research`,
    title: "Executive Research Center™",
    question: "What does Shari actually need to know?",
    purpose:
      "Your private research department — answer, evidence, Spark application, prepared action.",
    accent: "purple",
  },
  {
    id: "opportunity-discovery",
    href: `${FOUNDER_STUDIO_BASE}/opportunity-discovery`,
    title: "Opportunity Discovery Center™",
    question: "If this were my company, what would I build next?",
    purpose:
      "Evidence-backed opportunities — today's biggest bet, quick wins, threats, and what to watch.",
    accent: "aqua",
  },
  {
    id: "executive-builder",
    href: `${FOUNDER_STUDIO_BASE}/executive-builder`,
    title: "Executive Builder™",
    question: "Where do I start?",
    purpose:
      "Complete implementation blueprints — phases, work packets, three options, draft outputs. Never a blank page.",
    accent: "bronze",
  },
  {
    id: "executive-simulation",
    href: `${FOUNDER_STUDIO_BASE}/executive-simulation`,
    title: "Executive Simulation Studio™",
    question: "If we choose this path… what is most likely to happen?",
    purpose:
      "Compare possible futures — tradeoffs, risks, and opportunity cost before you commit time, money, or energy.",
    accent: "teal",
  },
  {
    id: "executive-memory-theater",
    href: `${FOUNDER_STUDIO_BASE}/executive-memory-theater`,
    title: "Executive Memory Theater™",
    question: "What happened — and what did we learn?",
    purpose:
      "The living history of Visual Spark Studios — replay decisions, launches, and journeys as executive wisdom.",
    accent: "purple",
  },
  {
    id: "executive-intelligence-graph",
    href: `${FOUNDER_STUDIO_BASE}/executive-intelligence-graph`,
    title: "Executive Intelligence Graph™",
    question: "How is everything connected?",
    purpose:
      "The living brain — relationships, not folders. Every product, decision, and idea linked into intelligence.",
    accent: "aqua",
  },
  {
    id: "decision-vault",
    href: `${FOUNDER_STUDIO_BASE}/decision-vault`,
    title: "Decision Vault™",
    question: "What did we decide — and why?",
    purpose:
      "Institutional memory — decisions, lessons, milestones, and the company story.",
    accent: "bronze",
  },
];

export function getFounderRoom(id: string): FounderRoomMeta | undefined {
  return FOUNDER_ROOMS.find((room) => room.id === id);
}

export function isFounderRoomId(id: string): boolean {
  return FOUNDER_ROOMS.some((room) => room.id === id);
}
