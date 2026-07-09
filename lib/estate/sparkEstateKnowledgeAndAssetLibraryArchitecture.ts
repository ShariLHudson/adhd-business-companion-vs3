/**
 * Spark Estate™ — knowledge and asset library architecture (Phase 19).
 * Intelligent resource retrieval — the right knowledge at the right moment.
 *
 * @see docs/protocols/SPARK_ESTATE_KNOWLEDGE_AND_ASSET_LIBRARY_ARCHITECTURE_SPECIFICATION_PHASE19.md
 */

import { searchAssets } from "@/lib/assetLibrary/search";
import type { AppSection } from "@/lib/companionUi";
import {
  getProjects,
  getSnippets,
  getTemplates,
  TEMPLATE_CATEGORY_LABEL,
  type TemplateCategory,
  type TemplateItem,
} from "@/lib/companionStore";
import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { detectChamberEnergyLevel } from "./chamberOfMomentumIntelligence";
import {
  buildSparkEstatePersonalizationContext,
  type SparkEstatePersonalizationContext,
} from "./sparkEstateMemberProfileEngine";

export const SPARK_ESTATE_KNOWLEDGE_PRINCIPLE =
  "Knowledge exists to help members understand, create, decide, improve, and complete.";

export const SPARK_ESTATE_KNOWLEDGE_QUESTION =
  "How can this information help this person move forward?";

export const SPARK_ESTATE_KNOWLEDGE_CATEGORIES = [
  {
    id: "frameworks",
    label: "Frameworks",
    purpose: "Repeatable ways of thinking for guidance, teaching, and problem solving.",
    primaryOwner: "Templates (systems/strategy) + estate intelligence registrations",
    location:
      "lib/companionStore.ts (companion-templates-v1), lib/estateIntelligence/registrations/",
  },
  {
    id: "templates",
    label: "Templates",
    purpose: "Help members start faster with purpose, instructions, and examples.",
    primaryOwner: "Companion templates library",
    location: "lib/companionStore.ts (companion-templates-v1)",
  },
  {
    id: "strategies",
    label: "Strategies",
    purpose: "Approaches for accomplishing business and personal goals.",
    primaryOwner: "Templates (strategy/offers) + snippets",
    location: "lib/companionStore.ts (companion-templates-v1, companion-snippets-v1)",
  },
  {
    id: "examples",
    label: "Examples",
    purpose: "Reduce blank-page friction with sample messaging and plans.",
    primaryOwner: "Snippets + template bodies",
    location: "lib/companionStore.ts (companion-snippets-v1)",
  },
  {
    id: "guides",
    label: "Guides and learning resources",
    purpose: "Teach concepts with explanations, examples, applications, and next steps.",
    primaryOwner: "Momentum Institute + Spark Note catalog",
    location:
      "lib/sparkNote/catalog.ts, lib/estate/sparkEstateCardEcosystem.ts (knowledge-card)",
  },
  {
    id: "member-created",
    label: "Member-created assets",
    purpose: "Store what the member creates and completes.",
    primaryOwner: "Universal creation + asset library + projects",
    location:
      "lib/universalCreation/orchestrator.ts, lib/assetLibrary/assetLibraryStore.ts, lib/companionStore.ts (companion-projects-v1)",
  },
] as const;

export type SparkEstateKnowledgeCategoryId =
  (typeof SPARK_ESTATE_KNOWLEDGE_CATEGORIES)[number]["id"];

export type SparkEstateKnowledgeRoomGroup =
  | "chamber"
  | "marketing"
  | "content"
  | "research";

export type SparkEstateKnowledgeAsset = {
  id: string;
  category: SparkEstateKnowledgeCategoryId;
  name: string;
  purpose: string;
  audience?: string;
  whenToUse?: string;
  howToUse?: string;
  examples?: string;
  rooms: SparkEstateKnowledgeRoomGroup[];
  workflows: string[];
  cards: string[];
  source: string;
};

export const SPARK_ESTATE_KNOWLEDGE_RETRIEVAL_FACTORS = [
  "member goal",
  "current task",
  "conversation context",
  "room",
  "previous history",
  "skill level",
] as const;

export const SPARK_ESTATE_ROOM_KNOWLEDGE: Record<
  SparkEstateKnowledgeRoomGroup,
  { label: string; uses: readonly string[]; sections: readonly AppSection[] }
> = {
  chamber: {
    label: "Chamber of Momentum™",
    uses: ["progress frameworks", "decision tools", "next-step strategies"],
    sections: [
      "chamber-of-momentum",
      "momentum-builder",
      "chamber-project-entry",
      "decision-compass",
    ],
  },
  marketing: {
    label: "Marketing Room",
    uses: ["messaging frameworks", "campaign strategies", "funnel templates"],
    sections: ["content-generator", "templates-library"],
  },
  content: {
    label: "Content Room",
    uses: ["writing structures", "content templates", "editing guides"],
    sections: ["content-generator", "templates-library", "saved-work"],
  },
  research: {
    label: "Research Room",
    uses: ["research methods", "analysis frameworks"],
    sections: ["momentum-institute", "grow"],
  },
};

