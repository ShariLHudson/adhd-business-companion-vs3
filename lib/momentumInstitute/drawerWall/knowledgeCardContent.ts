/**
 * Knowledge Card™ learning body — catalog-driven placeholders until CMS loads.
 */

import type {
  InstituteDrawerDefinition,
  KnowledgeCardDefinition,
  LearningExperienceTypeId,
} from "@/lib/sparkMomentumInstitute/types";
import { getDepartmentById } from "@/lib/momentumInstitute/catalog/provider";

export type KnowledgeCardLearningContent = {
  introduction: string;
  objectives: string[];
  mainContent: string;
  reflectionQuestions: string[];
  relatedResources: string[];
};

const DIFFICULTY_LABELS = {
  foundational: "Foundational",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
} as const;

export function knowledgeCardDifficultyLabel(
  card: KnowledgeCardDefinition,
): string {
  const level = card.metadata?.difficulty ?? "foundational";
  return DIFFICULTY_LABELS[level];
}

export function knowledgeCardCompetencyLabel(
  card: KnowledgeCardDefinition,
  drawer: InstituteDrawerDefinition,
): string {
  const department = getDepartmentById(card.departmentId);
  return department?.title ?? drawer.title;
}

export function resolveKnowledgeCardLearningContent(
  card: KnowledgeCardDefinition,
  drawer: InstituteDrawerDefinition,
): KnowledgeCardLearningContent {
  const competency = knowledgeCardCompetencyLabel(card, drawer);
  const description =
    card.description?.trim() ||
    card.summary ||
    `A curated look at ${card.title} for entrepreneurs who want capability, not noise.`;

  return {
    introduction: description,
    objectives: [
      `Understand ${card.title} in plain language you can use tomorrow.`,
      `Connect ${card.title} to ${competency} decisions in your business.`,
      `Leave with one reflection or action that fits how you actually work.`,
    ],
    mainContent: [
      `This Knowledge Card™ lives in the **${drawer.title}** drawer — one idea at a time,`,
      `so you can build ${competency} without drowning in content.`,
      "",
      "Full lesson experiences — Business Mastery Minutes™, Deep Lessons™, Labs, and more —",
      "open here when you are ready. Shari stays with you in the conversation panel.",
    ].join("\n"),
    reflectionQuestions: [
      `Where does ${card.title} show up in your business today?`,
      "What would change if you applied one idea from this card this week?",
      "What feels unclear — and what would help you take the next small step?",
    ],
    relatedResources: [
      `${drawer.title} drawer — explore neighboring index cards`,
      "My Institute Cabinet™ — cards you have filed for later",
      "Growth Profile™ — capability earned through learning, reflection, and use",
    ],
  };
}

export type InstituteLearningActionId =
  | "business_mastery_minute"
  | "deep_lesson"
  | "business_lab"
  | "simulation"
  | "challenge"
  | "worksheet"
  | "template"
  | "apply_to_my_business"
  | "discuss_with_shari"
  | "save_to_cabinet";

export type InstituteLearningAction = {
  id: InstituteLearningActionId;
  label: string;
  available: boolean;
  note?: string;
};

const ACTION_LABELS: Record<InstituteLearningActionId, string> = {
  business_mastery_minute: "Business Mastery Minute™",
  deep_lesson: "Deep Lesson™",
  business_lab: "Business Lab™",
  simulation: "Simulation™",
  challenge: "Challenge™",
  worksheet: "Worksheet™",
  template: "Template™",
  apply_to_my_business: "Make It Mine™",
  discuss_with_shari: "Discuss with Shari™",
  save_to_cabinet: "Save to My Institute Cabinet™",
};

const EXPERIENCE_TO_ACTION: Partial<
  Record<LearningExperienceTypeId, InstituteLearningActionId>
> = {
  business_mastery_minute: "business_mastery_minute",
  deep_lesson: "deep_lesson",
  business_lab: "business_lab",
  simulation: "simulation",
  challenge: "challenge",
  apply_to_my_business: "apply_to_my_business",
};

export function resolveLearningPanelActions(
  card: KnowledgeCardDefinition,
  experienceKinds: LearningExperienceTypeId[],
): InstituteLearningAction[] {
  const availableKinds = new Set(experienceKinds);
  const experienceActions: InstituteLearningActionId[] = [
    "business_mastery_minute",
    "deep_lesson",
    "business_lab",
    "simulation",
    "challenge",
    "worksheet",
    "template",
    "apply_to_my_business",
  ];

  const actions: InstituteLearningAction[] = experienceActions.map((id) => {
    const fromExperience = Object.entries(EXPERIENCE_TO_ACTION).find(
      ([, actionId]) => actionId === id,
    )?.[0] as LearningExperienceTypeId | undefined;
    const available = fromExperience
      ? availableKinds.has(fromExperience)
      : false;
    return {
      id,
      label: ACTION_LABELS[id],
      available,
      note: available ? undefined : "Coming soon",
    };
  });

  actions.push({
    id: "discuss_with_shari",
    label: ACTION_LABELS.discuss_with_shari,
    available: true,
  });
  actions.push({
    id: "save_to_cabinet",
    label: ACTION_LABELS.save_to_cabinet,
    available: true,
  });

  return actions;
}

export type RelatedLearningItem = {
  label: string;
  kind:
    | "knowledge_card"
    | "apprenticeship"
    | "business_lab"
    | "competency"
    | "challenge";
};

export function resolveRelatedLearning(
  card: KnowledgeCardDefinition,
  drawer: InstituteDrawerDefinition,
): RelatedLearningItem[] {
  const competency = knowledgeCardCompetencyLabel(card, drawer);
  const relatedCards =
    card.relatedKnowledgeCardIds?.length ??
    card.suggestedNextKnowledgeCardIds?.length ??
    0;

  return [
    {
      kind: "knowledge_card",
      label:
        relatedCards > 0
          ? `Related Knowledge Cards™ in ${drawer.title}`
          : `More Knowledge Cards™ in ${drawer.title}`,
    },
    {
      kind: "apprenticeship",
      label: `Apprenticeships™ for ${competency}`,
    },
    {
      kind: "business_lab",
      label: `Business Labs™ — apply ${card.title}`,
    },
    {
      kind: "competency",
      label: `Competency: ${competency}`,
    },
    {
      kind: "challenge",
      label: `Challenges™ — practice ${card.title}`,
    },
  ];
}

export const INSTITUTE_COMPLETION_LINES = [
  "Nice work.",
  "You're building another important capability.",
  "Would you like to continue exploring this topic or apply what you've learned?",
] as const;
