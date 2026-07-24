/**
 * Visual Thinking Studio — Thinking Workspace Foundation (Build 7).
 * Interactive thinking surface over approved presentation, knowledge, and deliverables.
 * Does not reinterpret goals, regenerate knowledge, research, or change deliverables.
 * Conforms to VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md
 */

import type { VisualThinkingExperiencePlan } from "@/lib/cartographersStudio/visualThinkingExperienceOrchestrator";
import type { VisualThinkingUnderstanding } from "@/lib/cartographersStudio/visualThinkingUnderstanding";
import type {
  VisualThinkingKnowledgePackage,
  VisualThinkingKnowledgeRelationship,
} from "@/lib/cartographersStudio/visualThinkingKnowledgeIntelligence";
import type {
  VisualThinkingContentBlock,
  VisualThinkingGeneratedDeliverable,
  VisualThinkingGenerationBundle,
} from "@/lib/cartographersStudio/visualThinkingGenerationEngine";
import type {
  VisualThinkingPresentationPlan,
  VisualThinkingVisualStructure,
} from "@/lib/cartographersStudio/visualThinkingPresentationIntelligence";
import {
  limitVisibleChoices,
  resolveAdaptivePresentation,
} from "@/lib/adaptiveCompanionIntelligence";

// ─── Thinking Object model ──────────────────────────────────────────────────

export type ThinkingObjectType =
  | "title"
  | "concept"
  | "step"
  | "section"
  | "process"
  | "relationship"
  | "comparison"
  | "decision"
  | "warning"
  | "note"
  | "summary"
  | "action"
  | "checklist_item"
  | "glossary_term"
  | "supporting_resource"
  | "question"
  | "placeholder"
  | "group";

export type ThinkingObjectSourceKind =
  | "generated_block"
  | "knowledge_item"
  | "user_note"
  | "group_shell";

export type ThinkingObject = {
  id: string;
  type: ThinkingObjectType;
  title: string;
  summary: string;
  /** Reference only — content lives in deliverable/knowledge; not duplicated. */
  sourceKind: ThinkingObjectSourceKind;
  sourceBlockId: string | null;
  sourceKnowledgeItemId: string | null;
  deliverableId: string | null;
  groupId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed: boolean;
  userCreated: boolean;
  /** Generated knowledge objects cannot be content-edited via workspace move/group. */
  immutable: boolean;
  metadata: Record<string, unknown>;
};

export type ThinkingConnector = {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  kind: string;
  label: string | null;
  /** Always from existing semantic relationships — never decorative. */
  semantic: true;
};

export type ThinkingGroup = {
  id: string;
  title: string;
  summary: string;
  objectIds: string[];
  collapsed: boolean;
  x: number;
  y: number;
};

export type WorkspaceLayoutIntent =
  | "process"
  | "hierarchy"
  | "relationship"
  | "grouped_ideas"
  | "comparison"
  | "timeline"
  | "free_workspace";

export type WorkspaceViewport = {
  panX: number;
  panY: number;
  zoom: number;
};

export type WorkspaceSelection = {
  primaryObjectId: string | null;
};

export type AskShariWorkspaceContext = {
  workspaceId: string;
  selectedObjectId: string | null;
  selectedTitle: string | null;
  selectedSummary: string | null;
  layoutIntent: WorkspaceLayoutIntent;
  objectCount: number;
  focusMode: boolean;
  suggestedPrompts: string[];
};

export type ThinkingWorkspaceState = {
  id: string;
  requestId: string;
  understandingId: string;
  experiencePlanId: string;
  knowledgePackageId: string | null;
  generationRunId: string;
  presentationPlanId: string;
  primaryDeliverableId: string;
  layoutIntent: WorkspaceLayoutIntent;
  objects: ThinkingObject[];
  groups: ThinkingGroup[];
  connectors: ThinkingConnector[];
  viewport: WorkspaceViewport;
  selection: WorkspaceSelection;
  focusMode: boolean;
  focusedObjectId: string | null;
  searchQuery: string;
  searchMatchIds: string[];
  undoStack: ThinkingWorkspaceSnapshot[];
  redoStack: ThinkingWorkspaceSnapshot[];
  createdAt: string;
  updatedAt: string;
  version: "vts-thinking-workspace-1";
};