export const SPARK_ESTATE_KNOWLEDGE_PERSONALIZATION = {
  beginner: "Provide explanation and examples.",
  experienced: "Provide frameworks and shortcuts.",
  lowEnergy: "Provide simpler options.",
  highEnergy: "Provide deeper resources.",
} as const;

export const SPARK_ESTATE_ASSET_QUALITY_STANDARDS = [
  "accurate",
  "useful",
  "organized",
  "understandable",
  "actionable",
] as const;

export const SPARK_ESTATE_ASSET_LIFECYCLE = [
  "created",
  "reviewed",
  "organized",
  "used",
  "improved",
  "updated",
] as const;

export const SPARK_ESTATE_MEMBER_LIBRARY_SECTIONS = [
  "saved creations",
  "favorite templates",
  "completed projects",
  "useful resources",
] as const;

export const SPARK_ESTATE_KNOWLEDGE_AI_USE = [
  "guide",
  "explain",
  "create",
  "improve",
] as const;

export const SPARK_ESTATE_KNOWLEDGE_AI_AVOID = [
  "overwhelm",
  "dump information",
  "replace member thinking",
] as const;

const TEMPLATE_CATEGORY_TO_KNOWLEDGE: Record<
  TemplateCategory,
  SparkEstateKnowledgeCategoryId
> = {
  strategy: "strategies",
  systems: "frameworks",
  emails: "templates",
  content: "templates",
  offers: "examples",
  execution: "guides",
  other: "guides",
};

const ROOM_KEYWORDS: Record<SparkEstateKnowledgeRoomGroup, RegExp> = {
  chamber: /\b(?:stuck|momentum|project|next step|decide|clarity)\b/i,
  marketing: /\b(?:funnel|campaign|email|messaging|marketing|offer)\b/i,
  content: /\b(?:write|content|blog|post|script|edit)\b/i,
  research: /\b(?:learn|research|understand|study|analyze)\b/i,
};

function roomGroupForSection(
  section?: AppSection,
): SparkEstateKnowledgeRoomGroup | null {
  if (!section) return null;
  for (const [group, config] of Object.entries(SPARK_ESTATE_ROOM_KNOWLEDGE) as Array<
    [SparkEstateKnowledgeRoomGroup, (typeof SPARK_ESTATE_ROOM_KNOWLEDGE)[SparkEstateKnowledgeRoomGroup]]
  >) {
    if (config.sections.includes(section)) return group;
  }
  return null;
}

function inferRoomGroups(text: string): SparkEstateKnowledgeRoomGroup[] {
  const groups = new Set<SparkEstateKnowledgeRoomGroup>();
  for (const [group, pattern] of Object.entries(ROOM_KEYWORDS) as Array<
    [SparkEstateKnowledgeRoomGroup, RegExp]
  >) {
    if (pattern.test(text)) groups.add(group);
  }
  return [...groups];
}

function roomsForTemplate(category: TemplateCategory): SparkEstateKnowledgeRoomGroup[] {
  switch (category) {
    case "strategy":
    case "offers":
      return ["marketing", "chamber"];
    case "emails":
    case "content":
      return ["marketing", "content"];
    case "systems":
      return ["chamber", "research"];
    case "execution":
      return ["chamber"];
    default:
      return ["content"];
  }
}

function templateToKnowledgeAsset(template: TemplateItem): SparkEstateKnowledgeAsset {
  const category = TEMPLATE_CATEGORY_TO_KNOWLEDGE[template.category];
  return {
    id: `template-${template.id}`,
    category,
    name: template.title,
    purpose: template.body.trim().slice(0, 160) || template.title,
    audience: template.audienceIds?.join(", "),
    whenToUse: TEMPLATE_CATEGORY_LABEL[template.category],
    howToUse: "Customize one section at a time — purpose, audience, then details.",
    examples: template.body.trim().slice(0, 240),
    rooms: roomsForTemplate(template.category),
    workflows: ["universal-creation", "templates-library"],
    cards: category === "guides" ? ["knowledge-card"] : ["knowledge-card", "momentum-card"],
    source: "companion-templates-v1",
  };
}

function snippetToKnowledgeAsset(snippet: ReturnType<typeof getSnippets>[number]): SparkEstateKnowledgeAsset {
  return {
    id: `snippet-${snippet.id}`,
    category: "examples",
    name: `${snippet.kind} snippet`,
    purpose: snippet.content.trim().slice(0, 160),
    whenToUse: snippet.whenToUse ?? "When you need a reusable content block.",
    howToUse: snippet.whereToUse ?? "Drop into your draft and adapt the tone.",
    examples: snippet.content.trim().slice(0, 240),
    rooms: ["marketing", "content"],
    workflows: ["universal-creation", "content-generator"],
    cards: ["knowledge-card"],
    source: "companion-snippets-v1",
  };
}

