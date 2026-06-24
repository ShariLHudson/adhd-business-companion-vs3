import type {
  VisualFocusMap,
  VisualFocusNode,
  VisualFocusVisualEdge,
  VisualFocusVisualLayout,
  VisualFocusVisualNode,
} from "./types";
import { buildBusinessCanvasVisualLayout } from "./businessCanvas/visualLayout";

const NODE_COLORS = ["#1e4f4f", "#5b7c99", "#c48992", "#8b7355", "#6b8e6b", "#7c6b9e"];

function layoutKindForMode(
  mode: VisualFocusMap["mode"],
): VisualFocusVisualLayout["layoutKind"] {
  switch (mode) {
    case "relationship-map":
    case "project-map":
      return "vertical-flow";
    case "decision-tree":
      return "decision-branch";
    case "visual-kanban":
      return "kanban-columns";
    default:
      return "radial";
  }
}

function radialLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [
    { id: root.id, label: root.label, x: 50, y: 12, level: 0, color: NODE_COLORS[0] },
  ];
  const edges: VisualFocusVisualEdge[] = [];
  const children = root.children;
  const count = Math.max(children.length, 1);
  children.forEach((child, i) => {
    const x = 10 + (80 / (count + 1)) * (i + 1);
    nodes.push({
      id: child.id,
      label: child.label,
      x,
      y: 42,
      level: 1,
      color: NODE_COLORS[(i % NODE_COLORS.length) + 1],
    });
    edges.push({ fromId: root.id, toId: child.id });
    child.children.forEach((grand, gi) => {
      const gx = x - 8 + gi * 16;
      nodes.push({
        id: grand.id,
        label: grand.label,
        x: gx,
        y: 72,
        level: 2,
        color: NODE_COLORS[(i + gi + 2) % NODE_COLORS.length],
      });
      edges.push({ fromId: child.id, toId: grand.id });
    });
  });
  return { nodes, edges, layoutKind: "radial" };
}

function verticalFlowLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [];
  const edges: VisualFocusVisualEdge[] = [];
  let y = 8;
  const stack = [root, ...root.children];
  for (let i = 0; i < stack.length; i++) {
    const n = stack[i]!;
    nodes.push({
      id: n.id,
      label: n.label,
      x: 50,
      y,
      level: i,
      color: NODE_COLORS[i % NODE_COLORS.length],
    });
    if (i > 0) {
      edges.push({ fromId: stack[i - 1]!.id, toId: n.id, label: "influences" });
    }
    y += 22;
  }
  return { nodes, edges, layoutKind: "vertical-flow" };
}

function decisionBranchLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [
    { id: root.id, label: root.label, x: 50, y: 8, level: 0, color: NODE_COLORS[0] },
  ];
  const edges: VisualFocusVisualEdge[] = [];
  root.children.forEach((child, i) => {
    const x = i % 2 === 0 ? 25 : 75;
    const y = 35 + Math.floor(i / 2) * 28;
    nodes.push({
      id: child.id,
      label: child.label,
      x,
      y,
      level: 1,
      color: NODE_COLORS[(i % NODE_COLORS.length) + 1],
    });
    edges.push({
      fromId: root.id,
      toId: child.id,
      label: i % 2 === 0 ? "Path A" : "Path B",
    });
  });
  return { nodes, edges, layoutKind: "decision-branch" };
}

function kanbanLayout(map: VisualFocusMap): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [];
  const edges: VisualFocusVisualEdge[] = [];
  const kanban = map.kanban;
  if (!kanban) {
    return { nodes, edges, layoutKind: "kanban-columns" };
  }
  const colCount = kanban.columns.length;
  kanban.columns.forEach((col, ci) => {
    const x = 8 + (84 / Math.max(colCount, 1)) * ci;
    nodes.push({
      id: col.id,
      label: col.label,
      x,
      y: 10,
      level: 0,
      color: NODE_COLORS[ci % NODE_COLORS.length],
    });
    col.cardIds.forEach((cardId, ri) => {
      const card = kanban.cards[cardId];
      if (!card) return;
      nodes.push({
        id: card.id,
        label: card.label,
        x,
        y: 28 + ri * 18,
        level: 1,
        color: card.color ?? NODE_COLORS[(ci + ri) % NODE_COLORS.length],
      });
      edges.push({ fromId: col.id, toId: card.id });
    });
  });
  return { nodes, edges, layoutKind: "kanban-columns" };
}

export function buildVisualLayout(map: VisualFocusMap): VisualFocusVisualLayout {
  if (map.mode === "business-canvas" && map.businessCanvas) {
    return buildBusinessCanvasVisualLayout(map.businessCanvas, map.title);
  }
  if (map.mode === "visual-kanban") return kanbanLayout(map);
  const kind = layoutKindForMode(map.mode);
  switch (kind) {
    case "vertical-flow":
      return verticalFlowLayout(map.root);
    case "decision-branch":
      return decisionBranchLayout(map.root);
    default:
      return radialLayout(map.root);
  }
}
