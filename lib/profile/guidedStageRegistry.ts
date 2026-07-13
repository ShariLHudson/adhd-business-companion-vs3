/**
 * Stage registries for Business Estate areas + People I Help.
 * Organizes existing fields only — does not add profile questions.
 */

import type {
  GuidedAreaStages,
  GuidedStageAreaId,
  GuidedStageDefinition,
} from "@/lib/profile/guidedStageTypes";
import {
  GUIDED_QUICK_START_DONE_MESSAGE,
  MAX_PRIMARY_QUESTIONS_PER_STAGE,
} from "@/lib/profile/guidedStageTypes";

function stage(def: GuidedStageDefinition): GuidedStageDefinition {
  if (def.fieldPaths.length > MAX_PRIMARY_QUESTIONS_PER_STAGE) {
    throw new Error(
      `Stage ${def.id} has ${def.fieldPaths.length} primary fields (max ${MAX_PRIMARY_QUESTIONS_PER_STAGE})`,
    );
  }
  return def;
}

const IDENTITY_STAGES: GuidedAreaStages = {
  areaId: "identity",
  title: "Identity Office",
  quickStartFieldPaths: [
    "identity.businessName",
    "identity.shortDescription",
    "identity.businessStage",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "identity-basics",
      areaId: "identity",
      title: "Business Basics",
      description: "A clear name, what you do, and where you are.",
      fieldPaths: [
        "identity.businessName",
        "identity.shortDescription",
        "identity.businessStage",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "identity-purpose",
      areaId: "identity",
      title: "Purpose",
      description: "Who you help, why you're here, and what matters.",
      fieldPaths: [
        "people-i-help.link",
        "identity.mission",
        "identity.whyBusinessMatters",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "identity-direction",
      areaId: "identity",
      title: "Direction",
      description: "Vision, values, and what you hope to be known for.",
      fieldPaths: [
        "identity.vision",
        "identity.coreValues",
        "identity.hopedImpact",
      ],
      priority: "deeper",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

const OFFERS_STAGES: GuidedAreaStages = {
  areaId: "offers",
  title: "Offer Suite",
  quickStartFieldPaths: [
    "offers.mainOffer",
    "offers.problemsSolved",
    "offers.outcomesCreated",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "offers-main",
      areaId: "offers",
      title: "Main Offer",
      description: "What you offer and who it serves.",
      fieldPaths: [
        "offers.mainOffer",
        "offers.products",
        "offers.services",
        "people-i-help.link",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "offers-problems-outcomes",
      areaId: "offers",
      title: "Problems and Outcomes",
      description: "What you solve and what changes for the people you help.",
      fieldPaths: ["offers.problemsSolved", "offers.outcomesCreated"],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "offers-future",
      areaId: "offers",
      title: "Future Offers",
      description: "What you're developing — only what applies.",
      fieldPaths: ["offers.offersInDevelopment"],
      conditionalFieldPaths: [
        "offers.programs",
        "offers.workshops",
        "offers.memberships",
        "offers.speakingTopics",
      ],
      priority: "deeper",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

const BRAND_STAGES: GuidedAreaStages = {
  areaId: "brand",
  title: "Brand Studio",
  quickStartFieldPaths: [
    "brand.brandPersonality",
    "brand.tone",
    "brand.valuesToReflect",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "brand-personality",
      areaId: "brand",
      title: "Personality and Tone",
      description: "How your business feels when someone meets it.",
      fieldPaths: [
        "brand.brandPersonality",
        "brand.tone",
        "brand.valuesToReflect",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "brand-messages",
      areaId: "brand",
      title: "Messages and Language",
      description: "What you say — and what you avoid.",
      fieldPaths: [
        "brand.keyMessages",
        "brand.wordsToUse",
        "brand.wordsToAvoid",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "brand-visual",
      areaId: "brand",
      title: "Visual Style and Boundaries",
      description: "Look, feel, and content boundaries.",
      fieldPaths: [
        "brand.brandColors",
        "brand.visualPreferences",
        "brand.contentBoundaries",
      ],
      priority: "deeper",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

const DIRECTION_STAGES: GuidedAreaStages = {
  areaId: "direction",
  title: "Strategy Desk",
  quickStartFieldPaths: [
    "direction.currentPriority",
    "direction.mainProject",
    "direction.nextMilestone",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "direction-focus",
      areaId: "direction",
      title: "Current Focus",
      description: "What matters most right now.",
      fieldPaths: [
        "direction.currentPriority",
        "direction.mainProject",
        "direction.nextMilestone",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "direction-decisions",
      areaId: "direction",
      title: "Decisions and Challenges",
      description: "Open questions, friction, and ideas in play.",
      fieldPaths: [
        "direction.openDecisions",
        "direction.currentChallenges",
        "direction.ideasConsidering",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "direction-success",
      areaId: "direction",
      title: "Direction and Success",
      description: "Where you're headed and what success looks like.",
      fieldPaths: [
        "direction.currentGoals",
        "direction.successLooksLike",
        "direction.ideasParked",
      ],
      priority: "deeper",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

const WORK_STYLE_STAGES: GuidedAreaStages = {
  areaId: "work-style",
  title: "Working Style Study",
  quickStartFieldPaths: [
    "work-style.preferredTimeOfDay",
    "work-style.commonFriction",
    "work-style.shariSupportStyle",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "work-style-how",
      areaId: "work-style",
      title: "How You Work",
      description: "When and how work feels easier.",
      fieldPaths: [
        "work-style.preferredTimeOfDay",
        "work-style.preferredSessionLength",
        "work-style.soundPreference",
        "work-style.structurePreference",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "work-style-friction",
      areaId: "work-style",
      title: "Friction and Overwhelm",
      description: "What gets in the way — and what helps you restart.",
      fieldPaths: [
        "work-style.commonFriction",
        "work-style.energyPatterns",
        "work-style.overwhelmTriggers",
        "work-style.restartHelpers",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "work-style-shari",
      areaId: "work-style",
      title: "How Shari Should Help",
      description: "Support that feels helpful, not pushy.",
      fieldPaths: [
        "work-style.shariSupportStyle",
        "work-style.shariShouldAvoid",
        "work-style.returnOfferPreferences",
        "work-style.decisionStyle",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "work-style-additional",
      areaId: "work-style",
      title: "Additional Preferences",
      description: "Optional details — only if useful.",
      fieldPaths: [
        "work-style.communicationPreferences",
        "work-style.reminderPreferences",
        "work-style.thinkingOrderPreference",
        "work-style.collaborationPreference",
      ],
      priority: "deeper",
      optional: true,
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

const TOOLS_STAGES: GuidedAreaStages = {
  areaId: "tools",
  title: "Systems Desk",
  quickStartFieldPaths: [
    "tools.websitePlatform",
    "tools.calendar",
    "tools.fileStorage",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "tools-core",
      areaId: "tools",
      title: "Core Tools",
      description: "Website, calendar, and files — or not yet.",
      fieldPaths: [
        "tools.websitePlatform",
        "tools.calendar",
        "tools.fileStorage",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "tools-business",
      areaId: "tools",
      title: "Business Tools",
      description: "Design, social, and payment — only what you use.",
      fieldPaths: [
        "tools.designTools",
        "tools.socialPlatforms",
        "tools.paymentTools",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "tools-other",
      areaId: "tools",
      title: "Other Systems and Simplification",
      description: "Anything else — and what feels tangled.",
      fieldPaths: ["tools.otherSystems"],
      priority: "deeper",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

const PEOPLE_I_HELP_STAGES: GuidedAreaStages = {
  areaId: "people-i-help",
  title: "People I Help",
  quickStartFieldPaths: [
    "people-i-help.who",
    "people-i-help.painPoints",
    "people-i-help.goals",
  ],
  quickStartMessage: GUIDED_QUICK_START_DONE_MESSAGE,
  stages: [
    stage({
      id: "people-who",
      areaId: "people-i-help",
      title: "Who They Are",
      description: "A clear picture of the person you most enjoy helping.",
      fieldPaths: [
        "people-i-help.who",
        "people-i-help.name",
        "people-i-help.tagline",
      ],
      priority: "quick_start",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "people-need",
      areaId: "people-i-help",
      title: "What They Need",
      description: "Problems, friction, and the change they want.",
      fieldPaths: [
        "people-i-help.painPoints",
        "people-i-help.currentBehavior",
        "people-i-help.solution",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "people-motivate",
      areaId: "people-i-help",
      title: "What Motivates Them",
      description: "Goals, motivations, and what helps them decide.",
      fieldPaths: [
        "people-i-help.goals",
        "people-i-help.motivations",
        "people-i-help.triggers",
      ],
      priority: "standard",
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
    stage({
      id: "people-decide",
      areaId: "people-i-help",
      title: "How They Decide and Learn",
      description: "Objections, learning style, and how they show up.",
      fieldPaths: [
        "people-i-help.objections",
        "people-i-help.contentPrefs",
        "people-i-help.behaviorTraits",
      ],
      priority: "deeper",
      optional: true,
      completionMessage:
        "This is enough for Shari to begin helping with this area.",
    }),
  ],
};

export const GUIDED_AREA_STAGES: Record<GuidedStageAreaId, GuidedAreaStages> = {
  identity: IDENTITY_STAGES,
  offers: OFFERS_STAGES,
  brand: BRAND_STAGES,
  direction: DIRECTION_STAGES,
  "work-style": WORK_STYLE_STAGES,
  tools: TOOLS_STAGES,
  "people-i-help": PEOPLE_I_HELP_STAGES,
};

export function getGuidedAreaStages(
  areaId: GuidedStageAreaId,
): GuidedAreaStages {
  return GUIDED_AREA_STAGES[areaId];
}

export function listAllGuidedStages(): GuidedStageDefinition[] {
  return Object.values(GUIDED_AREA_STAGES).flatMap((area) => [...area.stages]);
}

export function getGuidedStageById(
  stageId: string,
): GuidedStageDefinition | undefined {
  return listAllGuidedStages().find((s) => s.id === stageId);
}

/** Assert every stage stays within the four-question limit. */
export function assertStagesWithinQuestionLimit(): {
  ok: boolean;
  violations: string[];
} {
  const violations = listAllGuidedStages()
    .filter((s) => s.fieldPaths.length > MAX_PRIMARY_QUESTIONS_PER_STAGE)
    .map((s) => `${s.id} (${s.fieldPaths.length})`);
  return { ok: violations.length === 0, violations };
}

/**
 * Resolve which offer-type conditional fields to show.
 * Shows a field if it already has a value, or if sibling future-offer fields are used.
 */
export function resolveConditionalOfferFields(
  values: Record<string, string>,
): string[] {
  const conditional = [
    "programs",
    "workshops",
    "memberships",
    "speakingTopics",
  ] as const;
  const anyFilled = conditional.some((k) => (values[k] ?? "").trim());
  const developing = (values.offersInDevelopment ?? "").trim();
  if (!anyFilled && !developing) return [];
  // Always allow editing ones that already have content; surface empty siblings
  // only when the member is already describing future offers.
  if (developing || anyFilled) {
    return conditional.map((k) => `offers.${k}`);
  }
  return [];
}