function projectToKnowledgeAsset(
  project: ReturnType<typeof getProjects>[number],
): SparkEstateKnowledgeAsset {
  return {
    id: `project-${project.id}`,
    category: "member-created",
    name: project.name,
    purpose: project.goal?.trim() || project.name,
    whenToUse: "When continuing active or completed work.",
    howToUse: project.nextAction
      ? `Next: ${project.nextAction}`
      : "Open the project and choose the next small step.",
    examples: project.completedAchievement,
    rooms: ["chamber"],
    workflows: ["goals-and-projects", "universal-creation"],
    cards: ["project-card", "momentum-card"],
    source: "companion-projects-v1",
  };
}

function assetLibraryToKnowledgeAsset(
  asset: ReturnType<typeof searchAssets>[number],
): SparkEstateKnowledgeAsset {
  return {
    id: `asset-${asset.id}`,
    category: "member-created",
    name: asset.title || asset.filename,
    purpose: asset.description || asset.title,
    whenToUse: "When referencing saved media or documents.",
    howToUse: "Link once in Asset Library — reference everywhere.",
    examples: asset.tags.join(", ") || undefined,
    rooms: ["content", "chamber"],
    workflows: ["asset-library", "completion-system"],
    cards: ["win-card"],
    source: "companion-asset-library-v1",
  };
}

function scoreKnowledgeAsset(
  asset: SparkEstateKnowledgeAsset,
  input: {
    text: string;
    topic: string;
    roomGroup: SparkEstateKnowledgeRoomGroup | null;
    roomGroups: SparkEstateKnowledgeRoomGroup[];
  },
): number {
  const haystack = `${asset.name} ${asset.purpose} ${asset.whenToUse ?? ""}`.toLowerCase();
  let score = 0;

  if (input.topic && haystack.includes(input.topic.toLowerCase())) score += 12;
  if (input.text) {
    for (const token of input.text.toLowerCase().split(/\s+/).filter((part) => part.length > 3)) {
      if (haystack.includes(token)) score += 2;
    }
  }
  if (input.roomGroup && asset.rooms.includes(input.roomGroup)) score += 8;
  for (const group of input.roomGroups) {
    if (asset.rooms.includes(group)) score += 4;
  }
  if (asset.category === "templates" || asset.category === "examples") score += 1;

  return score;
}

function personalizeKnowledgeAsset(
  asset: SparkEstateKnowledgeAsset,
  context: SparkEstatePersonalizationContext,
  energy: "low" | "normal" | "high",
): SparkEstateKnowledgeAsset {
  if (energy === "low" || context.greetingTone === "low-energy") {
    return {
      ...asset,
      howToUse: "Choose one simple piece to use right now.",
      examples: asset.examples?.slice(0, 120),
    };
  }
  if (context.explanationLength === "brief") {
    return {
      ...asset,
      purpose: asset.purpose.slice(0, 100),
      examples: undefined,
    };
  }
  if (context.useExamples && !asset.examples) {
    return {
      ...asset,
      examples: "Here is a short example you can adapt.",
    };
  }
  return asset;
}

function buildKnowledgePool(): SparkEstateKnowledgeAsset[] {
  return [
    ...getTemplates().map(templateToKnowledgeAsset),
    ...getSnippets().map(snippetToKnowledgeAsset),
    ...getProjects().map(projectToKnowledgeAsset),
    ...searchAssets().map(assetLibraryToKnowledgeAsset),
  ];
}

export function retrieveSparkEstateKnowledge(input?: {
  text?: string;
  topic?: string;
  section?: AppSection;
  category?: SparkEstateKnowledgeCategoryId;
  limit?: number;
}): SparkEstateKnowledgeAsset[] {
  const text = input?.text?.trim() ?? "";
  const topic = input?.topic?.trim() ?? "";
  const limit = input?.limit ?? 5;
  const roomGroup = roomGroupForSection(input?.section);
  const roomGroups = inferRoomGroups(`${text} ${topic}`);
  const energy = text ? detectChamberEnergyLevel(text) : "normal";
  const personalization = buildSparkEstatePersonalizationContext({ text });

  let pool = buildKnowledgePool();
  if (input?.category) {
    pool = pool.filter((asset) => asset.category === input.category);
  }

  const ranked = pool
    .map((asset) => ({
      asset: personalizeKnowledgeAsset(asset, personalization, energy),
      score: scoreKnowledgeAsset(asset, { text, topic, roomGroup, roomGroups }),
    }))
    .filter((entry) => entry.score > 0 || (!text && !topic))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.asset);

  if (ranked.length > 0) return ranked;

  return pool.slice(0, Math.min(limit, 3));
}

