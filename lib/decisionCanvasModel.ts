/**
 * ADHD Visual Decision Canvas — graph model from shared session authority only.
 */

import type { PersistedDecisionCompassSession } from "./decisionCompassSessionStore";
import { enrichAuthority } from "./decisionCompassSessionAuthority";
import {
  buildDecisionMapView,
  type DecisionMapViewModel,
} from "./decisionMapView";
import { optionLabels } from "./decisionCompass";
import { CHILD_NODE_META } from "./visualThinkingColors";
import {
  truncateItem,
  type VisualThinkingGraph,
  type VisualThinkingNode,
} from "./visualThinkingEngine";

const MAX_VISIBLE_ITEMS = 3;

function splitItems(items: string[]): { visible: string[]; moreCount: number } {
  const unique = [...new Set(items.map((i) => i.trim()).filter(Boolean))];
  return {
    visible: unique.slice(0, MAX_VISIBLE_ITEMS),
    moreCount: Math.max(0, unique.length - MAX_VISIBLE_ITEMS),
  };
}

function categoryNode(
  id: string,
  side: "a" | "b",
  category: keyof typeof CHILD_NODE_META,
  items: string[],
): VisualThinkingNode | null {
  if (!items.length) return null;
  const meta = CHILD_NODE_META[category];
  const { visible, moreCount } = splitItems(items);
  return {
    id: `${id}-${category}`,
    kind: "category",
    tone: meta.tone,
    icon: meta.icon,
    title: meta.label,
    items: visible.map((i) => truncateItem(i)),
    moreCount,
    visible: true,
    side,
  };
}

function recommendedSide(
  vm: DecisionMapViewModel,
  session: PersistedDecisionCompassSession,
): "A" | "B" | null {
  if (!vm.recommendation) return null;
  const { a, b } = optionLabels(session.answers);
  const c = vm.recommendation.choice.trim().toLowerCase();
  if (c === vm.optionA.label.toLowerCase() || c === a.toLowerCase()) return "A";
  if (c === vm.optionB.label.toLowerCase() || c === b.toLowerCase()) return "B";
  if (vm.optionA.label && c.includes(vm.optionA.label.toLowerCase().slice(0, 10)))
    return "A";
  if (vm.optionB.label && c.includes(vm.optionB.label.toLowerCase().slice(0, 10)))
    return "B";
  return null;
}

function financialItems(branch: DecisionMapViewModel["optionA"]): string[] {
  const items: string[] = [];
  if (branch.successPicture?.match(/\$|cost|revenue|price|budget|afford/i)) {
    items.push(branch.successPicture);
  }
  return items;
}

function stressItems(
  branch: DecisionMapViewModel["optionA"],
  answers: PersistedDecisionCompassSession["answers"],
  side: "a" | "b",
): string[] {
  const items = [...branch.concerns.filter((c) => /stress|overwhelm|anx/i.test(c))];
  const relief = side === "a" ? answers.relief === "A" : answers.relief === "B";
  if (relief) items.push("Feels lighter");
  const stressPick = side === "a" ? answers.stress === "A" : answers.stress === "B";
  if (stressPick) items.push("Less stress");
  return items.length ? items : branch.concerns.slice(0, 1);
}

function growthItems(branch: DecisionMapViewModel["optionA"]): string[] {
  return [
    ...branch.benefits.filter((b) => /grow|scale|forward|momentum/i.test(b)),
    ...branch.tradeoffs.filter((t) => /growth|momentum|freedom/i.test(t)),
    ...(branch.successPicture ? [branch.successPicture] : []),
  ];
}

export function buildDecisionCanvasGraph(
  session: PersistedDecisionCompassSession | null,
): VisualThinkingGraph {
  if (!session) {
    return {
      nodes: [],
      recommendedSide: null,
      hasDecision: false,
      hasOptions: false,
    };
  }

  enrichAuthority(session);
  const vm = buildDecisionMapView(session);
  const recSide = recommendedSide(vm, session);
  const nodes: VisualThinkingNode[] = [];

  const hasDecision = Boolean(vm.decision);
  const hasOptions = Boolean(
    vm.optionA.label && vm.optionB.label && vm.optionA.label !== "Option A",
  ) || Boolean(session.optionA?.trim() && session.optionB?.trim());

  if (hasDecision) {
    nodes.push({
      id: "decision",
      kind: "decision",
      tone: "decision",
      icon: "🎯",
      title: truncateItem(vm.decision, 96),
      items: [],
      moreCount: 0,
      visible: true,
      side: "center",
    });
  }

  if (hasOptions || vm.optionA.label) {
    nodes.push({
      id: "option-a",
      kind: "option",
      tone: "option-a",
      icon: "🟢",
      title: truncateItem(vm.optionA.label, 48),
      items: [],
      moreCount: 0,
      visible: true,
      recommended: recSide === "A",
      side: "a",
    });
    nodes.push({
      id: "option-b",
      kind: "option",
      tone: "option-b",
      icon: "🔵",
      title: truncateItem(vm.optionB.label, 48),
      items: [],
      moreCount: 0,
      visible: true,
      recommended: recSide === "B",
      side: "b",
    });

    const branchNodesA = [
      categoryNode("a", "a", "benefits", vm.optionA.benefits),
      categoryNode("a", "a", "concerns", vm.optionA.concerns),
      categoryNode("a", "a", "financial", financialItems(vm.optionA)),
      categoryNode("a", "a", "stress", stressItems(vm.optionA, session.answers, "a")),
      categoryNode("a", "a", "growth", growthItems(vm.optionA)),
      categoryNode("a", "a", "longTerm", vm.optionA.successPicture ? [vm.optionA.successPicture] : []),
    ].filter((n): n is VisualThinkingNode => n !== null);

    const branchNodesB = [
      categoryNode("b", "b", "benefits", vm.optionB.benefits),
      categoryNode("b", "b", "concerns", vm.optionB.concerns),
      categoryNode("b", "b", "financial", financialItems(vm.optionB)),
      categoryNode("b", "b", "stress", stressItems(vm.optionB, session.answers, "b")),
      categoryNode("b", "b", "growth", growthItems(vm.optionB)),
      categoryNode("b", "b", "longTerm", vm.optionB.successPicture ? [vm.optionB.successPicture] : []),
    ].filter((n): n is VisualThinkingNode => n !== null);

    nodes.push(...branchNodesA, ...branchNodesB);
  }

  if (vm.recommendation) {
    const { visible, moreCount } = splitItems(vm.recommendation.primaryReasons);
    nodes.push({
      id: "recommendation",
      kind: "recommendation",
      tone: "insight",
      icon: "⭐",
      title: vm.recommendation.choice,
      items: visible,
      moreCount,
      visible: true,
      side: "center",
    });
  }

  return {
    nodes,
    recommendedSide: recSide,
    hasDecision,
    hasOptions,
  };
}

export function buildDecisionCanvasGraphFromAuthority(
  session: PersistedDecisionCompassSession | null,
): VisualThinkingGraph {
  return buildDecisionCanvasGraph(session);
}

export type { DecisionMapViewModel };
export { buildDecisionMapView };
