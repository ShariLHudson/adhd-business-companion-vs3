/**
 * Spark Estate — room blueprint template (Phase 25).
 * Standard foundation every room must follow — different expertise, same companion experience.
 *
 * @see docs/protocols/SPARK_ESTATE_ROOM_BLUEPRINT_TEMPLATE_SPECIFICATION_PHASE25.md
 */

import type { AppSection } from "@/lib/companionUi";
import { SPARK_ESTATE_CREATION_STEPS } from "@/lib/universalCreation/sparkEstateCreationJourney";
import { CHAMBER_OF_MOMENTUM_MEMBER_NAME } from "./chamberOfMomentumIdentity";
import { CHAMBER_OF_MOMENTUM_ROOM_META } from "./chamber/chamberOfMomentumRoomRegistry";
import { ESTATE_ROOM_BG } from "./estateRoomAssets";
import { getEstateRoomById } from "./estateRoomRegistry";
import type { EstateRoomDefinition } from "./types";
import { resolveEstateRoomTemplate } from "./estateRoomTemplate/resolveEstateRoomTemplate";
import type { SparkEstateCardKind } from "./sparkEstateCardEcosystem";

export const SPARK_ESTATE_ROOM_BLUEPRINT_PRINCIPLE =
  "A room is a purpose, an intelligence, an experience, a workflow, and a connection point — not just a screen.";

export const SPARK_ESTATE_ROOM_BLUEPRINT_VISION =
  "A different workspace. Same trusted companion. Same helpful process. Different expertise.";

export const SPARK_ESTATE_ROOM_BLUEPRINT_SECTIONS = [
  { id: "identity", title: "Room Identity", fields: ["name", "purpose", "audience", "memberValue"] },
  { id: "intelligence", title: "Room Intelligence", fields: ["knowledge", "frameworks", "workflows", "templates", "examples"] },
  { id: "experience", title: "Room Experience", fields: ["visualIdentity", "entryExperience"] },
  { id: "cards", title: "Room Cards", fields: ["cards"] },
  { id: "workflows", title: "Room Workflows", fields: ["universalJourney"] },
  { id: "outputs", title: "Room Outputs", fields: ["outputs"] },
  { id: "memory", title: "Memory Connections", fields: ["memoryConnections"] },
  { id: "connections", title: "Intelligence Connections", fields: ["whenToUse", "supportingIntelligence"] },
  { id: "boundaries", title: "Room Boundaries", fields: ["doesNotDo"] },
  { id: "analytics", title: "Analytics", fields: ["successMeasures", "metrics"] },
] as const;

export type SparkEstateRoomBlueprintSectionId =
  (typeof SPARK_ESTATE_ROOM_BLUEPRINT_SECTIONS)[number]["id"];

export const SPARK_ESTATE_ROOM_WORKFLOW_STEPS = SPARK_ESTATE_CREATION_STEPS.map(
  (step) => step.id,
);

export const SPARK_ESTATE_ROOM_QUALITY_CHECKLIST = [
  "Clear purpose",
  "Unique value",
  "Correct image",
  "Correct navigation",
  "Uses Shari voice",
  "Uses universal creation process",
  "Connects to memory",
  "Uses appropriate cards",
  "Does not duplicate another room",
  "Provides member value",
] as const;

export type SparkEstateRoomCardBlueprint = {
  kind: SparkEstateCardKind;
  purpose: string;
  dataSource: string;
  trigger: string;
  action: string;
  memoryImpact: string;
};

export type SparkEstateRoomBlueprint = {
  roomId: string;
  internalName?: string;
  memberFacingName: string;
  primarySection: AppSection | null;
  additionalSections?: readonly AppSection[];
  purpose: string;
  audience: string;
  memberValue: string;
  intelligence: {
    knowledge: readonly string[];
    frameworks: readonly string[];
    workflows: readonly string[];
    templates: readonly string[];
    examples: readonly string[];
  };
  experience: {
    backgroundImage: string | null;
    atmosphere: string;
    navigationPlacement: string;
    entryWelcome: string;
    entryQuestion: string;
    firstAction: string;
  };
  cards: readonly SparkEstateRoomCardBlueprint[];
  outputs: readonly string[];
  memoryConnections: readonly string[];
  whenToUse: readonly string[];
  supportingIntelligence: readonly string[];
  doesNotDo: readonly string[];
  analytics: {
    successMeasures: readonly string[];
    metrics: readonly string[];
  };
};