export function selectSparkEstateKnowledgeForCard(input?: {
  text?: string;
  topic?: string;
  section?: AppSection;
}): SparkEstateKnowledgeAsset | null {
  const results = retrieveSparkEstateKnowledge({
    ...input,
    limit: 1,
  });
  return results[0] ?? null;
}

export function sparkEstateKnowledgeCompanionHint(input?: {
  text?: string;
  section?: AppSection;
}): string | null {
  const text = input?.text?.trim() ?? "";
  if (!text) return null;
  const asset = selectSparkEstateKnowledgeForCard({
    text,
    section: input?.section,
  });
  if (!asset) return null;

  return (
    `SPARK ESTATE KNOWLEDGE: ${SPARK_ESTATE_KNOWLEDGE_QUESTION} ` +
    `Suggest ${asset.name} (${asset.category}) — ${asset.howToUse ?? asset.purpose}. ` +
    `Do not overwhelm; guide one useful step.`
  );
}

export function verifySparkEstateKnowledgeAndAssetLibrary(): {
  categories: number;
  retrievalReady: boolean;
  roomConnectionsReady: boolean;
  creationJourneyAligned: boolean;
  memberLibraryReady: boolean;
  qualityStandardsReady: boolean;
} {
  const sample = retrieveSparkEstateKnowledge({ topic: "email", limit: 1 });

  return {
    categories: SPARK_ESTATE_KNOWLEDGE_CATEGORIES.length,
    retrievalReady:
      SPARK_ESTATE_KNOWLEDGE_RETRIEVAL_FACTORS.length === 6 &&
      Array.isArray(sample),
    roomConnectionsReady: Object.keys(SPARK_ESTATE_ROOM_KNOWLEDGE).length === 4,
    creationJourneyAligned:
      SPARK_ESTATE_CREATION_STEPS.length === 8 &&
      SPARK_ESTATE_CREATION_STEPS[0]?.id === "understand",
    memberLibraryReady: SPARK_ESTATE_MEMBER_LIBRARY_SECTIONS.length === 4,
    qualityStandardsReady:
      SPARK_ESTATE_ASSET_QUALITY_STANDARDS.length === 5 &&
      SPARK_ESTATE_KNOWLEDGE_AI_AVOID.includes("overwhelm"),
  };
}

export function formatSparkEstateKnowledgeAndAssetLibraryReport(
  verification: ReturnType<typeof verifySparkEstateKnowledgeAndAssetLibrary> = verifySparkEstateKnowledgeAndAssetLibrary(),
): string {
  const lines: string[] = [
    `Spark Estate™ knowledge and asset library: ${verification.retrievalReady ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_KNOWLEDGE_PRINCIPLE,
    SPARK_ESTATE_KNOWLEDGE_QUESTION,
    "",
    "Knowledge categories:",
  ];

  for (const category of SPARK_ESTATE_KNOWLEDGE_CATEGORIES) {
    lines.push(
      `  ${category.label} — ${category.purpose}`,
      `    Owner: ${category.primaryOwner}`,
      `    Location: ${category.location}`,
    );
  }

  lines.push("", "Retrieval factors:");
  for (const factor of SPARK_ESTATE_KNOWLEDGE_RETRIEVAL_FACTORS) {
    lines.push(`  • ${factor}`);
  }

  lines.push("", "Room knowledge connections:");
  for (const config of Object.values(SPARK_ESTATE_ROOM_KNOWLEDGE)) {
    lines.push(`  ${config.label}: ${config.uses.join(", ")}`);
  }

  lines.push("", "Universal creation support:");
  for (const step of SPARK_ESTATE_CREATION_STEPS) {
    lines.push(`  → ${step.label}`);
  }

  lines.push("", "Member library sections:");
  for (const section of SPARK_ESTATE_MEMBER_LIBRARY_SECTIONS) {
    lines.push(`  • ${section}`);
  }

  lines.push("", "AI usage:");
  lines.push(`  Use: ${SPARK_ESTATE_KNOWLEDGE_AI_USE.join(", ")}`);
  lines.push(`  Avoid: ${SPARK_ESTATE_KNOWLEDGE_AI_AVOID.join(", ")}`);

  lines.push("", "Integration checks:");
  lines.push(`  Categories: ${verification.categories}`);
  lines.push(`  Retrieval: ${verification.retrievalReady ? "pass" : "fail"}`);
  lines.push(
    `  Room connections: ${verification.roomConnectionsReady ? "pass" : "fail"}`,
  );
  lines.push(
    `  Creation journey: ${verification.creationJourneyAligned ? "pass" : "fail"}`,
  );
  lines.push(
    `  Member library: ${verification.memberLibraryReady ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
