/**
 * Spark Estate™ — file and data architecture map (Phase 27).
 * Every piece of information has a clear home; one primary owner per domain.
 *
 * @see docs/protocols/SPARK_ESTATE_FILE_AND_DATA_ARCHITECTURE_MAP_SPECIFICATION_PHASE27.md
 */

import {
  SPARK_ESTATE_OUTPUT_OPTIONS,
  SPARK_ESTATE_REVIEW_HISTORY_KEY,
} from "@/lib/universalCreation/sparkEstateCompletionSystem";
import { verifySparkEstateCardEcosystem } from "./sparkEstateCardEcosystem";
import { verifySparkEstateMemberProfile } from "./sparkEstateMemberProfileEngine";

export const SPARK_ESTATE_DATA_PRINCIPLE = "One source of truth.";

export const SPARK_ESTATE_DATA_VISION =
  "Every piece has a home. Every room can access what it needs. One intelligent companion.";

export const SPARK_ESTATE_DATA_QUALITY_QUESTIONS = [
  "Who owns this information?",
  "Why is it stored?",
  "Who uses it?",
  "Does it improve the member experience?",
] as const;

export const SPARK_ESTATE_DATA_LAYERS = [
  {
    id: "member-identity",
    layer: 1,
    title: "Member identity data",
    purpose: "Know who the member is.",
    stores: [
      "name",
      "preferred name",
      "language",
      "timezone",
      "basic profile information",
      "business information",
    ],
    primaryOwner: "Spark Estate member profile (identity layer)",
    location:
      "lib/estate/sparkEstateMemberProfileEngine.ts, lib/companionStore.ts (companion-business-profile-v1)",
    usedBy: ["greetings", "personalization", "communication"],
    references: ["lib/estateMemory/estateMemoryStore.ts (displayName slice)"],
    status: "implemented",
  },
  {
    id: "member-preferences",
    layer: 2,
    title: "Member preferences",
    purpose: "Understand how the member works best.",
    stores: [
      "communication preferences",
      "learning preferences",
      "visual preferences",
      "planning preferences",
      "support preferences",
    ],
    primaryOwner: "Chamber preferences + companion prefs",
    location:
      "lib/estate/chamberOfMomentumMemory.ts, lib/companionStore.ts (companion-prefs-v1), lib/companionLanguage.ts",
    usedBy: ["conversation engine", "cards", "workflows"],
    references: ["lib/estate/sparkEstateMemberProfileEngine.ts (working-style layer)"],
    status: "implemented",
  },
  {
    id: "goals-vision",
    layer: 3,
    title: "Goals and vision",
    purpose: "Understand what matters.",
    stores: ["goals", "priorities", "desired outcomes", "long-term direction"],
    primaryOwner: "Estate memory active goals + member profile goals layer",
    location:
      "lib/estateMemory/estateMemoryStore.ts, lib/estate/sparkEstateMemberProfileEngine.ts",
    usedBy: ["recommendations", "planning", "progress support"],
    status: "implemented",
  },
  {
    id: "projects",
    layer: 4,
    title: "Projects",
    purpose: "Store active and completed work.",
    stores: [
      "project name",
      "purpose",
      "outcome",
      "milestones",
      "tasks",
      "next actions",
      "status",
      "completion history",
    ],
    primaryOwner: "Goals & Projects™ (companion projects store)",
    location:
      "lib/companionStore.ts (companion-projects-v1, companion-project-items-v1), lib/estate/chamberProjectMeta.ts",
    usedBy: ["Momentum", "wins", "memory", "Momentum Card™"],
    references: ["lib/estate/chamberOfMomentumMemory.ts (read-only snapshot)"],
    status: "implemented",
  },
  {
    id: "conversations",
    layer: 5,
    title: "Conversations",
    purpose: "Maintain continuity without storing every temporary detail.",
    stores: [
      "important discussions",
      "decisions",
      "context",
      "member preferences discovered naturally",
    ],
    primaryOwner: "Companion conversation + estate conversation digest",
    location:
      "lib/companionStore.ts (companion-conversation-v1), lib/estateMemory/estateMemoryStore.ts (conversationDigest)",
    usedBy: ["conversation engine", "personalization", "return-to-work"],
    status: "implemented",
  },
  {
    id: "cards",
    layer: 6,
    title: "Cards",
    purpose: "Generated views from approved data sources — not duplicate stores.",
    stores: [
      "Spark Card™",
      "Momentum Card™",
      "Knowledge Card™",
      "Win Card™",
      "Project Card™",
      "Reflection Card™",
    ],
    primaryOwner: "Spark Estate card ecosystem (generated)",
    location: "lib/estate/sparkEstateCardEcosystem.ts",
    usedBy: ["companion", "estate arrival", "rooms", "daily experience"],
    references: [
      "projects",
      "memory-system",
      "knowledge-library",
      "member-created-assets",
    ],
    status: "implemented",
  },
  {
    id: "knowledge-library",
    layer: 7,
    title: "Knowledge library",
    purpose: "Frameworks, templates, strategies, examples, guides, and references.",
    stores: [
      "frameworks",
      "templates",
      "strategies",
      "examples",
      "guides",
      "reference materials",
    ],
    primaryOwner: "Spark Estate knowledge and asset library architecture",
    location:
      "lib/estate/sparkEstateKnowledgeAndAssetLibraryArchitecture.ts, lib/sparkNote/catalog.ts",
    usedBy: ["rooms", "workflows", "conversations", "Knowledge Card™"],
    status: "partial",
  },
  {
    id: "member-created-assets",
    layer: 8,
    title: "Member-created assets",
    purpose: "Emails, funnels, strategies, documents, templates, plans, and projects the member created.",
    stores: [
      "owner",
      "creation date",
      "related project",
      "version history",
      "save / export / print metadata",
    ],
    primaryOwner: "Universal creation + asset library + review history",
    location:
      "lib/universalCreation/orchestrator.ts, lib/assetLibrary/assetLibraryStore.ts, lib/universalCreation/sparkEstateCompletionSystem.ts",
    usedBy: ["completion system", "My Projects", "return-to-work", "export"],
    status: "implemented",
  },
  {
    id: "memory-system",
    layer: 9,
    title: "Memory system",
    purpose: "Help Spark improve over time — useful, editable, purposeful.",
    stores: [
      "successful approaches",
      "patterns",
      "preferences",
      "important wins",
      "lessons learned",
    ],
    primaryOwner: "Chamber memory bridge + estate memory + member profile learning",
    location:
      "lib/estate/chamberOfMomentumMemory.ts, lib/estateMemory/estateMemoryStore.ts, lib/growthWinsStore.ts, lib/evidenceBankStore.ts",
    usedBy: ["personalization", "cards", "momentum", "conversation engine"],
    references: ["projects", "member-preferences", "goals-vision"],
    status: "implemented",
  },
  {
    id: "analytics",
    layer: 10,
    title: "Analytics",
    purpose: "Feature usage, workflow completion, friction points, improvement signals.",
    stores: [
      "feature usage",
      "workflow completion",
      "friction points",
      "improvement signals",
    ],
    primaryOwner: "Spark Estate analytics and learning system",
    location:
      "lib/estate/sparkEstateAnalyticsAndLearningSystem.ts, lib/companionStore.ts (companion-voice-usage-v1), lib/estate/chamberOfMomentumMemory.ts (pattern observations)",
    usedBy: ["experience improvement", "pattern learning", "founder reporting"],
    status: "implemented",
  },
] as const;

