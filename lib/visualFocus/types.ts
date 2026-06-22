/** Visual Focus — cognitive workspace (not a task display mode). */

export type VisualFocusMode =
  | "mind-map"
  | "decision-tree"
  | "project-map"
  | "strategy-map"
  | "relationship-map"
  | "visual-kanban";

export type VisualFocusNode = {
  id: string;
  label: string;
  children: VisualFocusNode[];
  collapsed?: boolean;
  color?: string;
};

export type VisualKanbanColumn = {
  id: string;
  label: string;
  cardIds: string[];
};

export type VisualKanbanCard = {
  id: string;
  label: string;
  color?: string;
  linkedTo?: string[];
};

export type VisualFocusMap = {
  id: string;
  title: string;
  mode: VisualFocusMode;
  root: VisualFocusNode;
  kanban?: {
    columns: VisualKanbanColumn[];
    cards: Record<string, VisualKanbanCard>;
  };
  updatedAt: string;
  createdAt: string;
};

export const VISUAL_FOCUS_MODE_META: {
  id: VisualFocusMode;
  label: string;
  desc: string;
  emoji: string;
}[] = [
  {
    id: "mind-map",
    label: "Mind Map",
    emoji: "🧠",
    desc: "Branch ideas outward — expand and collapse as you think.",
  },
  {
    id: "decision-tree",
    label: "Decision Tree",
    emoji: "🔀",
    desc: "Yes / no branches and paths toward a choice.",
  },
  {
    id: "project-map",
    label: "Project Map",
    emoji: "🗂️",
    desc: "Break a project into parts and see dependencies.",
  },
  {
    id: "strategy-map",
    label: "Strategy Map",
    emoji: "🎯",
    desc: "Offers, funnels, campaigns, and product direction.",
  },
  {
    id: "relationship-map",
    label: "Relationship Map",
    emoji: "🤝",
    desc: "Clients, partners, referrals, and network connections.",
  },
  {
    id: "visual-kanban",
    label: "Visual Kanban",
    emoji: "🎨",
    desc: "Clusters, colors, and connections — beyond task columns.",
  },
];