const CARD_BLUEPRINTS = {
  spark: {
    kind: "spark-card" as const,
    purpose: "Daily insight and gentle encouragement at the right moment.",
    dataSource: "Spark Note catalog + member context",
    trigger: "Daily arrival, low energy, or discovery moment",
    action: "Open, reflect, save, or continue",
    memoryImpact: "Records interaction preference and topic interest",
  },
  momentum: {
    kind: "momentum-card" as const,
    purpose: "Surface the next best step on active work.",
    dataSource: "Projects, chamber memory, momentum path",
    trigger: "Active project or stalled progress",
    action: "Continue, complete small step, or connect to project",
    memoryImpact: "Updates momentum patterns and blocker observations",
  },
  knowledge: {
    kind: "knowledge-card" as const,
    purpose: "Teach one useful concept without overwhelm.",
    dataSource: "Knowledge library, templates, Institute drawers",
    trigger: "Learning intent or skill gap",
    action: "Open drawer, read guide, apply to current work",
    memoryImpact: "Tracks learning topics and successful strategies",
  },
  project: {
    kind: "project-card" as const,
    purpose: "Keep project context visible and actionable.",
    dataSource: "Goals & Projects store + chamber project meta",
    trigger: "Active focus project or return visit",
    action: "Open project, update next action, mark progress",
    memoryImpact: "Persists project state, wins, and continuity",
  },
  reflection: {
    kind: "reflection-card" as const,
    purpose: "Invite gentle review without grading.",
    dataSource: "Completion system + session context",
    trigger: "After meaningful progress or session end",
    action: "Reflect, save insight, or choose next step",
    memoryImpact: "Adds reflection notes and lessons learned",
  },
  win: {
    kind: "win-card" as const,
    purpose: "Celebrate completed work and build confidence.",
    dataSource: "Growth wins store + completion history",
    trigger: "Task or milestone completion",
    action: "Save win, share, or continue momentum",
    memoryImpact: "Strengthens progress history and encouragement patterns",
  },
};

