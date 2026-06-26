/**
 * Specialized Intelligence Layer™ — constitutional registry.
 * Each entry owns exactly one category of questions.
 */

export const SPECIALIZED_INTELLIGENCE_IDS = [
  "user-intelligence",
  "emotional-intelligence",
  "energy-intelligence",
  "business-intelligence",
  "project-intelligence",
  "planning-intelligence",
  "focus-intelligence",
  "decision-intelligence",
  "content-intelligence",
  "opportunity-intelligence",
  "pattern-intelligence",
  "evidence-intelligence",
  "memory-intelligence",
  "creative-intelligence",
  "research-intelligence",
  "relationship-intelligence",
  "wellness-intelligence",
  "environment-intelligence",
  "presence-intelligence",
] as const;

export type SpecializedIntelligenceId =
  (typeof SPECIALIZED_INTELLIGENCE_IDS)[number];

export type SpecializedIntelligenceMaturity =
  | "production"
  | "foundation"
  | "planned";

export type SpecializedIntelligenceEntry = {
  id: SpecializedIntelligenceId;
  name: string;
  /** The one category of questions this intelligence may answer */
  responsibility: string;
  module: string;
  maturity: SpecializedIntelligenceMaturity;
  /** Orchestrated by Companion Intelligence — never user-facing */
  userVisible: false;
};

export const SPECIALIZED_INTELLIGENCE_REGISTRY: readonly SpecializedIntelligenceEntry[] =
  [
    {
      id: "user-intelligence",
      name: "User Intelligence™",
      responsibility: "Learns who the user is — preferences, chronotype, relationship depth",
      module: "companionAdaptiveUserEngine",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "emotional-intelligence",
      name: "Emotional Intelligence™",
      responsibility: "Recognizes emotional state and adjusts interaction tone",
      module: "adhdEmotionalFrictionIntelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "energy-intelligence",
      name: "Energy Intelligence™",
      responsibility: "Tracks energy, motivation, cognitive load, and timing",
      module: "recovery-intelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "business-intelligence",
      name: "Business Intelligence™",
      responsibility: "Understands offers, clients, launches, marketing, visibility, sales, priorities",
      module: "ecosystem-intelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "project-intelligence",
      name: "Project Intelligence™",
      responsibility: "Tracks active work, dependencies, progress, unfinished work",
      module: "founderWorkspace/intelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "planning-intelligence",
      name: "Planning Intelligence™",
      responsibility: "Determines what deserves attention today",
      module: "planMyDay/companionBrainClient",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "focus-intelligence",
      name: "Focus Intelligence™",
      responsibility: "Recognizes stuck states and recommends appropriate focus tools",
      module: "focusLandscape",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "decision-intelligence",
      name: "Decision Intelligence™",
      responsibility: "Supports choices, trade-offs, prioritization, and clarity",
      module: "decision-intelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "content-intelligence",
      name: "Content Intelligence™",
      responsibility: "Content themes, repurposing, publishing strategy",
      module: "ecosystem/contentIntelligenceEngine",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "opportunity-intelligence",
      name: "Opportunity Intelligence™",
      responsibility: "Recognizes leverage opportunities without interrupting flow",
      module: "opportunity-intelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "pattern-intelligence",
      name: "Pattern Intelligence™",
      responsibility: "Recurring habits, struggles, wins, avoidance patterns",
      module: "loop-intelligence",
      maturity: "foundation",
      userVisible: false,
    },
    {
      id: "evidence-intelligence",
      name: "Evidence Intelligence™",
      responsibility: "Remembers accomplishments and positive evidence for encouragement",
      module: "recognition",
      maturity: "foundation",
      userVisible: false,
    },
    {
      id: "memory-intelligence",
      name: "Memory Intelligence™",
      responsibility: "Long-term context — retrieves only what is relevant now",
      module: "intelligence-layer",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "creative-intelligence",
      name: "Creative Intelligence™",
      responsibility: "Brainstorming, writing, design, idea generation",
      module: "content-generator",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "research-intelligence",
      name: "Research Intelligence™",
      responsibility: "Information, trends, examples, supporting knowledge",
      module: "knowledgeIntelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "relationship-intelligence",
      name: "Relationship Intelligence™",
      responsibility: "People, contacts, networking, follow-up, communication",
      module: "relationship-intelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "wellness-intelligence",
      name: "Wellness Intelligence™",
      responsibility: "Healthy rhythms, breaks, movement, breathing, recovery",
      module: "reliefIntelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "environment-intelligence",
      name: "Environment Intelligence™",
      responsibility: "Room, scene, atmosphere, workspace — constitutional render authority",
      module: "companionConstitution/environmentIntelligence",
      maturity: "production",
      userVisible: false,
    },
    {
      id: "presence-intelligence",
      name: "Presence Intelligence™",
      responsibility: "How Shari is experienced — Nearby, Beside You, Listening, Invisible",
      module: "companionConstitution/presenceIntelligence",
      maturity: "production",
      userVisible: false,
    },
  ];

export function specializedIntelligenceById(
  id: SpecializedIntelligenceId,
): SpecializedIntelligenceEntry {
  const entry = SPECIALIZED_INTELLIGENCE_REGISTRY.find((e) => e.id === id);
  if (!entry) throw new Error(`Unknown specialized intelligence: ${id}`);
  return entry;
}

/** Constitutional validation — no duplicate responsibility strings */
export function validateSpecializedIntelligenceRegistry(): string[] {
  const seen = new Map<string, SpecializedIntelligenceId>();
  const conflicts: string[] = [];
  for (const entry of SPECIALIZED_INTELLIGENCE_REGISTRY) {
    const key = entry.responsibility.toLowerCase();
    const prior = seen.get(key);
    if (prior) {
      conflicts.push(`${prior} duplicates ${entry.id}: ${entry.responsibility}`);
    } else {
      seen.set(key, entry.id);
    }
  }
  return conflicts;
}
