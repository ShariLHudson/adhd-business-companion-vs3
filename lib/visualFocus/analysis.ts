import type { VisualFocusAnalysis, VisualFocusMap, VisualFocusNode } from "./types";
import { buildBusinessCanvasAnalysis } from "./businessCanvas/analysis";

function walkPairs(
  root: VisualFocusNode,
): Array<{ parent: string; child: string }> {
  const pairs: Array<{ parent: string; child: string }> = [];
  function walk(n: VisualFocusNode) {
    for (const child of n.children) {
      pairs.push({ parent: n.label.trim(), child: child.label.trim() });
      walk(child);
    }
  }
  walk(root);
  return pairs.filter((p) => p.parent && p.child);
}

function uniqueLabels(root: VisualFocusNode): string[] {
  const labels = new Set<string>();
  function walk(n: VisualFocusNode) {
    const t = n.label.trim();
    if (t) labels.add(t);
    for (const c of n.children) walk(c);
  }
  walk(root);
  return [...labels];
}

export function buildMapAnalysis(map: VisualFocusMap): VisualFocusAnalysis {
  if (map.mode === "business-canvas" && map.businessCanvas) {
    return buildBusinessCanvasAnalysis(
      map.businessCanvas,
      map.title,
      map.purposeAnchor?.userAnswer,
    );
  }

  const now = new Date().toISOString();
  const purpose = map.purposeAnchor?.userAnswer?.trim();
  const labels = uniqueLabels(map.root);
  const pairs = walkPairs(map.root);

  const keyRelationships = pairs.slice(0, 6).map(
    (p) => `${p.parent} → ${p.child}`,
  );

  const patterns: string[] = [];
  if (labels.length >= 4) {
    patterns.push(`You mapped ${labels.length} connected areas around "${map.title}".`);
  }
  if (map.mode === "relationship-map" && labels.length >= 3) {
    patterns.push(
      "Audience, offer, and marketing elements appear as separate branches — look for where they should reinforce each other.",
    );
  }
  if (map.mode === "decision-tree" && pairs.length >= 2) {
    patterns.push("Multiple decision paths are visible — compare outcomes before committing.");
  }

  const opportunities: string[] = [];
  const risks: string[] = [];
  const recommendations: string[] = [];
  const nextSteps: string[] = [];

  if (map.mode === "relationship-map") {
    const marketing = labels.find((l) => /market|channel|content|social/i.test(l));
    const audience = labels.find((l) => /audience|client|customer/i.test(l));
    if (marketing && audience) {
      opportunities.push(
        `${marketing} and ${audience} support the same direction but may not share a unified content system yet.`,
      );
      recommendations.push(
        "Create a unified content pipeline that connects your audience insight to every channel you listed.",
      );
    }
    if (labels.some((l) => /revenue|offer|price/i.test(l))) {
      nextSteps.push("Trace how each marketing channel feeds your offer and revenue path.");
    }
  }

  if (map.mode === "mind-map") {
    recommendations.push("Group related branches and mark one cluster as your priority focus this week.");
    nextSteps.push("Pick the highest-leverage branch and define one concrete next action.");
  }

  if (map.mode === "decision-tree") {
    risks.push("Unexplored branches may hide costs or dependencies — validate assumptions on each path.");
    nextSteps.push("Choose one path to explore first with a small, reversible experiment.");
  }

  if (map.mode === "visual-kanban" && map.kanban) {
    const cardCount = Object.keys(map.kanban.cards).length;
    patterns.push(`${cardCount} ideas organized across ${map.kanban.columns.length} stages.`);
    recommendations.push("Move the top 1–2 cards in Ready to act into Plan My Day™ or a project.");
  }

  if (opportunities.length === 0 && labels.length >= 2) {
    opportunities.push(
      `Connections between ${labels.slice(0, 2).join(" and ")} may reveal an untapped leverage point.`,
    );
  }
  if (recommendations.length === 0) {
    recommendations.push("Review the visual map and note one connection that feels strongest or most fragile.");
  }
  if (nextSteps.length === 0) {
    nextSteps.push("Save this map in My Work™ and revisit after your next working session.");
  }

  const summary = purpose
    ? `Exploring "${purpose}": your map connects ${labels.length} areas${keyRelationships[0] ? `, starting with ${keyRelationships[0]}` : ""}.`
    : `Your ${map.title} connects ${labels.length} areas${keyRelationships[0] ? ` — notably ${keyRelationships[0]}` : ""}.`;

  return {
    summary,
    keyRelationships,
    patterns,
    risks,
    opportunities,
    recommendations,
    nextSteps,
    generatedAt: now,
  };
}
