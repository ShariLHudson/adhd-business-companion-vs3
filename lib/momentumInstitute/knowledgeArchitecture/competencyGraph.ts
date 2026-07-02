/**
 * Competency graph — hierarchical capability development.
 * Pricing → Business Strategy · Communication · Confidence · Sales
 * Leadership → Communication · Delegation · Decision Making
 */

import type { GrowthCompetencyDefinition } from "@/lib/sparkMomentumInstitute/types";
import type { GrowthCompetencyLevel } from "@/lib/sparkCompetencyFramework/types";
import { getCatalogIndex, loadInstituteCatalog } from "../catalog/provider";
import type { CompetencyGraph, CompetencyGraphNode } from "./types";

export function buildCompetencyGraph(
  competencies: GrowthCompetencyDefinition[] = loadInstituteCatalog().competencies,
): CompetencyGraph {
  const nodes = new Map<string, CompetencyGraphNode>();

  for (const comp of competencies) {
    nodes.set(comp.id, { ...comp, childIds: [], depth: 0 });
  }

  for (const comp of competencies) {
    if (!comp.parentCompetencyId) continue;
    const parent = nodes.get(comp.parentCompetencyId);
    const child = nodes.get(comp.id);
    if (parent && child) {
      parent.childIds.push(comp.id);
    }
  }

  function setDepth(id: string, depth: number): void {
    const node = nodes.get(id);
    if (!node || node.depth >= depth) return;
    node.depth = depth;
    for (const childId of node.childIds) {
      setDepth(childId, depth + 1);
    }
  }

  const roots: string[] = [];
  for (const [id, node] of nodes) {
    if (!node.parentCompetencyId) {
      roots.push(id);
      setDepth(id, 0);
    }
  }

  return { nodes, roots };
}

export function getCompetencyGraph(): CompetencyGraph {
  const index = getCatalogIndex();
  return buildCompetencyGraph([...index.byCompetencyId.values()]);
}

export function getChildCompetencies(competencyId: string): GrowthCompetencyDefinition[] {
  const graph = getCompetencyGraph();
  const node = graph.nodes.get(competencyId);
  if (!node) return [];
  return node.childIds
    .map((id) => graph.nodes.get(id))
    .filter((n): n is CompetencyGraphNode => n !== undefined);
}

export function getAncestorCompetencies(
  competencyId: string,
): GrowthCompetencyDefinition[] {
  const graph = getCompetencyGraph();
  const ancestors: GrowthCompetencyDefinition[] = [];
  let current = graph.nodes.get(competencyId);

  while (current?.parentCompetencyId) {
    const parent = graph.nodes.get(current.parentCompetencyId);
    if (!parent) break;
    ancestors.push(parent);
    current = parent;
  }

  return ancestors;
}

export function getCompetenciesForKnowledgeCard(
  knowledgeCardId: string,
): GrowthCompetencyDefinition[] {
  const index = getCatalogIndex();
  const card = index.byKnowledgeCardId.get(knowledgeCardId);
  if (!card) return [];

  return card.competencyIds
    .map((id) => index.byCompetencyId.get(id))
    .filter((c): c is GrowthCompetencyDefinition => c !== undefined);
}

export type MemberCompetencySnapshot = Record<string, GrowthCompetencyLevel>;

export type StrengtheningOpportunity = {
  competency: GrowthCompetencyDefinition;
  currentLevel: GrowthCompetencyLevel;
  knowledgeCardIds: string[];
};

/**
 * Quiet signal for what still needs strengthening — informs suggestions, not surveillance.
 */
export function findStrengtheningOpportunities(
  memberLevels: MemberCompetencySnapshot,
  targetLevel: GrowthCompetencyLevel = "applying",
): StrengtheningOpportunity[] {
  const index = getCatalogIndex();
  const levelOrder: GrowthCompetencyLevel[] = [
    "exploring",
    "understanding",
    "practicing",
    "applying",
    "confident",
    "mastering",
    "mentoring",
  ];
  const targetIdx = levelOrder.indexOf(targetLevel);

  const opportunities: StrengtheningOpportunity[] = [];

  for (const competency of index.byCompetencyId.values()) {
    const current = memberLevels[competency.id] ?? "exploring";
    const currentIdx = levelOrder.indexOf(current);
    if (currentIdx >= targetIdx) continue;

    const cardIds: string[] = [];
    for (const card of index.byKnowledgeCardId.values()) {
      if (card.competencyIds.includes(competency.id)) {
        cardIds.push(card.id);
      }
    }

    opportunities.push({
      competency,
      currentLevel: current,
      knowledgeCardIds: cardIds,
    });
  }

  return opportunities.sort((a, b) => {
    const aIdx = levelOrder.indexOf(a.currentLevel);
    const bIdx = levelOrder.indexOf(b.currentLevel);
    return aIdx - bIdx;
  });
}

export function expandCompetencyTree(
  competencyId: string,
): GrowthCompetencyDefinition[] {
  const graph = getCompetencyGraph();
  const result: GrowthCompetencyDefinition[] = [];
  const node = graph.nodes.get(competencyId);
  if (!node) return result;

  function walk(id: string): void {
    const n = graph.nodes.get(id);
    if (!n) return;
    result.push(n);
    for (const childId of n.childIds) walk(childId);
  }

  walk(competencyId);
  return result;
}