export type SparkEstateDataLayerId = (typeof SPARK_ESTATE_DATA_LAYERS)[number]["id"];

export type SparkEstateDataLayer = (typeof SPARK_ESTATE_DATA_LAYERS)[number];

export const SPARK_ESTATE_CARD_DATA_SOURCES = {
  "spark-card": [
    "discovery library (lib/sparkNote/catalog.ts)",
    "member interests (member profile)",
    "meaningful dates (profile outcomes)",
    "gratitude and meaning content (Spark Note libraries)",
  ],
  "momentum-card": [
    "active projects (companionStore)",
    "next actions (chamberProjectMeta)",
    "progress (chamber memory snapshot)",
    "goals (estate memory + profile)",
  ],
  "knowledge-card": [
    "knowledge library (templates, snippets, registrations)",
    "learning needs (routing + conversation)",
    "current context (section + text)",
  ],
  "win-card": [
    "completed work (projects)",
    "milestones (project completion)",
    "accomplishments (growthWinsStore, evidenceBankStore)",
  ],
} as const;

export const SPARK_ESTATE_TEMPORARY_DATA = [
  {
    id: "conversation-state",
    label: "Current conversation state",
    owner: "companionStore",
    location: "lib/companionStore.ts (companion-conversation-v1)",
  },
  {
    id: "creation-drafts",
    label: "Unsaved creation session",
    owner: "universalCreation orchestrator",
    location: "lib/universalCreation/orchestrator.ts (universal-creation-session-v1)",
  },
  {
    id: "brain-dump-draft",
    label: "Brain dump draft",
    owner: "companionStore",
    location: "lib/companionStore.ts (companion-brain-dump-draft-v1)",
  },
  {
    id: "session-routing",
    label: "Staged intelligence route",
    owner: "intelligence routing map",
    location: "lib/estate/sparkEstateIntelligenceRoutingMap.ts (sessionStorage)",
  },
  {
    id: "chamber-journey-session",
    label: "Chamber doorway session",
    owner: "chamber member journey",
    location: "lib/estate/chamber/chamberMemberJourney.ts (sessionStorage)",
  },
  {
    id: "daily-session",
    label: "Daily companion session",
    owner: "daily companion experience",
    location: "lib/estate/sparkEstateDailyCompanionExperience.ts",
  },
] as const;

