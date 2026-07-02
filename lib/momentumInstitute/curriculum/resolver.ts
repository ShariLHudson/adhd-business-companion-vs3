/**
 * Resolve curriculum content for delivery components and learning panel.
 */

import type {
  InstituteDrawerDefinition,
  KnowledgeCardDefinition,
} from "@/lib/sparkMomentumInstitute/types";
import type { KnowledgeCardLearningContent } from "@/lib/momentumInstitute/drawerWall/knowledgeCardContent";
import {
  getCurriculumKnowledgeCardDocument,
  listCurriculumRegistryEntries,
} from "./registry";
import { curriculumDifficultyLabel } from "./compiler";
import type {
  BusinessMasteryMinuteModel,
  CurriculumKnowledgeCardDocument,
  KnowledgeCardViewerModel,
} from "./types";

export function hasCurriculumDocument(cardId: string): boolean {
  return getCurriculumKnowledgeCardDocument(cardId) != null;
}

export function resolveCurriculumDocumentForCard(
  cardId: string,
): CurriculumKnowledgeCardDocument | null {
  return getCurriculumKnowledgeCardDocument(cardId);
}

export function resolveKnowledgeCardViewerModel(
  cardId: string,
  drawer?: InstituteDrawerDefinition,
): KnowledgeCardViewerModel | null {
  const doc = getCurriculumKnowledgeCardDocument(cardId);
  if (!doc || doc.metadata.status !== "published") return null;

  return {
    metadata: doc.metadata,
    body: doc.body,
    drawerLabel: drawer?.title ?? titleCase(doc.metadata.drawer),
    departmentLabel: titleCase(doc.metadata.department),
    competencyLabels: doc.metadata.competencies,
    estimatedMinutes: doc.metadata.estimated_time,
    difficultyLabel: curriculumDifficultyLabel(doc),
  };
}

export function resolveBusinessMasteryMinuteModel(
  cardId: string,
): BusinessMasteryMinuteModel | null {
  const doc = getCurriculumKnowledgeCardDocument(cardId);
  if (!doc) return null;

  return {
    title: doc.metadata.title,
    essentialQuestion: doc.body.essentialQuestion,
    corePrinciple: doc.body.corePrinciple,
    keyIdeas: doc.body.keyIdeas.slice(0, 5),
    estimatedMinutes: Math.min(doc.metadata.estimated_time, 5),
  };
}

/** Bridge curriculum body → legacy learning panel content shape. */
export function curriculumToLearningPanelContent(
  doc: CurriculumKnowledgeCardDocument,
): KnowledgeCardLearningContent {
  const { body } = doc;
  return {
    introduction: [body.whyThisMatters, body.corePrinciple ? `\n\n${body.corePrinciple}` : ""]
      .filter(Boolean)
      .join(""),
    objectives: body.keyIdeas.length > 0 ? body.keyIdeas : [body.corePrinciple].filter(Boolean),
    mainContent: [
      body.realBusinessExample,
      body.commonMistakes.length ?
        `\n\nCommon mistakes:\n${body.commonMistakes.map((m) => `• ${m}`).join("\n")}`
      : "",
    ]
      .filter(Boolean)
      .join("\n"),
    reflectionQuestions:
      body.reflectionQuestions.length > 0 ? body.reflectionQuestions : [],
    relatedResources: [
      ...body.relatedApprenticeships.map((a) => `Apprenticeship: ${a}`),
      ...(doc.metadata.related_business_labs ?? []).map((l) => `Business Lab: ${l}`),
      ...(doc.metadata.related_challenges ?? []).map((c) => `Challenge: ${c}`),
    ],
  };
}

export function resolveLearningContentForCard(
  card: KnowledgeCardDefinition,
  drawer: InstituteDrawerDefinition,
  fallback: KnowledgeCardLearningContent,
): KnowledgeCardLearningContent {
  const doc = getCurriculumKnowledgeCardDocument(card.id);
  if (!doc || doc.metadata.status !== "published") return fallback;
  return curriculumToLearningPanelContent(doc);
}

export function listCurriculumCardsByDrawer(drawerSlug: string) {
  return listCurriculumRegistryEntries("knowledge-card", {
    status: "published",
  }).filter((e) => e.drawer?.toLowerCase() === drawerSlug.toLowerCase());
}

function titleCase(value: string): string {
  return value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
