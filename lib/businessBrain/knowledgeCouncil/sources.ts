/**
 * Knowledge Sources — curation registry.
 *
 * RULE: No source may be invented.
 * Placeholders are `unverified_candidate` discipline clusters awaiting real citations.
 * They cannot support final lessons until verified.
 */

import type { KnowledgeSource } from "../types";

type SourceSeed = {
  id: string;
  slug: string;
  sourceTitle: string;
  description: string;
  disciplineIds: string[];
  curationKey: string;
  limitationNotes: string;
};

function unverifiedPlaceholder(seed: SourceSeed): KnowledgeSource {
  return {
    id: seed.id,
    slug: seed.slug,
    sourceTitle: seed.sourceTitle,
    authorOrOrganization: null,
    sourceType: "curatorial_placeholder",
    confidenceLevel: "low",
    verificationStatus: "unverified_candidate",
    limitationNotes: seed.limitationNotes,
    description: seed.description,
    disciplineIds: seed.disciplineIds,
    curationKey: seed.curationKey,
    visibility: "internal",
    title: seed.sourceTitle,
  };
}

const PLACEHOLDER_LIMITATION =
  "Curatorial placeholder — discipline cluster only. Not a verified publication. Do not cite in final lessons until replaced with a real, reviewed source.";

const SEEDS: SourceSeed[] = [
  { id: "src-pricing-traditions", slug: "pricing-traditions", sourceTitle: "Pricing traditions (awaiting curation)", description: "Value, psychology, and market-based pricing — sources to be verified.", disciplineIds: ["disc-economics", "disc-behavioral-economics", "disc-marketing-science"], curationKey: "council.source.pricing", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-offer-design", slug: "offer-design", sourceTitle: "Offer design canon (awaiting curation)", description: "Packaging value into ethical offers — sources to be verified.", disciplineIds: ["disc-entrepreneurship-studies", "disc-marketing-science"], curationKey: "council.source.offers", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-strategic-canons", slug: "strategic-canons", sourceTitle: "Strategic management canon (awaiting curation)", description: "Competitive advantage and positioning — sources to be verified.", disciplineIds: ["disc-strategic-management", "disc-systems-theory"], curationKey: "council.source.strategy", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-sales-traditions", slug: "sales-traditions", sourceTitle: "Ethical sales traditions (awaiting curation)", description: "Trust-based selling — sources to be verified.", disciplineIds: ["disc-sales-methodology", "disc-communication-theory"], curationKey: "council.source.sales", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-brand-lineages", slug: "brand-lineages", sourceTitle: "Brand lineages (awaiting curation)", description: "Identity and trust over time — sources to be verified.", disciplineIds: ["disc-brand-strategy", "disc-marketing-science"], curationKey: "council.source.branding", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-customer-experience", slug: "customer-experience", sourceTitle: "Customer experience research (awaiting curation)", description: "Journey design and retention — sources to be verified.", disciplineIds: ["disc-marketing-science", "disc-design-thinking"], curationKey: "council.source.cx", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-operations-canon", slug: "operations-canon", sourceTitle: "Operations canon (awaiting curation)", description: "Throughput and quality — sources to be verified.", disciplineIds: ["disc-operations-research", "disc-systems-theory"], curationKey: "council.source.operations", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-finance-foundations", slug: "finance-foundations", sourceTitle: "Financial management foundations (awaiting curation)", description: "Cash and forecasting for founders — sources to be verified.", disciplineIds: ["disc-financial-management", "disc-economics"], curationKey: "council.source.finance", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-systems-automation", slug: "systems-automation", sourceTitle: "Systems and automation (awaiting curation)", description: "Processes and automation — sources to be verified.", disciplineIds: ["disc-operations-research", "disc-systems-theory"], curationKey: "council.source.systems", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-ai-practice", slug: "ai-practice", sourceTitle: "AI in business practice (awaiting curation)", description: "Practical AI workflows — sources to be verified.", disciplineIds: ["disc-information-science", "disc-ethics"], curationKey: "council.source.ai", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-ef-research", slug: "ef-research", sourceTitle: "Executive function research (awaiting curation)", description: "EF and ADHD entrepreneurship — sources to be verified.", disciplineIds: ["disc-executive-function-science", "disc-neuroscience"], curationKey: "council.source.ef", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-learning-traditions", slug: "learning-traditions", sourceTitle: "Adult learning traditions (awaiting curation)", description: "Capability acquisition — sources to be verified.", disciplineIds: ["disc-learning-science", "disc-adult-development"], curationKey: "council.source.learning", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-mindset-research", slug: "mindset-research", sourceTitle: "Entrepreneurial mindset research (awaiting curation)", description: "Identity and resilience — sources to be verified.", disciplineIds: ["disc-adult-development", "disc-behavioral-psychology"], curationKey: "council.source.mindset", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-coaching-lineages", slug: "coaching-lineages", sourceTitle: "Coaching lineages (awaiting curation)", description: "Coaching methodology — sources to be verified.", disciplineIds: ["disc-coaching-methodology", "disc-communication-theory"], curationKey: "council.source.coaching", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-leadership-canon", slug: "leadership-canon", sourceTitle: "Leadership canon (awaiting curation)", description: "Stewardship and culture — sources to be verified.", disciplineIds: ["disc-leadership-studies", "disc-organizational-psychology"], curationKey: "council.source.leadership", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-critical-thinking", slug: "critical-thinking", sourceTitle: "Critical thinking traditions (awaiting curation)", description: "Logic and bias — sources to be verified.", disciplineIds: ["disc-decision-science", "disc-information-science"], curationKey: "council.source.critical", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-creative-methods", slug: "creative-methods", sourceTitle: "Creative methods (awaiting curation)", description: "Ideation and design — sources to be verified.", disciplineIds: ["disc-design-thinking", "disc-innovation-studies"], curationKey: "council.source.creative", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-innovation-practice", slug: "innovation-practice", sourceTitle: "Innovation practice (awaiting curation)", description: "Experimentation — sources to be verified.", disciplineIds: ["disc-innovation-studies", "disc-entrepreneurship-studies"], curationKey: "council.source.innovation", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-communication-craft", slug: "communication-craft", sourceTitle: "Communication craft (awaiting curation)", description: "Listening and clarity — sources to be verified.", disciplineIds: ["disc-communication-theory", "disc-behavioral-psychology"], curationKey: "council.source.communication", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-habit-science", slug: "habit-science", sourceTitle: "Habit science (awaiting curation)", description: "Behavior design — sources to be verified.", disciplineIds: ["disc-habit-formation", "disc-behavioral-psychology"], curationKey: "council.source.habits", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-legacy-impact", slug: "legacy-impact", sourceTitle: "Legacy and impact (awaiting curation)", description: "Purpose and contribution — sources to be verified.", disciplineIds: ["disc-leadership-studies", "disc-adult-development"], curationKey: "council.source.legacy", limitationNotes: PLACEHOLDER_LIMITATION },
  { id: "src-content-craft", slug: "content-craft", sourceTitle: "Content craft (awaiting curation)", description: "Writing and teaching — sources to be verified.", disciplineIds: ["disc-communication-theory", "disc-learning-science"], curationKey: "council.source.content", limitationNotes: PLACEHOLDER_LIMITATION },
];

/** All council sources — currently placeholders until editorial verification */
export const KNOWLEDGE_SOURCES: KnowledgeSource[] = SEEDS.map(unverifiedPlaceholder);

/**
 * Template for adding a verified source — must be filled with real metadata.
 * Never call with invented author, URL, or title.
 */
export function buildVerifiedKnowledgeSource(
  input: Omit<KnowledgeSource, "verificationStatus" | "visibility"> & {
    verificationStatus?: "verified";
  },
): KnowledgeSource {
  if (!input.authorOrOrganization?.trim()) {
    throw new Error(
      "Verified sources require authorOrOrganization — no invented sources.",
    );
  }
  if (input.sourceType === "curatorial_placeholder") {
    throw new Error("Verified sources cannot use curatorial_placeholder type.");
  }
  return {
    ...input,
    verificationStatus: "verified",
    visibility: "internal",
    title: input.sourceTitle,
  };
}