export const SPARK_ESTATE_ROOM_BLUEPRINTS: readonly SparkEstateRoomBlueprint[] = [
  {
    roomId: "momentum-institute",
    internalName: "chamber-entry",
    memberFacingName: CHAMBER_OF_MOMENTUM_MEMBER_NAME,
    primarySection: "momentum-institute",
    additionalSections: ["chamber-of-momentum", "goals-projects"],
    purpose: CHAMBER_OF_MOMENTUM_ROOM_META.purpose,
    audience: "Members who want capability growth, next-step clarity, or entrepreneurial learning.",
    memberValue: "Discover the right drawer, build skills gradually, and leave with one useful step.",
    intelligence: {
      knowledge: [
        "Entrepreneurial capability topics across pricing, marketing, leadership, and executive function",
        "Drawer index and Knowledge Card catalog",
        "Member goals and prior learning history",
      ],
      frameworks: [
        "Chamber journey support selection",
        "Gradual learning — one drawer at a time",
        "Universal creation journey for applied work",
      ],
      workflows: [
        "Arrive → choose focus → open drawer → learn → apply → save",
        "Route to project or creation room when ready to build",
      ],
      templates: ["Institute index cards", "Knowledge Card structures", "Saved cabinet entries"],
      examples: ["Sample strategies", "Worked examples in drawers", "Member saved work"],
    },
    experience: {
      backgroundImage: CHAMBER_OF_MOMENTUM_ROOM_META.background,
      atmosphere: "Warm momentum, discovery without pressure",
      navigationPlacement: "Chamber doorway — consolidated Momentum sub-places",
      entryWelcome: CHAMBER_OF_MOMENTUM_ROOM_META.title,
      entryQuestion: "What would help you move forward today?",
      firstAction: "Offer one gentle focus choice or open the right drawer",
    },
    cards: [
      CARD_BLUEPRINTS.spark,
      CARD_BLUEPRINTS.momentum,
      CARD_BLUEPRINTS.knowledge,
      CARD_BLUEPRINTS.project,
    ],
    outputs: ["saved learning", "applied strategies", "project next actions", "cabinet entries"],
    memoryConnections: [
      "learning topics explored",
      "successful strategies",
      "project continuity",
      "energy and blocker patterns",
    ],
    whenToUse: [
      "member needs entrepreneurial learning",
      "find next step in Chamber",
      "build capability before creating",
    ],
    supportingIntelligence: [
      "Daily companion routing",
      "Member profile personalization",
      "Knowledge library retrieval",
      "Momentum Builder for projects",
    ],
    doesNotDo: [
      "Replace full content creation studio",
      "Force course-style progression",
      "Duplicate Decision Compass facilitation",
    ],
    analytics: {
      successMeasures: [
        "Member opens a relevant drawer",
        "Member applies learning to real work",
        "Member returns for next capability topic",
      ],
      metrics: ["usage", "completion", "value", "friction"],
    },
  },
  {
    roomId: "creative-studio",
    memberFacingName: "Create",
    primarySection: "content-generator",
    additionalSections: ["templates-library", "saved-work"],
    purpose: "Bring ideas to life — writing, marketing assets, workshops, and content with Spark beside you.",
    audience: "Members creating newsletters, funnels, workshops, plans, and business content.",
    memberValue: "Start faster with templates, build with guidance, and finish with clear outputs.",
    intelligence: {
      knowledge: [
        "Content types, marketing frameworks, and offer structures",
        "Member templates, snippets, and saved work",
        "Audience and goal context from profile",
      ],
      frameworks: [
        "Universal creation journey — understand through remember",
        "Shari co-creation — drafts hidden until member is ready",
        "Template-first when blank-page friction appears",
      ],
      workflows: [
        "Choose creation type → clarify goal → build in sections → review → complete",
        "Connect finished work to projects or asset library",
      ],
      templates: ["Email", "funnel", "workshop", "strategy", "content plans"],
      examples: ["Snippet library", "Template bodies", "Prior saved work"],
    },
    experience: {
      backgroundImage: ESTATE_ROOM_BG.creativeStudio,
      atmosphere: "Creative calm, possibility, craft",
      navigationPlacement: "Creation menu — content-generator route",
      entryWelcome: "Let's bring something to life together.",
      entryQuestion: "What would you like to create today?",
      firstAction: "Clarify purpose and offer the lightest starting template",
    },
    cards: [CARD_BLUEPRINTS.knowledge, CARD_BLUEPRINTS.project, CARD_BLUEPRINTS.reflection],
    outputs: ["documents", "content", "strategies", "templates", "emails", "funnels"],
    memoryConnections: [
      "creation preferences",
      "completed assets",
      "successful formats",
      "project links",
    ],
    whenToUse: [
      "write newsletter or email",
      "build workshop or funnel",
      "create marketing content",
      "make something real",
    ],
    supportingIntelligence: [
      "Momentum Institute frameworks",
      "Knowledge library templates",
      "Momentum Builder for project connection",
    ],
    doesNotDo: [
      "Replace Decision Compass for major choices",
      "Publish or send on member's behalf without confirmation",
      "Duplicate Institute teaching depth for every topic",
    ],
    analytics: {
      successMeasures: [
        "Member completes a useful draft",
        "Member saves or exports output",
        "Member connects work to a project",
      ],
      metrics: ["usage", "completion", "value", "friction"],
    },
  },
  {
    roomId: "clear-my-mind",
    memberFacingName: "Clear My Mind",
    primarySection: "brain-dump",
    purpose: "Continuous thought capture — empty the head without organizing pressure.",
    audience: "Members feeling scattered, overwhelmed, or full of unprocessed thoughts.",
    memberValue: "Immediate relief, mental spaciousness, and captured thoughts for later.",
    intelligence: {
      knowledge: [
        "Brain dump capture patterns",
        "Member energy and overwhelm signals",
        "Prior dumps and themes (when saved)",
      ],
      frameworks: [
        "Listen first — organize later",
        "No required structure on entry",
        "Gentle follow-up only when member asks",
      ],
      workflows: ["Unload → capture → optional sort later → route to next helpful room"],
      templates: ["Freeform capture", "Optional journal prompts"],
      examples: ["Prior brain dumps", "Peaceful restoration paths"],
    },
    experience: {
      backgroundImage: ESTATE_ROOM_BG.butterflyConservatory,
      atmosphere: "Relief, lightness, mental spaciousness",
      navigationPlacement: "Reflection routes — brain-dump section",
      entryWelcome: "You can put it all here — nothing needs to be finished.",
      entryQuestion: "What's on your mind?",
      firstAction: "Capture thoughts without categorizing",
    },
    cards: [CARD_BLUEPRINTS.spark, CARD_BLUEPRINTS.reflection],
    outputs: ["brain dump entries", "journal notes", "clarity for next room"],
    memoryConnections: [
      "overwhelm patterns",
      "restoration preferences",
      "themes from prior dumps",
    ],
    whenToUse: [
      "clear my head",
      "too much in my mind",
      "scattered thoughts",
      "need restoration before productivity",
    ],
    supportingIntelligence: [
      "Peaceful Places for restoration",
      "Decision Compass after clarity emerges",
      "Chamber when ready for next step",
    ],
    doesNotDo: [
      "Force immediate organization",
      "Replace therapy or crisis support",
      "Push productivity before relief",
    ],
    analytics: {
      successMeasures: [
        "Member captures thoughts without abandoning",
        "Member reports feeling lighter",
        "Member routes to helpful next room when ready",
      ],
      metrics: ["usage", "completion", "value", "friction"],
    },
  },
  {
    roomId: "decision-compass",
    memberFacingName: "Decision Compass",
    primarySection: "decision-compass",
    purpose: "Think through decisions with clarity — options, values, and next steps without pressure.",
    audience: "Members stuck between options or facing meaningful choices.",
    memberValue: "Steadiness, named tradeoffs, and an owned decision — not advice imposed.",
    intelligence: {
      knowledge: [
        "Decision frameworks and values clarification",
        "Member goals and constraints",
        "Research from Observatory when relevant",
      ],
      frameworks: [
        "Illuminate choices — member owns the decision",
        "Options → values → tradeoffs → next step",
        "Universal creation journey for decision records",
      ],
      workflows: [
        "Name the decision → explore options → check values → choose → define next step",
      ],
      templates: ["Decision record", "Options comparison", "Next-step plan"],
      examples: ["Prior decisions", "Observatory research summaries"],
    },
    experience: {
      backgroundImage: ESTATE_ROOM_BG.decisionCompass,
      atmosphere: "Steadiness, clarity, ownership",
      navigationPlacement: "Planning menu — decision-compass route",
      entryWelcome: "Let's think this through together — you stay in charge of the choice.",
      entryQuestion: "What decision are you working through?",
      firstAction: "Name the decision and surface options without rushing",
    },
    cards: [CARD_BLUEPRINTS.knowledge, CARD_BLUEPRINTS.reflection, CARD_BLUEPRINTS.project],
    outputs: ["decision records", "plans", "next actions", "clarity notes"],
    memoryConnections: [
      "decision patterns",
      "values themes",
      "successful decision approaches",
      "lessons learned",
    ],
    whenToUse: [
      "stuck between options",
      "big decision",
      "which path should I take",
      "need clarity before building",
    ],
    supportingIntelligence: [
      "Observatory for research",
      "Momentum Builder for execution",
      "Create room for building after deciding",
    ],
    doesNotDo: [
      "Make the decision for the member",
      "Replace legal, financial, or medical advice",
      "Duplicate brain dump capture",
    ],
    analytics: {
      successMeasures: [
        "Member names a clear decision",
        "Member selects a path they own",
        "Member leaves with a next step",
      ],
      metrics: ["usage", "completion", "value", "friction"],
    },
  },
  {
    roomId: "momentum-builder",
    memberFacingName: "Momentum Builder",
    primarySection: "momentum-builder",
    additionalSections: ["goals-projects", "grow-momentum-builders"],
    purpose: "Turn goals into projects with milestones, tasks, and visible momentum.",
    audience: "Members ready to plan, execute, and track meaningful work.",
    memberValue: "Clear project structure, next actions, and proof of progress over time.",
    intelligence: {
      knowledge: [
        "Active and completed projects",
        "Milestones, tasks, and momentum path",
        "Wins and blocker history",
      ],
      frameworks: [
        "Small-first-step momentum",
        "Project engine with focus states",
        "Universal creation for project artifacts",
      ],
      workflows: [
        "Define goal → break into milestones → choose next action → build momentum → celebrate wins",
      ],
      templates: ["Project plan", "Milestone map", "Next-action card"],
      examples: ["Demo Alex scenario", "Prior project patterns", "Easy wins"],
    },
    experience: {
      backgroundImage: ESTATE_ROOM_BG.momentumBuilder,
      atmosphere: "Forward motion, achievable progress, earned wins",
      navigationPlacement: "Chamber sub-place and goals-projects routes",
      entryWelcome: "Let's see what you're building and what would help today.",
      entryQuestion: "What project needs your attention?",
      firstAction: "Surface active focus project or invite a small first step",
    },
    cards: [
      CARD_BLUEPRINTS.momentum,
      CARD_BLUEPRINTS.project,
      CARD_BLUEPRINTS.win,
      CARD_BLUEPRINTS.reflection,
    ],
    outputs: ["projects", "milestones", "tasks", "plans", "momentum records"],
    memoryConnections: [
      "project state",
      "completed work",
      "successful strategies",
      "wins and progress history",
    ],
    whenToUse: [
      "work on active project",
      "define next action",
      "track milestones",
      "build momentum on goals",
    ],
    supportingIntelligence: [
      "Chamber of Momentum routing",
      "Create room for deliverables",
      "Decision Compass for priority choices",
    ],
    doesNotDo: [
      "Replace Institute learning depth",
      "Overwhelm with full project dashboards on entry",
      "Duplicate daily companion greeting",
    ],
    analytics: {
      successMeasures: [
        "Member completes a next action",
        "Member returns to project continuity",
        "Member records a win",
      ],
      metrics: ["usage", "completion", "value", "friction"],
    },
  },
];