export type ThinkingWorkspaceSnapshot = {
  objects: ThinkingObject[];
  groups: ThinkingGroup[];
  viewport: WorkspaceViewport;
  selection: WorkspaceSelection;
  focusMode: boolean;
  focusedObjectId: string | null;
};

export type ThinkingWorkspaceInput = {
  understanding: VisualThinkingUnderstanding;
  experiencePlan: VisualThinkingExperiencePlan;
  knowledgePackage: VisualThinkingKnowledgePackage | null;
  generationBundle: VisualThinkingGenerationBundle;
  presentationPlan: VisualThinkingPresentationPlan;
};

export type WorkspaceAction =
  | { kind: "select"; objectId: string | null }
  | { kind: "move"; objectId: string; x: number; y: number }
  | { kind: "group"; objectIds: string[]; title?: string }
  | { kind: "ungroup"; groupId: string }
  | { kind: "collapse_group"; groupId: string }
  | { kind: "expand_group"; groupId: string }
  | { kind: "pan"; panX: number; panY: number }
  | { kind: "zoom"; zoom: number }
  | { kind: "fit_content" }
  | { kind: "reset_view" }
  | { kind: "center_selection" }
  | { kind: "focus_mode"; enabled: boolean }
  | { kind: "search"; query: string }
  | { kind: "add_idea"; title: string; ideaType?: "note" | "question" | "placeholder" | "action" }
  | { kind: "delete_user_object"; objectId: string }
  | { kind: "auto_organize" }
  | { kind: "undo" }
  | { kind: "redo" };

const WORKSPACE_SESSION_KEY = "companion-visual-thinking-workspace-v1";

const OBJECT_W = 200;
const OBJECT_H = 72;
const GAP_X = 40;
const GAP_Y = 28;
const COLS = 3;

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clampZoom(z: number): number {
  return Math.max(0.4, Math.min(2.2, z));
}

export function layoutIntentFromPresentation(
  plan: VisualThinkingPresentationPlan,
): WorkspaceLayoutIntent {
  const structure = plan.visualRecommendation?.structure as
    | VisualThinkingVisualStructure
    | undefined;
  if (plan.activePresentation === "user_led_canvas") return "free_workspace";
  switch (structure) {
    case "process":
    case "sequence":
      return "process";
    case "hierarchy":
      return "hierarchy";
    case "relationship":
      return "relationship";
    case "grouped_ideas":
      return "grouped_ideas";
    case "comparison":
      return "comparison";
    case "chronology":
      return "timeline";
    case "user_led":
      return "free_workspace";
    default:
      break;
  }
  switch (plan.activePresentation) {
    case "process_flow":
    case "step_by_step":
    case "sop":
    case "checklist":
      return "process";
    case "relationship_view":
    case "mind_map":
    case "grouped_ideas":
      return "relationship";
    case "comparison_view":
      return "comparison";
    case "timeline":
      return "timeline";
    case "user_led_canvas":
      return "free_workspace";
    default:
      return "grouped_ideas";
  }
}

function blockToObjectType(block: VisualThinkingContentBlock): ThinkingObjectType {
  switch (block.type) {
    case "heading":
      return "section";
    case "numbered_step":
      return "step";
    case "checklist_item":
      return "checklist_item";
    case "warning":
      return "warning";
    case "summary":
    case "key_point":
      return "summary";
    case "glossary_term":
      return "glossary_term";
    case "comparison_row":
      return "comparison";
    case "decision_branch":
      return "decision";
    case "process_node":
      return "process";
    case "relationship_node":
      return "relationship";
    case "timeline_event":
      return "concept";
    case "placeholder":
      return "placeholder";
    case "question":
      return "question";
    case "user_note":
      return "note";
    default:
      return "concept";
  }
}

