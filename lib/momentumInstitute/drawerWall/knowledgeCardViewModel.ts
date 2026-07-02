/**
 * Knowledge Card™ view models for drawer index cards and learning panel.
 */

import type {
  InstituteDrawerDefinition,
  KnowledgeCardDefinition,
  LearningExperienceDefinition,
} from "@/lib/sparkMomentumInstitute/types";
import {
  getDrawerById,
  getKnowledgeCardById,
  listExperiencesForKnowledgeCard,
} from "@/lib/momentumInstitute/catalog/provider";
import {
  KNOWLEDGE_CARD_STATUS_LABELS,
  resolveKnowledgeCardMemberStatus,
  type KnowledgeCardMemberStatusId,
} from "./knowledgeCardMemberState";
import {
  instituteLearningChatHint,
  type InstituteDiscussMode,
} from "./instituteLearningChat";
import {
  knowledgeCardCompetencyLabel,
  knowledgeCardDifficultyLabel,
  resolveKnowledgeCardLearningContent,
  resolveLearningPanelActions,
  resolveRelatedLearning,
  INSTITUTE_COMPLETION_LINES,
  type InstituteLearningAction,
  type KnowledgeCardLearningContent,
  type RelatedLearningItem,
} from "./knowledgeCardContent";
import {
  resolveKnowledgeCardViewerModel,
  resolveLearningContentForCard,
} from "@/lib/momentumInstitute/curriculum/resolver";

export type KnowledgeCardViewModel = {
  id: string;
  title: string;
  summary: string;
  estimatedMinutes: number;
  difficultyLabel: string;
  competencyLabel: string;
  status: KnowledgeCardMemberStatusId;
  statusLabel: string;
};

export type KnowledgeCardLearningPanelModel = {
  card: KnowledgeCardDefinition;
  drawer: InstituteDrawerDefinition;
  experiences: LearningExperienceDefinition[];
  viewModel: KnowledgeCardViewModel;
  content: KnowledgeCardLearningContent;
  actions: InstituteLearningAction[];
  relatedLearning: RelatedLearningItem[];
  completionLines: readonly string[];
  /** Full curriculum document model when authored content is loaded */
  curriculumViewerModel?: ReturnType<typeof resolveKnowledgeCardViewerModel>;
};

export function resolveKnowledgeCardViewModel(
  card: KnowledgeCardDefinition,
  drawer: InstituteDrawerDefinition,
): KnowledgeCardViewModel {
  const status = resolveKnowledgeCardMemberStatus(card.id);
  const summary =
    card.description?.trim() ||
    card.summary ||
    `Explore ${card.title} in the ${drawer.title} collection.`;

  return {
    id: card.id,
    title: card.title,
    summary,
    estimatedMinutes: card.metadata?.estimatedMinutes ?? 8,
    difficultyLabel: knowledgeCardDifficultyLabel(card),
    competencyLabel: knowledgeCardCompetencyLabel(card, drawer),
    status,
    statusLabel: KNOWLEDGE_CARD_STATUS_LABELS[status],
  };
}

export function resolveKnowledgeCardViewModels(
  cards: KnowledgeCardDefinition[],
  drawer: InstituteDrawerDefinition,
): KnowledgeCardViewModel[] {
  return cards.map((card) => resolveKnowledgeCardViewModel(card, drawer));
}

export function resolveKnowledgeCardLearningPanel(
  knowledgeCardId: string,
): KnowledgeCardLearningPanelModel | null {
  const card = getKnowledgeCardById(knowledgeCardId);
  if (!card) return null;

  const drawer = getDrawerById(card.drawerId);
  if (!drawer) return null;

  const experiences = listExperiencesForKnowledgeCard(card.id);
  const experienceKinds = experiences.map((exp) => exp.kind);
  const fallbackContent = resolveKnowledgeCardLearningContent(card, drawer);

  return {
    card,
    drawer,
    experiences,
    viewModel: resolveKnowledgeCardViewModel(card, drawer),
    content: resolveLearningContentForCard(card, drawer, fallbackContent),
    actions: resolveLearningPanelActions(card, experienceKinds),
    relatedLearning: resolveRelatedLearning(card, drawer),
    completionLines: INSTITUTE_COMPLETION_LINES,
    curriculumViewerModel: resolveKnowledgeCardViewerModel(card.id, drawer),
  };
}

export function discussPromptForMode(mode: InstituteDiscussMode): string {
  switch (mode) {
    case "understand":
      return "Can you help me understand this?";
    case "apply":
      return "How would this apply to my business?";
    case "advise":
      return "What would you do?";
    case "make_it_mine":
      return "Would you like to make this work for my business?";
  }
}

export function instituteDiscussTurn(
  panel: KnowledgeCardLearningPanelModel,
  mode: InstituteDiscussMode,
): { memberText: string; chatHint: string } {
  return {
    memberText: discussPromptForMode(mode),
    chatHint: instituteLearningChatHint(panel.card, panel.drawer, mode),
  };
}

export function instituteMakeItMineTurn(
  panel: KnowledgeCardLearningPanelModel,
): { memberText: string; chatHint: string } {
  return instituteDiscussTurn(panel, "make_it_mine");
}