const BLUEPRINT_BY_ID = new Map(
  SPARK_ESTATE_ROOM_BLUEPRINTS.map((blueprint) => [blueprint.roomId, blueprint]),
);

export function listSparkEstateRoomBlueprints(): readonly SparkEstateRoomBlueprint[] {
  return SPARK_ESTATE_ROOM_BLUEPRINTS;
}

export function getSparkEstateRoomBlueprint(
  roomId: string,
): SparkEstateRoomBlueprint | null {
  return BLUEPRINT_BY_ID.get(roomId) ?? null;
}

export function validateSparkEstateRoomBlueprint(
  blueprint: SparkEstateRoomBlueprint,
): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!blueprint.memberFacingName.trim()) missing.push("memberFacingName");
  if (!blueprint.purpose.trim()) missing.push("purpose");
  if (!blueprint.audience.trim()) missing.push("audience");
  if (!blueprint.memberValue.trim()) missing.push("memberValue");
  if (blueprint.intelligence.knowledge.length === 0) missing.push("intelligence.knowledge");
  if (blueprint.intelligence.frameworks.length === 0) missing.push("intelligence.frameworks");
  if (blueprint.cards.length === 0) missing.push("cards");
  if (blueprint.outputs.length === 0) missing.push("outputs");
  if (blueprint.memoryConnections.length === 0) missing.push("memoryConnections");
  if (blueprint.whenToUse.length === 0) missing.push("whenToUse");
  if (blueprint.doesNotDo.length === 0) missing.push("doesNotDo");
  if (!blueprint.experience.entryWelcome.trim()) missing.push("experience.entryWelcome");
  if (!blueprint.experience.entryQuestion.trim()) missing.push("experience.entryQuestion");
  if (blueprint.analytics.successMeasures.length === 0) {
    missing.push("analytics.successMeasures");
  }

  const workflowAligned = SPARK_ESTATE_ROOM_WORKFLOW_STEPS.length === 8;
  if (!workflowAligned) missing.push("universalWorkflow");

  for (const card of blueprint.cards) {
    if (!card.purpose || !card.dataSource || !card.trigger || !card.action) {
      missing.push(`card:${card.kind}`);
    }
  }

  return { valid: missing.length === 0, missing };
}

