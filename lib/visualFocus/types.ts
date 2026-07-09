/** Visual Focus — cognitive workspace (not a task display mode). */

export type VisualFocusSaveDestinationId =
  | "visual-thinking"
  | "projects"
  | "strategies"
  | "templates"
  | "documents"
  | "decision-compass"
  | "sops"
  | "snippets";

export type VisualFocusMode =
  | "mind-map"
  | "decision-tree"
  | "project-map"
  | "strategy-map"
  | "relationship-map"
  | "visual-kanban"
  | "business-canvas";

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

import type { BusinessCanvasData } from "./businessCanvas/types";
import {
  DEFAULT_BUSINESS_CANVAS_WORKFLOW,
  normalizeBusinessCanvasWorkflow,
} from "./businessCanvas/workflowTypes";

export type VisualFocusPurposeAnchor = {
  question: string;
  userAnswer: string;
  mode: VisualFocusMode;
  capturedAt: string;
};

export type {
  VisualFocusDiscoveryAnswer,
  VisualFocusDiscoveryInterview,
} from "./discoveryInterview/types";

export type VisualFocusWorkflowStage = "build" | "generated";

export type VisualFocusSaveStatus = "unsaved" | "saving" | "saved";

/** Lifecycle — active work vs long-term Saved vs future states. */
export type VisualFocusLifecycleStatus =
  | "active"
  | "archived"
  | "completed"
  | "deleted"
  | "draft"
  | "shared";

/** Timestamped map snapshot for Save Version / Restore Version. */
export type VisualFocusMapSnapshot = Pick<
  VisualFocusMap,
  | "title"
  | "mode"
  | "root"
  | "purposeAnchor"
  | "businessCanvas"
  | "kanban"
  | "workflowStage"
  | "generatedAt"
  | "visualLayout"
  | "analysis"
  | "summary"
  | "businessCanvasWorkflow"
  | "businessCanvasChange"
  | "businessCanvasImpactAnalysis"
>;

export type VisualFocusMapVersion = {
  id: string;
  label: string;
  savedAt: string;
  snapshot: VisualFocusMapSnapshot;
};


export type VisualFocusVisualNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  color?: string;
  level?: number;
};

export type VisualFocusVisualEdge = {
  fromId: string;
  toId: string;
  label?: string;
};

export type VisualFocusVisualLayout = {
  nodes: VisualFocusVisualNode[];
  edges: VisualFocusVisualEdge[];
  layoutKind:
    | "radial"
    | "vertical-flow"
    | "decision-branch"
    | "kanban-columns"
    | "business-canvas-grid";
};

export type VisualFocusAnalysis = {
  summary: string;
  keyRelationships: string[];
  patterns: string[];
  risks: string[];
  opportunities: string[];
  recommendations: string[];
  nextSteps: string[];
  boardObservations?: string[];
  /** Business Canvas what-if ripple notes when exploring change. */
  whatIfNotes?: string[];
  generatedAt: string;
};

export type VisualFocusMap = {
  id: string;
  title: string;
  mode: VisualFocusMode;
  root: VisualFocusNode;
  purposeAnchor?: VisualFocusPurposeAnchor;
  /** Discovery Interview transcript (197) — Mind Map MVP. */
  discoveryInterview?: import("./discoveryInterview/types").VisualFocusDiscoveryInterview;
  /** Soft prompts Spark suggested after the first draft. */
  draftSuggestions?: string[];
  businessCanvas?: BusinessCanvasData;
  kanban?: {
    columns: VisualKanbanColumn[];
    cards: Record<string, VisualKanbanCard>;
  };
  workflowStage?: VisualFocusWorkflowStage;
  generatedAt?: string;
  visualLayout?: VisualFocusVisualLayout;
  analysis?: VisualFocusAnalysis;
  summary?: string;
  saveStatus?: VisualFocusSaveStatus;
  lastSavedAt?: string;
  pinned?: boolean;
  intentionallySaved?: boolean;
  saveDestination?: VisualFocusSaveDestinationId;
  lifecycleStatus?: VisualFocusLifecycleStatus;
  archivedAt?: string;
  versions?: VisualFocusMapVersion[];
  currentVersionId?: string;
  updatedAt: string;
  createdAt: string;
} & import("./businessCanvas/workflowTypes").BusinessCanvasMapExtensions;

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
  {
    id: "business-canvas",
    label: "Business Canvas",
    emoji: "📋",
    desc: "Nine guided sections — teach while you map your business model.",
  },
];
