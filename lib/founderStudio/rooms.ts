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
    title: "Knowledge Library",
    question: "Where is the full research?",
    purpose: "FIRE reports, PDFs, articles, forecasts, and decision history.",
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
];

export function getFounderRoom(id: string): FounderRoomMeta | undefined {
  return FOUNDER_ROOMS.find((room) => room.id === id);
}

export function isFounderRoomId(id: string): boolean {
  return FOUNDER_ROOMS.some((room) => room.id === id);
}