function placeObjects(
  count: number,
  intent: WorkspaceLayoutIntent,
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  if (intent === "process" || intent === "timeline") {
    for (let i = 0; i < count; i++) {
      positions.push({ x: 48 + i * (OBJECT_W + GAP_X), y: 120 });
    }
    return positions;
  }
  if (intent === "comparison") {
    for (let i = 0; i < count; i++) {
      positions.push({
        x: 48 + (i % 2) * (OBJECT_W + GAP_X * 2),
        y: 100 + Math.floor(i / 2) * (OBJECT_H + GAP_Y),
      });
    }
    return positions;
  }
  if (intent === "hierarchy") {
    for (let i = 0; i < count; i++) {
      const depth = Math.min(3, Math.floor(Math.log2(i + 1)));
      positions.push({
        x: 48 + (i % COLS) * (OBJECT_W + GAP_X) + depth * 24,
        y: 80 + depth * (OBJECT_H + GAP_Y),
      });
    }
    return positions;
  }
  // relationship / grouped / free — soft grid
  for (let i = 0; i < count; i++) {
    positions.push({
      x: 48 + (i % COLS) * (OBJECT_W + GAP_X),
      y: 80 + Math.floor(i / COLS) * (OBJECT_H + GAP_Y),
    });
  }
  return positions;
}

function snapshotOf(state: ThinkingWorkspaceState): ThinkingWorkspaceSnapshot {
  return {
    objects: state.objects.map((o) => ({ ...o })),
    groups: state.groups.map((g) => ({ ...g, objectIds: [...g.objectIds] })),
    viewport: { ...state.viewport },
    selection: { ...state.selection },
    focusMode: state.focusMode,
    focusedObjectId: state.focusedObjectId,
  };
}

function pushUndo(state: ThinkingWorkspaceState): ThinkingWorkspaceState {
  const stack = [...state.undoStack, snapshotOf(state)].slice(-40);
  return { ...state, undoStack: stack, redoStack: [] };
}

function contentBounds(objects: ThinkingObject[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  if (!objects.length) {
    return { minX: 0, minY: 0, maxX: 800, maxY: 600 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const o of objects) {
    minX = Math.min(minX, o.x);
    minY = Math.min(minY, o.y);
    maxX = Math.max(maxX, o.x + o.width);
    maxY = Math.max(maxY, o.y + o.height);
  }
  return { minX, minY, maxX, maxY };
}

export function fitViewportToContent(
  objects: ThinkingObject[],
  viewW = 960,
  viewH = 560,
): WorkspaceViewport {
  const b = contentBounds(objects);
  const contentW = Math.max(200, b.maxX - b.minX + 80);
  const contentH = Math.max(160, b.maxY - b.minY + 80);
  const zoom = clampZoom(Math.min(viewW / contentW, viewH / contentH, 1));
  return {
    zoom,
    panX: viewW / 2 - ((b.minX + b.maxX) / 2) * zoom,
    panY: viewH / 2 - ((b.minY + b.maxY) / 2) * zoom,
  };
}

/** Guard — workspace must not mutate upstream knowledge/deliverable content. */
export function workspacePreservesKnowledgeImmutability(
  before: ThinkingWorkspaceState,
  after: ThinkingWorkspaceState,
): boolean {
  const beforeGen = before.objects
    .filter((o) => o.immutable)
    .map((o) => `${o.id}:${o.sourceBlockId}:${o.sourceKnowledgeItemId}:${o.summary}`)
    .sort();
  const afterGen = after.objects
    .filter((o) => o.immutable)
    .map((o) => `${o.id}:${o.sourceBlockId}:${o.sourceKnowledgeItemId}:${o.summary}`)
    .sort();
  return JSON.stringify(beforeGen) === JSON.stringify(afterGen);
}

export function buildAskShariContext(
  state: ThinkingWorkspaceState,
): AskShariWorkspaceContext {
  const selected = state.objects.find(
    (o) => o.id === state.selection.primaryObjectId,
  );
  const prompts = [
    "Explain this.",
    "Simplify this.",
    "What am I missing?",
    "Find missing steps.",
  ];
  if (selected?.type === "step" || selected?.type === "process") {
    prompts.unshift("Expand this step.");
  }
  if (state.selection.primaryObjectId) {
    prompts.push("Compare related ideas.");
  }
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });
  const visible = limitVisibleChoices(
    prompts.map((p) => ({ id: p, label: p })),
    adaptive,
  ).visible.map((p) => p.label);

  return {
    workspaceId: state.id,
    selectedObjectId: selected?.id ?? null,
    selectedTitle: selected?.title ?? null,
    selectedSummary: selected?.summary ?? null,
    layoutIntent: state.layoutIntent,
    objectCount: state.objects.length,
    focusMode: state.focusMode,
    suggestedPrompts: visible,
  };
}