export function assessSparkEstateRoomBlueprintCompliance(roomId: string): {
  roomId: string;
  hasBlueprint: boolean;
  registryAligned: boolean;
  templateAligned: boolean;
  imageConfigured: boolean;
  navigationAligned: boolean;
  issues: string[];
} {
  const blueprint = getSparkEstateRoomBlueprint(roomId);
  const registry = getEstateRoomById(roomId);
  const template = resolveEstateRoomTemplate(roomId);
  const issues: string[] = [];

  if (!blueprint) {
    return {
      roomId,
      hasBlueprint: false,
      registryAligned: false,
      templateAligned: false,
      imageConfigured: false,
      navigationAligned: false,
      issues: ["no blueprint defined"],
    };
  }

  const validation = validateSparkEstateRoomBlueprint(blueprint);
  if (!validation.valid) {
    issues.push(...validation.missing.map((field) => `blueprint missing ${field}`));
  }

  if (registry) {
    if (
      registry.trademark &&
      !registry.trademark.includes(blueprint.memberFacingName.replace("", "")) &&
      !blueprint.memberFacingName.includes(registry.name)
    ) {
      issues.push("member-facing name may not match registry trademark");
    }
    if (registry.route && blueprint.primarySection && registry.route !== blueprint.primarySection) {
      issues.push("primary section does not match registry route");
    }
  } else {
    issues.push("room not found in estate registry");
  }

  const templateAligned =
    Boolean(template.hero.title) &&
    Boolean(template.hero.purpose || template.welcome.shariLine);
  if (!templateAligned) {
    issues.push("estate room template incomplete");
  }

  const imageConfigured = Boolean(
    blueprint.experience.backgroundImage ||
      registry?.backgroundImage ||
      registry?.intendedBackgroundImage,
  );
  if (!imageConfigured) {
    issues.push("room image not configured");
  }

  const navigationAligned = Boolean(
    blueprint.primarySection || (registry?.routes?.length ?? 0) > 0,
  );
  if (!navigationAligned) {
    issues.push("navigation placement not defined");
  }

  return {
    roomId,
    hasBlueprint: true,
    registryAligned: registry !== null && issues.every((issue) => !issue.includes("registry")),
    templateAligned,
    imageConfigured,
    navigationAligned,
    issues,
  };
}

