import type { FounderIntelligenceSource } from "../types";

/** Central registry — placeholders for future ecosystem integrations. No APIs. */
export const FOUNDER_INTELLIGENCE_SOURCE_REGISTRY: readonly FounderIntelligenceSource[] = [
  {
    id: "companion",
    name: "Companion",
    category: "Spark OS",
    description: "Member conversations, signals, and continuity patterns.",
    status: "placeholder",
    futureIntegration: "Spark Companion runtime",
  },
  {
    id: "founder",
    name: "Founder",
    category: "Spark OS",
    description: "Executive notes, decisions, and private strategy context.",
    status: "configured",
    futureIntegration: "Founder Studio",
  },
  {
    id: "postcraft",
    name: "PostCraft",
    category: "Content",
    description: "Drafts, campaigns, and publishing preparation.",
    status: "placeholder",
    futureIntegration: "PostCraft workspace",
  },
  {
    id: "gohighlevel",
    name: "GoHighLevel",
    category: "Business",
    description: "CRM, funnels, and client lifecycle events.",
    status: "placeholder",
    futureIntegration: "GoHighLevel API",
  },
  {
    id: "ai-research",
    name: "AI Research",
    category: "Research",
    description: "Curated AI landscape scans and model observations.",
    status: "placeholder",
  },
  {
    id: "adhd-research",
    name: "ADHD Research",
    category: "Research",
    description: "Executive function, attention, and entrepreneur patterns.",
    status: "placeholder",
  },
  {
    id: "ux",
    name: "UX",
    category: "Product",
    description: "Usability observations and experience friction signals.",
    status: "placeholder",
  },
  {
    id: "accessibility",
    name: "Accessibility",
    category: "Product",
    description: "Inclusive design findings and accommodation needs.",
    status: "placeholder",
  },
  {
    id: "competitors",
    name: "Competitors",
    category: "Market",
    description: "Competitive positioning and category movement.",
    status: "placeholder",
  },
  {
    id: "business",
    name: "Business",
    category: "Business",
    description: "Revenue, offers, and strategic business context.",
    status: "configured",
  },
  {
    id: "technology",
    name: "Technology",
    category: "Engineering",
    description: "Platform health, architecture, and build signals.",
    status: "configured",
  },
  {
    id: "social-media",
    name: "Social Media",
    category: "Marketing",
    description: "Engagement patterns and audience response.",
    status: "placeholder",
  },
  {
    id: "google-trends",
    name: "Google Trends",
    category: "Research",
    description: "Macro search and topic momentum.",
    status: "placeholder",
    futureIntegration: "Google Trends API",
  },
  {
    id: "pinterest",
    name: "Pinterest",
    category: "Marketing",
    description: "Visual discovery and save patterns.",
    status: "placeholder",
  },
  {
    id: "reddit",
    name: "Reddit",
    category: "Research",
    description: "Community conversations and weak signals.",
    status: "placeholder",
  },
  {
    id: "books",
    name: "Books",
    category: "Learning",
    description: "Reading notes and extracted frameworks.",
    status: "placeholder",
  },
  {
    id: "podcasts",
    name: "Podcasts",
    category: "Learning",
    description: "Episode insights and guest ideas.",
    status: "placeholder",
  },
  {
    id: "founder-notes",
    name: "Founder Notes",
    category: "Founder",
    description: "Shari's manual captures and voice memos.",
    status: "configured",
  },
  {
    id: "development",
    name: "Development",
    category: "Engineering",
    description: "Build progress, PRs, and shipping events.",
    status: "configured",
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "Engineering",
    description: "Implementation queue and agent handoffs.",
    status: "configured",
  },
  {
    id: "future",
    name: "Future Integrations",
    category: "Reserved",
    description: "Placeholder for engines not yet imagined.",
    status: "placeholder",
  },
] as const;

export type FounderIntelligenceRegistrySourceId =
  (typeof FOUNDER_INTELLIGENCE_SOURCE_REGISTRY)[number]["id"];

export function getIntelligenceSource(
  id: string,
): FounderIntelligenceSource | undefined {
  return FOUNDER_INTELLIGENCE_SOURCE_REGISTRY.find((source) => source.id === id);
}

export function listIntelligenceSources(): FounderIntelligenceSource[] {
  return [...FOUNDER_INTELLIGENCE_SOURCE_REGISTRY];
}