export function createThinkingWorkspace(
  input: ThinkingWorkspaceInput,
): ThinkingWorkspaceState {
  const { presentationPlan, generationBundle, knowledgePackage, understanding } =
    input;
  const primary =
    generationBundle.deliverables.find(
      (d) => d.id === presentationPlan.primaryDeliverableId,
    ) ??
    generationBundle.deliverables.find((d) => d.role === "primary") ??
    generationBundle.deliverables[0];

  const layoutIntent = layoutIntentFromPresentation(presentationPlan);
  const adaptive = resolveAdaptivePresentation({
    destinationHint: "visual_thinking_studio",
  });

  const blocks = primary
    ? [...primary.blocks].sort((a, b) => a.order - b.order)
    : [];

  // Prefer generated blocks as surface objects; knowledge items fill gaps for relationship maps
  const useKnowledgeItems =
    (layoutIntent === "relationship" || layoutIntent === "grouped_ideas") &&
    (knowledgePackage?.items.length ?? 0) > 0 &&
    blocks.filter((b) => b.type !== "heading" && b.type !== "paragraph").length < 2;

  const sourceUnits: Array<{
    type: ThinkingObjectType;
    title: string;
    summary: string;
    sourceKind: ThinkingObjectSourceKind;
    sourceBlockId: string | null;
    sourceKnowledgeItemId: string | null;
    deliverableId: string | null;
    immutable: boolean;
  }> = [];

  if (useKnowledgeItems && knowledgePackage) {
    for (const item of knowledgePackage.items.filter(
      (i) => i.type !== "assumption" && i.verificationStatus !== "assumption",
    )) {
      sourceUnits.push({
        type:
          item.type === "step"
            ? "step"
            : item.type === "decision_point"
              ? "decision"
              : item.type === "warning"
                ? "warning"
                : "concept",
        title: item.title || item.content.slice(0, 48),
        summary: item.content.slice(0, 160),
        sourceKind: "knowledge_item",
        sourceBlockId: null,
        sourceKnowledgeItemId: item.id,
        deliverableId: primary?.id ?? null,
        immutable: true,
      });
    }
  } else {
    for (const block of blocks) {
      if (block.type === "paragraph" && blocks.length > 8) continue;
      sourceUnits.push({
        type: blockToObjectType(block),
        title: block.title || block.content.slice(0, 48) || "Idea",
        summary: block.content.slice(0, 160),
        sourceKind: "generated_block",
        sourceBlockId: block.id,
        sourceKnowledgeItemId: null,
        deliverableId: primary?.id ?? null,
        immutable: true,
      });
    }
  }

  // Adaptive: collapse density for high choice-load by grouping late items
  const density = presentationPlan.informationDensity;
  const collapseThreshold =
    density === "low" || adaptive.summaryFirst ? 6 : density === "high" ? 24 : 12;

  const positions = placeObjects(sourceUnits.length, layoutIntent);
  const objects: ThinkingObject[] = sourceUnits.map((u, i) => ({
    id: newId("wto"),
    type: u.type,
    title: u.title,
    summary: u.summary,
    sourceKind: u.sourceKind,
    sourceBlockId: u.sourceBlockId,
    sourceKnowledgeItemId: u.sourceKnowledgeItemId,
    deliverableId: u.deliverableId,
    groupId: null,
    x: positions[i]?.x ?? 48,
    y: positions[i]?.y ?? 80,
    width: OBJECT_W,
    height: OBJECT_H,
    collapsed: false,
    userCreated: false,
    immutable: u.immutable,
    metadata: {},
  }));

  const groups: ThinkingGroup[] = [];
  if (objects.length > collapseThreshold) {
    const overflow = objects.slice(collapseThreshold);
    const groupId = newId("wtg");
    for (const o of overflow) {
      o.groupId = groupId;
    }
    groups.push({
      id: groupId,
      title: "More ideas",
      summary: `${overflow.length} additional items`,
      objectIds: overflow.map((o) => o.id),
      collapsed: true,
      x: 48,
      y: 80 + Math.ceil(collapseThreshold / COLS) * (OBJECT_H + GAP_Y),
    });
    // Represent group as a shell object for surface display
    objects.push({
      id: newId("wto"),
      type: "group",
      title: "More ideas",
      summary: `${overflow.length} items`,
      sourceKind: "group_shell",
      sourceBlockId: null,
      sourceKnowledgeItemId: null,
      deliverableId: primary?.id ?? null,
      groupId: null,
      x: groups[0]!.x,
      y: groups[0]!.y,
      width: OBJECT_W,
      height: OBJECT_H,
      collapsed: true,
      userCreated: false,
      immutable: true,
      metadata: { groupId },
    });
  }

  const blockIdToObject = new Map(
    objects
      .filter((o) => o.sourceBlockId)
      .map((o) => [o.sourceBlockId!, o.id] as const),
  );
  const knowledgeIdToObject = new Map(
    objects
      .filter((o) => o.sourceKnowledgeItemId)
      .map((o) => [o.sourceKnowledgeItemId!, o.id] as const),
  );

  const connectors: ThinkingConnector[] = [];
  const rels: VisualThinkingKnowledgeRelationship[] =
    knowledgePackage?.relationships ?? [];
  for (const r of rels) {
    const from =
      knowledgeIdToObject.get(r.fromItemId) ??
      objects.find((o) => o.sourceKnowledgeItemId === r.fromItemId)?.id;
    const to =
      knowledgeIdToObject.get(r.toItemId) ??
      objects.find((o) => o.sourceKnowledgeItemId === r.toItemId)?.id;
    if (from && to) {
      connectors.push({
        id: newId("wtc"),
        fromObjectId: from,
        toObjectId: to,
        kind: r.kind,
        label: r.label,
        semantic: true,
      });
    }
  }

  // Sequence follows for process layouts from ordered steps
  if (layoutIntent === "process" || layoutIntent === "timeline") {
    const steps = objects
      .filter((o) => o.type === "step" || o.type === "checklist_item" || o.type === "process")
      .sort((a, b) => a.x - b.x);
    for (let i = 0; i < steps.length - 1; i++) {
      const already = connectors.some(
        (c) =>
          c.fromObjectId === steps[i]!.id && c.toObjectId === steps[i + 1]!.id,
      );
      if (!already) {
        connectors.push({
          id: newId("wtc"),
          fromObjectId: steps[i]!.id,
          toObjectId: steps[i + 1]!.id,
          kind: "follows",
          label: "next",
          semantic: true,
        });
      }
    }
  }

  // Visual shell relationships if present
  if (primary?.visualShell?.relationships?.length) {
    for (const edge of primary.visualShell.relationships) {
      const fromNode = primary.visualShell.nodes.find((n) => n.id === edge.from);
      const toNode = primary.visualShell.nodes.find((n) => n.id === edge.to);
      const fromObj = objects.find(
        (o) =>
          o.title === fromNode?.label ||
          o.summary.includes(fromNode?.label ?? "___"),
      );
      const toObj = objects.find(
        (o) =>
          o.title === toNode?.label || o.summary.includes(toNode?.label ?? "___"),
      );
      if (fromObj && toObj) {
        connectors.push({
          id: newId("wtc"),
          fromObjectId: fromObj.id,
          toObjectId: toObj.id,
          kind: edge.kind || "related_to",
          label: edge.label ?? null,
          semantic: true,
        });
      }
    }
  }

  void blockIdToObject;
  void understanding;

  const initialZoom =
    density === "low" || adaptive.summaryFirst ? 0.9 : density === "high" ? 1 : 1;
  const viewport = fitViewportToContent(objects.filter((o) => !o.groupId));
  viewport.zoom = clampZoom(viewport.zoom * initialZoom);

  return {
    id: newId("wts"),
    requestId: understanding.requestId,
    understandingId: understanding.id,
    experiencePlanId: input.experiencePlan.id,
    knowledgePackageId: knowledgePackage?.id ?? null,
    generationRunId: generationBundle.run.id,
    presentationPlanId: presentationPlan.id,
    primaryDeliverableId: primary?.id ?? "",
    layoutIntent,
    objects,
    groups,
    connectors,
    viewport,
    selection: { primaryObjectId: null },
    focusMode: false,
    focusedObjectId: null,
    searchQuery: "",
    searchMatchIds: [],
    undoStack: [],
    redoStack: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
    version: "vts-thinking-workspace-1",
  };
}