export function buildSparkEstateRoomBlueprintDraft(
  room: EstateRoomDefinition,
): SparkEstateRoomBlueprint {
  const template = resolveEstateRoomTemplate(room.id);

  return {
    roomId: room.id,
    memberFacingName: room.trademark ?? room.name,
    primarySection: room.route,
    additionalSections: room.routes,
    purpose: room.purpose,
    audience: room.whatMembersDo,
    memberValue: room.emotionalFeeling,
    intelligence: {
      knowledge: [...room.whenToRecommend],
      frameworks: ["Universal creation journey", "Shari companion voice"],
      workflows: [room.whatMembersDo],
      templates: [],
      examples: [...room.estateIntelligenceExamples],
    },
    experience: {
      backgroundImage: room.backgroundImage ?? room.intendedBackgroundImage ?? null,
      atmosphere: room.emotionalFeeling,
      navigationPlacement: room.route ?? room.routes?.[0] ?? "estate menu",
      entryWelcome: template.welcome.shariLine,
      entryQuestion: "What would help you most here?",
      firstAction: room.whatShariDoes,
    },
    cards: [CARD_BLUEPRINTS.spark],
    outputs: ["member-created work"],
    memoryConnections: ["preferences", "progress", "completed work"],
    whenToUse: [...room.whenToRecommend],
    supportingIntelligence: [...room.relatedRoomIds],
    doesNotDo: ["Duplicate another room's primary purpose"],
    analytics: {
      successMeasures: ["Member returns with value", "Member completes meaningful work"],
      metrics: ["usage", "completion", "value", "friction"],
    },
  };
}

export function sparkEstateRoomBlueprintCompanionHint(input?: {
  roomId?: string;
  text?: string;
}): string | null {
  const text = input?.text?.trim().toLowerCase() ?? "";
  const roomId = input?.roomId;
  const blueprint = roomId ? getSparkEstateRoomBlueprint(roomId) : null;

  if (
    text &&
    /new room|room blueprint|design a room|add a room/.test(text)
  ) {
    return (
      `SPARK ESTATE ROOM BLUEPRINT: ${SPARK_ESTATE_ROOM_BLUEPRINT_PRINCIPLE} ` +
      `Define identity, intelligence, experience, cards, workflows, outputs, memory, connections, boundaries, and analytics. ` +
      `Follow the universal journey: ${SPARK_ESTATE_ROOM_WORKFLOW_STEPS.join(" → ")}.`
    );
  }

  if (!blueprint) return null;

  return (
    `SPARK ESTATE ROOM (${blueprint.memberFacingName}): ${blueprint.purpose} ` +
    `Ask: "${blueprint.experience.entryQuestion}" ` +
    `First: ${blueprint.experience.firstAction}. ` +
    `Do not: ${blueprint.doesNotDo[0] ?? "duplicate another room"}.`
  );
}

