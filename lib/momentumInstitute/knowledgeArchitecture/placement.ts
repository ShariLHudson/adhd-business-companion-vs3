/**
 * Knowledge Card placement — resolve full hierarchy breadcrumb.
 */

import type { InstitutePillarId } from "@/lib/sparkCompetencyFramework/types";
import {
  getCatalogIndex,
  getDepartmentById,
  getDrawerById,
  getInstituteDefinition,
  getKnowledgeCardById,
  getTopicById,
} from "../catalog/provider";
import type { KnowledgeCardPlacement } from "./types";

export function resolveKnowledgeCardPlacement(
  knowledgeCardId: string,
): KnowledgeCardPlacement | null {
  const card = getKnowledgeCardById(knowledgeCardId);
  if (!card) return null;

  const department = getDepartmentById(card.departmentId);
  const drawer = getDrawerById(card.drawerId);
  if (!department || !drawer) return null;

  const topic = card.topicId ? getTopicById(card.topicId) : null;
  const pillarId: InstitutePillarId = drawer.pillarId ?? department.pillarId;

  return {
    institute: getInstituteDefinition(),
    pillarId,
    department,
    drawer,
    topic,
    knowledgeCard: card,
  };
}

export function formatKnowledgeBreadcrumb(
  placement: KnowledgeCardPlacement,
): string[] {
  const segments = [
    placement.institute.title,
    placement.department.title,
    placement.drawer.title,
    placement.knowledgeCard.title,
  ];
  return segments;
}

export function listKnowledgeCardsInDrawer(drawerId: string): string[] {
  const index = getCatalogIndex();
  return index.cardsByDrawerId.get(drawerId) ?? [];
}

export function listKnowledgeCardsInDepartment(departmentId: string): string[] {
  const index = getCatalogIndex();
  return index.cardsByDepartmentId.get(departmentId) ?? [];
}

export function listKnowledgeCardsInPillar(pillarId: InstitutePillarId): string[] {
  const index = getCatalogIndex();
  return index.cardsByPillarId.get(pillarId) ?? [];
}

export function getKnowledgeCardBySlug(slug: string) {
  const index = getCatalogIndex();
  return index.byKnowledgeCardSlug.get(slug) ?? null;
}