export function applyWorkspaceAction(
  state: ThinkingWorkspaceState,
  action: WorkspaceAction,
): ThinkingWorkspaceState {
  if (action.kind === "undo") {
    const prev = state.undoStack[state.undoStack.length - 1];
    if (!prev) return state;
    return {
      ...state,
      ...prev,
      objects: prev.objects.map((o) => ({ ...o })),
      groups: prev.groups.map((g) => ({ ...g, objectIds: [...g.objectIds] })),
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, snapshotOf(state)],
      updatedAt: nowIso(),
    };
  }
  if (action.kind === "redo") {
    const next = state.redoStack[state.redoStack.length - 1];
    if (!next) return state;
    return {
      ...state,
      ...next,
      objects: next.objects.map((o) => ({ ...o })),
      groups: next.groups.map((g) => ({ ...g, objectIds: [...g.objectIds] })),
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, snapshotOf(state)],
      updatedAt: nowIso(),
    };
  }

  let next = state;

  if (
    action.kind === "move" ||
    action.kind === "group" ||
    action.kind === "ungroup" ||
    action.kind === "collapse_group" ||
    action.kind === "expand_group" ||
    action.kind === "auto_organize" ||
    action.kind === "add_idea" ||
    action.kind === "delete_user_object"
  ) {
    next = pushUndo(state);
  }

  switch (action.kind) {
    case "select":
      return {
        ...next,
        selection: { primaryObjectId: action.objectId },
        updatedAt: nowIso(),
      };
    case "move": {
      return {
        ...next,
        objects: next.objects.map((o) =>
          o.id === action.objectId
            ? { ...o, x: action.x, y: action.y }
            : o,
        ),
        updatedAt: nowIso(),
      };
    }
    case "pan":
      return {
        ...next,
        viewport: {
          ...next.viewport,
          panX: action.panX,
          panY: action.panY,
        },
        updatedAt: nowIso(),
      };
    case "zoom":
      return {
        ...next,
        viewport: { ...next.viewport, zoom: clampZoom(action.zoom) },
        updatedAt: nowIso(),
      };
    case "fit_content":
      return {
        ...next,
        viewport: fitViewportToContent(
          next.objects.filter((o) => !o.groupId || !isInCollapsedGroup(next, o)),
        ),
        updatedAt: nowIso(),
      };
    case "reset_view":
      return {
        ...next,
        viewport: fitViewportToContent(next.objects.filter((o) => !o.groupId)),
        focusMode: false,
        focusedObjectId: null,
        updatedAt: nowIso(),
      };
    case "center_selection": {
      const sel = next.objects.find(
        (o) => o.id === next.selection.primaryObjectId,
      );
      if (!sel) return next;
      const z = next.viewport.zoom;
      return {
        ...next,
        viewport: {
          ...next.viewport,
          panX: 480 - (sel.x + sel.width / 2) * z,
          panY: 280 - (sel.y + sel.height / 2) * z,
        },
        updatedAt: nowIso(),
      };
    }
    case "focus_mode":
      return {
        ...next,
        focusMode: action.enabled,
        focusedObjectId: action.enabled
          ? next.selection.primaryObjectId
          : null,
        updatedAt: nowIso(),
      };
    case "search": {
      const q = action.query.trim().toLowerCase();
      const matches = !q
        ? []
        : next.objects
            .filter(
              (o) =>
                o.title.toLowerCase().includes(q) ||
                o.summary.toLowerCase().includes(q),
            )
            .map((o) => o.id);
      let viewport = next.viewport;
      if (matches[0]) {
        const hit = next.objects.find((o) => o.id === matches[0]);
        if (hit) {
          const z = next.viewport.zoom;
          viewport = {
            ...viewport,
            panX: 480 - (hit.x + hit.width / 2) * z,
            panY: 280 - (hit.y + hit.height / 2) * z,
          };
        }
      }
      return {
        ...next,
        searchQuery: action.query,
        searchMatchIds: matches,
        selection:
          matches[0] != null
            ? { primaryObjectId: matches[0] }
            : next.selection,
        viewport,
        updatedAt: nowIso(),
      };
    }
    case "collapse_group": {
      return {
        ...next,
        groups: next.groups.map((g) =>
          g.id === action.groupId ? { ...g, collapsed: true } : g,
        ),
        objects: next.objects.map((o) =>
          o.metadata.groupId === action.groupId ||
          (o.type === "group" && o.metadata.groupId === action.groupId)
            ? { ...o, collapsed: true }
            : o,
        ),
        updatedAt: nowIso(),
      };
    }
    case "expand_group": {
      return {
        ...next,
        groups: next.groups.map((g) =>
          g.id === action.groupId ? { ...g, collapsed: false } : g,
        ),
        objects: next.objects.map((o) =>
          o.metadata.groupId === action.groupId ||
          (o.type === "group" && o.metadata.groupId === action.groupId)
            ? { ...o, collapsed: false }
            : o,
        ),
        updatedAt: nowIso(),
      };
    }
    case "group": {
      if (action.objectIds.length < 2) return next;
      const groupId = newId("wtg");
      const members = next.objects.filter((o) =>
        action.objectIds.includes(o.id),
      );
      const gx = Math.min(...members.map((m) => m.x));
      const gy = Math.min(...members.map((m) => m.y));
      const group: ThinkingGroup = {
        id: groupId,
        title: action.title?.trim() || "Group",
        summary: `${members.length} ideas`,
        objectIds: action.objectIds.slice(),
        collapsed: false,
        x: gx,
        y: gy,
      };
      return {
        ...next,
        groups: [...next.groups, group],
        objects: next.objects.map((o) =>
          action.objectIds.includes(o.id) ? { ...o, groupId } : o,
        ),
        updatedAt: nowIso(),
      };
    }
    case "ungroup": {
      return {
        ...next,
        groups: next.groups.filter((g) => g.id !== action.groupId),
        objects: next.objects.map((o) =>
          o.groupId === action.groupId ? { ...o, groupId: null } : o,
        ),
        updatedAt: nowIso(),
      };
    }
    case "add_idea": {
      const bounds = contentBounds(next.objects);
      const idea: ThinkingObject = {
        id: newId("wto"),
        type:
          action.ideaType === "question"
            ? "question"
            : action.ideaType === "placeholder"
              ? "placeholder"
              : action.ideaType === "action"
                ? "action"
                : "note",
        title: action.title.trim() || "New idea",
        summary: action.title.trim() || "User idea",
        sourceKind: "user_note",
        sourceBlockId: null,
        sourceKnowledgeItemId: null,
        deliverableId: null,
        groupId: null,
        x: bounds.minX,
        y: bounds.maxY + GAP_Y,
        width: OBJECT_W,
        height: OBJECT_H,
        collapsed: false,
        userCreated: true,
        immutable: false,
        metadata: { userNote: true },
      };
      return {
        ...next,
        objects: [...next.objects, idea],
        selection: { primaryObjectId: idea.id },
        updatedAt: nowIso(),
      };
    }
    case "delete_user_object": {
      const target = next.objects.find((o) => o.id === action.objectId);
      if (!target || target.immutable || !target.userCreated) return state;
      return {
        ...next,
        objects: next.objects.filter((o) => o.id !== action.objectId),
        selection:
          next.selection.primaryObjectId === action.objectId
            ? { primaryObjectId: null }
            : next.selection,
        updatedAt: nowIso(),
      };
    }
    case "auto_organize": {
      const movable = next.objects.filter((o) => o.type !== "group");
      const positions = placeObjects(movable.length, next.layoutIntent);
      const idOrder = movable.map((o) => o.id);
      return {
        ...next,
        objects: next.objects.map((o) => {
          const idx = idOrder.indexOf(o.id);
          if (idx < 0) return o;
          return {
            ...o,
            x: positions[idx]?.x ?? o.x,
            y: positions[idx]?.y ?? o.y,
          };
        }),
        viewport: fitViewportToContent(movable),
        updatedAt: nowIso(),
      };
    }
    default:
      return next;
  }
}