export function verifySparkEstateRoomBlueprintTemplate(): {
  sections: number;
  workflowSteps: number;
  qualityChecklist: number;
  blueprintCount: number;
  allBlueprintsValid: boolean;
  demoRoomsCompliant: boolean;
  creationJourneyAligned: boolean;
} {
  const validations = SPARK_ESTATE_ROOM_BLUEPRINTS.map(validateSparkEstateRoomBlueprint);
  const demoRoomIds = [
    "momentum-institute",
    "creative-studio",
    "clear-my-mind",
    "decision-compass",
    "momentum-builder",
  ];
  const compliance = demoRoomIds.map((roomId) =>
    assessSparkEstateRoomBlueprintCompliance(roomId),
  );

  return {
    sections: SPARK_ESTATE_ROOM_BLUEPRINT_SECTIONS.length,
    workflowSteps: SPARK_ESTATE_ROOM_WORKFLOW_STEPS.length,
    qualityChecklist: SPARK_ESTATE_ROOM_QUALITY_CHECKLIST.length,
    blueprintCount: SPARK_ESTATE_ROOM_BLUEPRINTS.length,
    allBlueprintsValid: validations.every((result) => result.valid),
    demoRoomsCompliant: compliance.every(
      (result) => result.hasBlueprint && result.registryAligned && result.navigationAligned,
    ),
    creationJourneyAligned:
      SPARK_ESTATE_ROOM_WORKFLOW_STEPS[0] === "understand" &&
      SPARK_ESTATE_ROOM_WORKFLOW_STEPS[7] === "remember",
  };
}

export function formatSparkEstateRoomBlueprintReport(
  verification: ReturnType<typeof verifySparkEstateRoomBlueprintTemplate> = verifySparkEstateRoomBlueprintTemplate(),
): string {
  const lines: string[] = [
    `Spark Estate room blueprint: ${verification.allBlueprintsValid ? "ALIGNED" : "GAPS"}`,
    SPARK_ESTATE_ROOM_BLUEPRINT_PRINCIPLE,
    SPARK_ESTATE_ROOM_BLUEPRINT_VISION,
    "",
    "Blueprint sections:",
  ];

  for (const section of SPARK_ESTATE_ROOM_BLUEPRINT_SECTIONS) {
    lines.push(`  ${section.title} — ${section.fields.join(", ")}`);
  }

  lines.push("", "Universal room workflow:");
  lines.push(`  ${SPARK_ESTATE_ROOM_WORKFLOW_STEPS.join(" → ")}`);

  lines.push("", "Quality checklist:");
  for (const item of SPARK_ESTATE_ROOM_QUALITY_CHECKLIST) {
    lines.push(`  ✓ ${item}`);
  }

  lines.push("", "Registered room blueprints:");
  for (const blueprint of SPARK_ESTATE_ROOM_BLUEPRINTS) {
    lines.push(
      `  ${blueprint.memberFacingName} (${blueprint.roomId})`,
      `    Purpose: ${blueprint.purpose}`,
      `    Cards: ${blueprint.cards.map((card) => card.kind).join(", ")}`,
      `    Outputs: ${blueprint.outputs.join(", ")}`,
    );
  }

  lines.push("", "Integration checks:");
  lines.push(`  Sections: ${verification.sections}`);
  lines.push(`  Workflow steps: ${verification.workflowSteps}`);
  lines.push(`  Quality checklist: ${verification.qualityChecklist}`);
  lines.push(`  Blueprints: ${verification.blueprintCount}`);
  lines.push(`  All valid: ${verification.allBlueprintsValid ? "pass" : "fail"}`);
  lines.push(`  Demo rooms: ${verification.demoRoomsCompliant ? "pass" : "fail"}`);
  lines.push(
    `  Creation journey aligned: ${verification.creationJourneyAligned ? "pass" : "fail"}`,
  );

  return lines.join("\n");
}