export const SPARK_ESTATE_PERMANENT_DATA = [
  {
    id: "profile",
    label: "Member profile",
    owner: "sparkEstateMemberProfileEngine",
    location: "spark-estate-member-profile-v1",
  },
  {
    id: "projects",
    label: "Projects and tasks",
    owner: "companionStore",
    location: "companion-projects-v1",
  },
  {
    id: "saved-assets",
    label: "Saved creations and asset library",
    owner: "assetLibrary + completion system",
    location: "companion-asset-library-v1",
  },
  {
    id: "memories",
    label: "Wins, evidence, patterns, preferences",
    owner: "memory system layers",
    location: "companion-saved-growth-wins-v1, chamber preferences",
  },
  {
    id: "review-history",
    label: "Creation review history",
    owner: "completion system",
    location: SPARK_ESTATE_REVIEW_HISTORY_KEY,
  },
] as const;

export const SPARK_ESTATE_ROOM_DATA_RULES = [
  "Each room owns room identity, expertise, workflows, and room-specific settings.",
  "Each room can access member context, shared memory, and approved knowledge.",
  "Rooms must not create duplicate member profiles or separate memories.",
] as const;

export const SPARK_ESTATE_EXPORT_SAVE_RULES = [
  "Created work supports save inside Spark Estate™.",
  "Export when available (PDF, document, spreadsheet).",
  "Print-friendly output when requested.",
  "Share when collaboration is available.",
  "The member should always know where their work lives.",
] as const;

export const SPARK_ESTATE_FUNNEL_DATA_FLOW = [
  "Marketing Room creates funnel content.",
  "Saved as member-created asset (universal creation + asset library).",
  "Connected to project when needed (Goals & Projects™).",
  "Momentum tracks progress (chamber memory + Momentum Card™).",
  "Completion creates a win (growthWinsStore / evidenceBankStore).",
  "Memory learns successful approaches (chamber patterns + member profile).",
] as const;

export function getSparkEstateDataLayer(
  id: SparkEstateDataLayerId,
): SparkEstateDataLayer | null {
  return SPARK_ESTATE_DATA_LAYERS.find((layer) => layer.id === id) ?? null;
}

export function layersReferencingStore(storeKey: string): SparkEstateDataLayer[] {
  return SPARK_ESTATE_DATA_LAYERS.filter(
    (layer) =>
      layer.location.includes(storeKey) ||
      layer.references?.some((reference) => reference.includes(storeKey)),
  );
}

