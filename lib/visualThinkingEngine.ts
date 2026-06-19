/**
 * Visual Thinking Engine — reusable graph primitives for ecosystem-wide visual thinking.
 */

import type { VisualThinkingTone } from "./visualThinkingColors";

export type VisualThinkingNodeKind =
  | "decision"
  | "option"
  | "category"
  | "recommendation"
  | "score";

export type VisualThinkingNode = {
  id: string;
  kind: VisualThinkingNodeKind;
  tone: VisualThinkingTone;
  icon: string;
  title: string;
  items: string[];
  moreCount: number;
  visible: boolean;
  recommended?: boolean;
  side?: "a" | "b" | "center";
};

export type VisualThinkingGraph = {
  nodes: VisualThinkingNode[];
  recommendedSide: "A" | "B" | null;
  hasDecision: boolean;
  hasOptions: boolean;
};

export type VisualThinkingViewMode = "mindmap" | "infographic";

export function visibleNodes(graph: VisualThinkingGraph): VisualThinkingNode[] {
  return graph.nodes.filter((n) => n.visible);
}

export function truncateItem(text: string, max = 72): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
