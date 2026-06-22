import type { VisualFocusMap, VisualFocusMode, VisualFocusNode } from "./types";

function node(label: string, children: VisualFocusNode[] = []): VisualFocusNode {
  return {
    id: `n-${label.toLowerCase().replace(/\s+/g, "-")}-${Math.random().toString(36).slice(2, 7)}`,
    label,
    children,
  };
}

function treeTemplate(mode: VisualFocusMode): { title: string; root: VisualFocusNode } {
  switch (mode) {
    case "mind-map":
      return {
        title: "Mind Map",
        root: node("Central idea", [
          node("Branch 1"),
          node("Branch 2"),
          node("Branch 3"),
        ]),
      };
    case "decision-tree":
      return {
        title: "Decision Tree",
        root: node("Launch workshop?", [
          node("Yes", [
            node("Landing page"),
            node("Email sequence"),
            node("Registration page"),
          ]),
          node("No", [node("Build content first"), node("Improve offer")]),
        ]),
      };
    case "project-map":
      return {
        title: "Project Map",
        root: node("Workshop launch", [
          node("Content"),
          node("Slides"),
          node("Registration"),
          node("Marketing"),
          node("Follow-up"),
        ]),
      };
    case "strategy-map":
      return {
        title: "Strategy Map",
        root: node("Offer strategy", [
          node("Audience"),
          node("Funnel"),
          node("Content"),
          node("Launch"),
        ]),
      };
    case "relationship-map":
      return {
        title: "Relationship Map",
        root: node("Network", [
          node("Clients"),
          node("Partners"),
          node("Referral sources"),
          node("Opportunities"),
        ]),
      };
    case "visual-kanban":
      return { title: "Visual Board", root: node("Board") };
  }
}

export function createVisualFocusMap(mode: VisualFocusMode): VisualFocusMap {
  const now = new Date().toISOString();
  const id = `vf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const { title, root } = treeTemplate(mode);

  if (mode === "visual-kanban") {
    const c1 = `col-${id}-ideas`;
    const c2 = `col-${id}-cluster`;
    const c3 = `col-${id}-doing`;
    const card1 = `card-${id}-1`;
    const card2 = `card-${id}-2`;
    return {
      id,
      title: "Visual Board",
      mode,
      root,
      kanban: {
        columns: [
          { id: c1, label: "Ideas", cardIds: [card1] },
          { id: c2, label: "Clusters", cardIds: [card2] },
          { id: c3, label: "Connections", cardIds: [] },
        ],
        cards: {
          [card1]: { id: card1, label: "First idea" },
          [card2]: { id: card2, label: "Related cluster", linkedTo: [card1] },
        },
      },
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    id,
    title,
    mode,
    root,
    createdAt: now,
    updatedAt: now,
  };
}