export function verifySparkEstateFileAndDataArchitecture(): {
  layerCount: number;
  layersMapped: boolean;
  oneSourceOfTruth: boolean;
  cardSourcesAligned: boolean;
  exportRulesAligned: boolean;
  projectsHaveSingleOwner: boolean;
} {
  const profile = verifySparkEstateMemberProfile();
  const cards = verifySparkEstateCardEcosystem();
  const projectsLayer = getSparkEstateDataLayer("projects");
  const cardsLayer = getSparkEstateDataLayer("cards");
  const assetsLayer = getSparkEstateDataLayer("member-created-assets");

  const layersMapped =
    SPARK_ESTATE_DATA_LAYERS.length === 10 &&
    SPARK_ESTATE_DATA_LAYERS.every(
      (layer) => layer.primaryOwner.length > 0 && layer.location.length > 0,
    );

  const projectsHaveSingleOwner =
    projectsLayer?.primaryOwner.includes("Goals & Projects") === true &&
    projectsLayer.references?.some((reference) =>
      reference.includes("read-only"),
    ) === true;

  const cardSourcesAligned =
    cards.cardKinds.length >= 4 &&
    Object.keys(SPARK_ESTATE_CARD_DATA_SOURCES).length === 4 &&
    cardsLayer?.references !== undefined;

  const exportRulesAligned =
    SPARK_ESTATE_EXPORT_SAVE_RULES.length >= 5 &&
    SPARK_ESTATE_OUTPUT_OPTIONS.some((option) => option.id === "save") &&
    SPARK_ESTATE_OUTPUT_OPTIONS.some((option) => option.id === "export");

  const oneSourceOfTruth =
    layersMapped &&
    projectsHaveSingleOwner &&
    profile.memberControlReady &&
    SPARK_ESTATE_TEMPORARY_DATA.length > 0 &&
    SPARK_ESTATE_PERMANENT_DATA.length > 0 &&
    assetsLayer?.status === "implemented";

  return {
    layerCount: SPARK_ESTATE_DATA_LAYERS.length,
    layersMapped,
    oneSourceOfTruth,
    cardSourcesAligned,
    exportRulesAligned,
    projectsHaveSingleOwner,
  };
}

export function formatSparkEstateFileAndDataArchitectureReport(
  verification: ReturnType<typeof verifySparkEstateFileAndDataArchitecture> = verifySparkEstateFileAndDataArchitecture(),
): string {
  const lines: string[] = [
    `Spark Estate™ file and data architecture: ${verification.oneSourceOfTruth ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_DATA_PRINCIPLE,
    SPARK_ESTATE_DATA_VISION,
    "",
    "Data layers:",
  ];

  for (const layer of SPARK_ESTATE_DATA_LAYERS) {
    lines.push(
      `  ${layer.layer}. ${layer.title} [${layer.status}]`,
      `     Owner: ${layer.primaryOwner}`,
      `     Location: ${layer.location}`,
      `     Used by: ${layer.usedBy.join(", ")}`,
    );
    if (layer.references?.length) {
      lines.push(`     References: ${layer.references.join("; ")}`);
    }
  }

  lines.push("", "Card data sources (generated — not duplicated):");
  for (const [kind, sources] of Object.entries(SPARK_ESTATE_CARD_DATA_SOURCES)) {
    lines.push(`  ${kind}:`);
    for (const source of sources) {
      lines.push(`    → ${source}`);
    }
  }

  lines.push("", "Temporary data (session / draft):");
  for (const entry of SPARK_ESTATE_TEMPORARY_DATA) {
    lines.push(`  ○ ${entry.label} — ${entry.location}`);
  }

  lines.push("", "Permanent data:");
  for (const entry of SPARK_ESTATE_PERMANENT_DATA) {
    lines.push(`  ✓ ${entry.label} — ${entry.location}`);
  }

  lines.push("", "Room data rules:");
  for (const rule of SPARK_ESTATE_ROOM_DATA_RULES) {
    lines.push(`  • ${rule}`);
  }

  lines.push("", "Data quality questions (before adding new data):");
  for (const question of SPARK_ESTATE_DATA_QUALITY_QUESTIONS) {
    lines.push(`  ? ${question}`);
  }

  lines.push("", "Example flow — member creates a funnel:");
  for (const step of SPARK_ESTATE_FUNNEL_DATA_FLOW) {
    lines.push(`  → ${step}`);
  }

  lines.push("", "Integration checks:");
  lines.push(`  Layers mapped: ${verification.layersMapped ? "pass" : "fail"}`);
  lines.push(
    `  Projects single owner: ${verification.projectsHaveSingleOwner ? "pass" : "fail"}`,
  );
  lines.push(
    `  Card sources aligned: ${verification.cardSourcesAligned ? "pass" : "fail"}`,
  );
  lines.push(
    `  Export/save rules: ${verification.exportRulesAligned ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