function isInCollapsedGroup(
  state: ThinkingWorkspaceState,
  object: ThinkingObject,
): boolean {
  if (!object.groupId) return false;
  const g = state.groups.find((x) => x.id === object.groupId);
  return Boolean(g?.collapsed);
}

export function projectVisibleWorkspaceObjects(
  state: ThinkingWorkspaceState,
): ThinkingObject[] {
  return state.objects.filter((o) => {
    if (o.type === "group") return true;
    if (o.groupId && isInCollapsedGroup(state, o)) return false;
    return true;
  });
}

export function projectInspector(
  state: ThinkingWorkspaceState,
  deliverables: VisualThinkingGeneratedDeliverable[],
): {
  title: string;
  details: string;
  related: string[];
  actions: string[];
  sourceNote: string | null;
  userCreated: boolean;
} | null {
  const id = state.selection.primaryObjectId;
  if (!id) return null;
  const obj = state.objects.find((o) => o.id === id);
  if (!obj) return null;
  const connected = state.connectors
    .filter((c) => c.fromObjectId === id || c.toObjectId === id)
    .map((c) => {
      const otherId =
        c.fromObjectId === id ? c.toObjectId : c.fromObjectId;
      return state.objects.find((o) => o.id === otherId)?.title ?? "Related";
    });
  let details = obj.summary;
  if (obj.sourceBlockId && obj.deliverableId) {
    const d = deliverables.find((x) => x.id === obj.deliverableId);
    const block = d?.blocks.find((b) => b.id === obj.sourceBlockId);
    if (block) details = block.content;
  }
  return {
    title: obj.title,
    details,
    related: connected,
    actions: obj.userCreated
      ? ["Edit note", "Remove note", "Ask Shari"]
      : ["Ask Shari", "Focus here", "Find related"],
    sourceNote: obj.immutable
      ? "From your approved result — moving this only rearranges the workspace."
      : "Your note — separate from generated knowledge.",
    userCreated: obj.userCreated,
  };
}

export function resolveBlockContent(
  object: ThinkingObject,
  deliverables: VisualThinkingGeneratedDeliverable[],
): string | null {
  if (!object.sourceBlockId || !object.deliverableId) return null;
  const d = deliverables.find((x) => x.id === object.deliverableId);
  return d?.blocks.find((b) => b.id === object.sourceBlockId)?.content ?? null;
}

// ─── Persistence ────────────────────────────────────────────────────────────

export function saveThinkingWorkspace(state: ThinkingWorkspaceState): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(WORKSPACE_SESSION_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function loadThinkingWorkspace(): ThinkingWorkspaceState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(WORKSPACE_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ThinkingWorkspaceState;
  } catch {
    return null;
  }
}

export function clearThinkingWorkspace(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(WORKSPACE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export { WORKSPACE_SESSION_KEY };
