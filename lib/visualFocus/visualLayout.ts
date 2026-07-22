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
    case "process-map":
      return "process-flow";
    case "journey-map":
      return "journey-stages";
    case "timeline-map":
      return "timeline";
    case "opportunity-map":
      return "opportunity-radar";
    case "priority-map":
      return "priority-matrix";
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

function processFlowLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [];
  const edges: VisualFocusVisualEdge[] = [];
  const sequence: VisualFocusNode[] = [root];
  let cursor = root;
  while (cursor.children[0]) {
    sequence.push(cursor.children[0]);
    cursor = cursor.children[0];
  }
  // Prefer flat children when root has many siblings (guided process drafts)
  const flat =
    root.children.length > 1
      ? [root, ...root.children]
      : sequence;
  const count = flat.length;
  flat.forEach((n, i) => {
    const x = 8 + (84 / Math.max(count - 1, 1)) * i;
    nodes.push({
      id: n.id,
      label: n.label,
      x: count === 1 ? 50 : x,
      y: 45,
      level: i,
      color: NODE_COLORS[i % NODE_COLORS.length],
    });
    if (i > 0) {
      edges.push({ fromId: flat[i - 1]!.id, toId: n.id });
    }
  });
  return { nodes, edges, layoutKind: "process-flow" };
}

function journeyStagesLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [
    { id: root.id, label: root.label, x: 8, y: 50, level: 0, color: NODE_COLORS[0] },
  ];
  const edges: VisualFocusVisualEdge[] = [];
  const stages = root.children;
  const count = Math.max(stages.length, 1);
  stages.forEach((stage, i) => {
    const x = 20 + (70 / count) * (i + 0.5);
    nodes.push({
      id: stage.id,
      label: stage.label,
      x,
      y: 50,
      level: 1,
      color: NODE_COLORS[(i % NODE_COLORS.length) + 1],
    });
    edges.push({ fromId: i === 0 ? root.id : stages[i - 1]!.id, toId: stage.id });
  });
  return { nodes, edges, layoutKind: "journey-stages" };
}

function timelineLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [
    { id: root.id, label: root.label, x: 50, y: 12, level: 0, color: NODE_COLORS[0] },
  ];
  const edges: VisualFocusVisualEdge[] = [];
  const items = root.children;
  const count = Math.max(items.length, 1);
  items.forEach((item, i) => {
    const x = 10 + (80 / (count + 1)) * (i + 1);
    nodes.push({
      id: item.id,
      label: item.label,
      x,
      y: 55,
      level: 1,
      color: NODE_COLORS[(i % NODE_COLORS.length) + 1],
    });
    edges.push({ fromId: root.id, toId: item.id });
    if (i > 0) {
      edges.push({ fromId: items[i - 1]!.id, toId: item.id, label: "then" });
    }
  });
  return { nodes, edges, layoutKind: "timeline" };
}

function opportunityRadarLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [
    { id: root.id, label: root.label, x: 50, y: 50, level: 0, color: NODE_COLORS[0] },
  ];
  const edges: VisualFocusVisualEdge[] = [];
  const count = Math.max(root.children.length, 1);
  root.children.forEach((child, i) => {
    const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
    const x = 50 + Math.cos(angle) * 32;
    const y = 50 + Math.sin(angle) * 32;
    nodes.push({
      id: child.id,
      label: child.label,
      x,
      y,
      level: 1,
      color: NODE_COLORS[(i % NODE_COLORS.length) + 1],
    });
    edges.push({ fromId: root.id, toId: child.id });
  });
  return { nodes, edges, layoutKind: "opportunity-radar" };
}

function priorityMatrixLayout(root: VisualFocusNode): VisualFocusVisualLayout {
  const nodes: VisualFocusVisualNode[] = [
    { id: root.id, label: root.label, x: 50, y: 10, level: 0, color: NODE_COLORS[0] },
  ];
  const edges: VisualFocusVisualEdge[] = [];
  const quadrants = [
    { x: 28, y: 38 },
    { x: 72, y: 38 },
    { x: 28, y: 72 },
    { x: 72, y: 72 },
  ];
  root.children.forEach((child, i) => {
    const slot = quadrants[i % quadrants.length]!;
    nodes.push({
      id: child.id,
      label: child.label,
      x: slot.x,
      y: slot.y,
      level: 1,
      color: NODE_COLORS[(i % NODE_COLORS.length) + 1],
    });
    edges.push({ fromId: root.id, toId: child.id });
    child.children.forEach((grand, gi) => {
      nodes.push({
        id: grand.id,
        label: grand.label,
        x: slot.x + (gi % 2 === 0 ? -8 : 8),
        y: slot.y + 14,
        level: 2,
        color: NODE_COLORS[(i + gi + 2) % NODE_COLORS.length],
      });
      edges.push({ fromId: child.id, toId: grand.id });
    });
  });
  return { nodes, edges, layoutKind: "priority-matrix" };
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
    case "process-flow":
      return processFlowLayout(map.root);
    case "journey-stages":
      return journeyStagesLayout(map.root);
    case "timeline":
      return timelineLayout(map.root);
    case "opportunity-radar":
      return opportunityRadarLayout(map.root);
    case "priority-matrix":
      return priorityMatrixLayout(map.root);
    default:
      return radialLayout(map.root);
  }
}
