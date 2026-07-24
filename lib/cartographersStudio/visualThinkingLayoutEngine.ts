/**
 * Visual Thinking Studio — Intelligent Layout Engine (Build 8).
 * Arranges Thinking Workspace objects for human understanding.
 * Not a force-directed graph algorithm or generic diagram engine.
 * Does not reinterpret intent, regenerate knowledge, or rewrite content.
 * Conforms to VISUAL_THINKING_WORKSPACE_EXPERIENCE_STANDARD.md
 */

import type {
  ThinkingConnector,
  ThinkingGroup,
  ThinkingObject,
  ThinkingObjectType,
  WorkspaceLayoutIntent,
  WorkspaceViewport,
} from "@/lib/cartographersStudio/visualThinkingWorkspaceFoundation";
import { resolveAdaptivePresentation } from "@/lib/adaptiveCompanionIntelligence";

// ─── Public types ───────────────────────────────────────────────────────────

export type LayoutVisualRole = "primary" | "secondary" | "supporting" | "optional";

export type LayoutViewportProfile = "desktop" | "tablet" | "mobile";

export type LayoutConnectorKind =
  | "sequence"
  | "dependency"
  | "association"
  | "comparison"
  | "containment"
  | "reference";

export type LayoutSuggestionKind =
  | "vertical_process"
  | "natural_groups"
  | "timeline"
  | "comparison"
  | "learning_progression"
  | "simpler_focus";

export type LayoutSuggestion = {
  id: string;
  kind: LayoutSuggestionKind;
  message: string;
  suggestedIntent: WorkspaceLayoutIntent | null;
};

export type LayoutObjectPlacement = {
  objectId: string;
  x: number;
  y: number;
  visualRole: LayoutVisualRole;
  readingOrder: number;
};

export type LayoutResult = {
  intent: WorkspaceLayoutIntent;
  placements: LayoutObjectPlacement[];
  positionsById: Record<string, { x: number; y: number }>;
  readingOrder: string[];
  suggestions: LayoutSuggestion[];
  groupAnchors: Record<string, { x: number; y: number }>;
  profile: LayoutViewportProfile;
};

export type LayoutProposal = {
  id: string;
  intent: WorkspaceLayoutIntent;
  positionsById: Record<string, { x: number; y: number }>;
  readingOrder: string[];
  preservedPinnedIds: string[];
  preservedUserNoteIds: string[];
  createdAt: string;
};

export type LayoutEngineInput = {
  intent: WorkspaceLayoutIntent;
  objects: ThinkingObject[];
  groups: ThinkingGroup[];
  connectors: ThinkingConnector[];
  profile?: LayoutViewportProfile;
  /** When true, Adaptive Companion may bias toward simpler / collapsed-friendly spacing. */
  respectAdaptiveCompanion?: boolean;
  focusObjectId?: string | null;
};

export type LayoutSpacing = {
  objectW: number;
  objectH: number;
  gapX: number;
  gapY: number;
  groupGap: number;
  originX: number;
  originY: number;
};

const ALL_INTENTS: WorkspaceLayoutIntent[] = [
  "process",
  "hierarchy",
  "relationship",
  "comparison",
  "timeline",
  "decision",
  "grouped_ideas",
  "learning_progression",
  "journey",
  "free_workspace",
];

export function isWorkspaceLayoutIntent(
  value: string,
): value is WorkspaceLayoutIntent {
  return (ALL_INTENTS as string[]).includes(value);
}

export function layoutSpacingForProfile(
  profile: LayoutViewportProfile,
  simplify = false,
): LayoutSpacing {
  if (profile === "mobile") {
    return {
      objectW: 220,
      objectH: 80,
      gapX: 28,
      gapY: simplify ? 36 : 32,
      groupGap: 56,
      originX: 24,
      originY: 48,
    };
  }
  if (profile === "tablet") {
    return {
      objectW: 200,
      objectH: 74,
      gapX: simplify ? 28 : 32,
      gapY: simplify ? 24 : 26,
      groupGap: 48,
      originX: 36,
      originY: 64,
    };
  }
  return {
    objectW: 200,
    objectH: 72,
    gapX: simplify ? 36 : 44,
    gapY: simplify ? 28 : 32,
    groupGap: 64,
    originX: 48,
    originY: 80,
  };
}

export function classifyConnectorKind(raw: string): LayoutConnectorKind {
  const k = raw.toLowerCase();
  if (
    k.includes("follow") ||
    k.includes("next") ||
    k.includes("sequence") ||
    k.includes("then")
  ) {
    return "sequence";
  }
  if (
    k.includes("depend") ||
    k.includes("requires") ||
    k.includes("blocks") ||
    k.includes("prerequisite")
  ) {
    return "dependency";
  }
  if (k.includes("compar") || k.includes("versus") || k.includes("vs")) {
    return "comparison";
  }
  if (k.includes("contain") || k.includes("part_of") || k.includes("includes")) {
    return "containment";
  }
  if (k.includes("ref") || k.includes("see_also") || k.includes("cites")) {
    return "reference";
  }
  return "association";
}

export function inferVisualRole(
  object: ThinkingObject,
  index: number,
  total: number,
): LayoutVisualRole {
  if (
    object.type === "title" ||
    object.type === "decision" ||
    object.type === "summary" ||
    index === 0
  ) {
    return "primary";
  }
  if (
    object.type === "step" ||
    object.type === "process" ||
    object.type === "comparison" ||
    object.type === "section"
  ) {
    return "secondary";
  }
  if (
    object.type === "warning" ||
    object.type === "supporting_resource" ||
    object.type === "glossary_term" ||
    index > total * 0.7
  ) {
    return "optional";
  }
  return "supporting";
}

function sortForIntent(
  objects: ThinkingObject[],
  intent: WorkspaceLayoutIntent,
  connectors: ThinkingConnector[],
): ThinkingObject[] {
  const copy = [...objects];
  if (intent === "timeline" || intent === "journey") {
    // Preserve content/source order — chronology is already encoded upstream.
    return copy;
  }
  if (intent === "process") {
    return copy.sort((a, b) => {
      const aStep = typeRank(a.type, intent);
      const bStep = typeRank(b.type, intent);
      if (aStep !== bStep) return aStep - bStep;
      return a.x - b.x || a.title.localeCompare(b.title);
    });
  }
  if (intent === "decision") {
    return copy.sort((a, b) => {
      const order = decisionRank(a.type) - decisionRank(b.type);
      return order !== 0 ? order : a.title.localeCompare(b.title);
    });
  }
  if (intent === "learning_progression") {
    return copy.sort((a, b) => {
      const order = learningRank(a) - learningRank(b);
      return order !== 0 ? order : a.title.localeCompare(b.title);
    });
  }
  if (intent === "hierarchy") {
    const childCounts = new Map<string, number>();
    for (const c of connectors) {
      if (classifyConnectorKind(c.kind) === "containment") {
        childCounts.set(c.fromObjectId, (childCounts.get(c.fromObjectId) ?? 0) + 1);
      }
    }
    return copy.sort((a, b) => {
      const ca = childCounts.get(a.id) ?? 0;
      const cb = childCounts.get(b.id) ?? 0;
      if (ca !== cb) return cb - ca;
      return a.title.localeCompare(b.title);
    });
  }
  if (intent === "relationship") {
    const degree = new Map<string, number>();
    for (const c of connectors) {
      degree.set(c.fromObjectId, (degree.get(c.fromObjectId) ?? 0) + 1);
      degree.set(c.toObjectId, (degree.get(c.toObjectId) ?? 0) + 1);
    }
    return copy.sort((a, b) => {
      const da = degree.get(a.id) ?? 0;
      const db = degree.get(b.id) ?? 0;
      if (da !== db) return db - da;
      return a.title.localeCompare(b.title);
    });
  }
  return copy.sort((a, b) => a.title.localeCompare(b.title));
}

function typeRank(type: ThinkingObjectType, intent: WorkspaceLayoutIntent): number {
  if (intent === "timeline" || intent === "journey") {
    if (type === "title" || type === "summary") return 0;
    if (type === "section") return 1;
    if (type === "step" || type === "process" || type === "action") return 2;
    if (type === "warning") return 4;
    return 3;
  }
  if (type === "title") return 0;
  if (type === "step" || type === "process" || type === "checklist_item") return 1;
  if (type === "action") return 2;
  if (type === "warning") return 3;
  return 2;
}

function decisionRank(type: ThinkingObjectType): number {
  switch (type) {
    case "decision":
    case "title":
      return 0;
    case "summary":
    case "concept":
      return 1;
    case "comparison":
      return 2;
    case "warning":
    case "question":
      return 4;
    default:
      return 3;
  }
}

function learningRank(object: ThinkingObject): number {
  const t = `${object.title} ${object.summary}`.toLowerCase();
  if (/overview|intro|summary/.test(t) || object.type === "summary") return 0;
  if (/foundation|basic|begin/.test(t)) return 1;
  if (/intermediate|next/.test(t)) return 2;
  if (/advanced|deep/.test(t)) return 3;
  if (/practice|try|exercise|action/.test(t) || object.type === "action") return 4;
  if (/review|recap|check/.test(t) || object.type === "checklist_item") return 5;
  if (object.type === "step") return 2;
  return 3;
}

function clusterKey(object: ThinkingObject): string {
  if (object.groupId) return `group:${object.groupId}`;
  if (object.type === "warning") return "theme:caution";
  if (object.type === "action" || object.type === "checklist_item") {
    return "function:action";
  }
  if (object.type === "step" || object.type === "process") return "phase:steps";
  if (object.type === "glossary_term") return "topic:glossary";
  if (object.userCreated) return "purpose:notes";
  return `type:${object.type}`;
}

function placeProcess(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
  profile: LayoutViewportProfile,
): LayoutObjectPlacement[] {
  const vertical = profile === "mobile" || ordered.length > 8;
  return ordered.map((o, i) => {
    const role = inferVisualRole(o, i, ordered.length);
    if (vertical) {
      return {
        objectId: o.id,
        x: spacing.originX + (role === "optional" ? 24 : 0),
        y: spacing.originY + i * (spacing.objectH + spacing.gapY),
        visualRole: role,
        readingOrder: i,
      };
    }
    // Horizontal main path; optional/warnings on a parallel lane
    const lane = role === "optional" || o.type === "warning" ? 1 : 0;
    const mainIndex =
      ordered
        .slice(0, i + 1)
        .filter((x) => inferVisualRole(x, 0, ordered.length) !== "optional" && x.type !== "warning")
        .length - 1;
    const idx = lane === 0 ? Math.max(0, mainIndex) : i;
    return {
      objectId: o.id,
      x: spacing.originX + idx * (spacing.objectW + spacing.gapX),
      y: spacing.originY + lane * (spacing.objectH + spacing.groupGap),
      visualRole: role,
      readingOrder: i,
    };
  });
}

function placeHierarchy(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  const placements: LayoutObjectPlacement[] = [];
  let cursor = 0;
  for (let level = 0; level < 4 && cursor < ordered.length; level++) {
    const count =
      level === 0 ? 1 : Math.min(ordered.length - cursor, level === 1 ? 3 : 4);
    const row = ordered.slice(cursor, cursor + count);
    const rowWidth =
      row.length * spacing.objectW + (row.length - 1) * spacing.gapX;
    const startX = Math.max(spacing.originX, 480 - rowWidth / 2);
    row.forEach((o, i) => {
      placements.push({
        objectId: o.id,
        x: startX + i * (spacing.objectW + spacing.gapX),
        y: spacing.originY + level * (spacing.objectH + spacing.gapY + 8),
        visualRole:
          level === 0 ? "primary" : level === 1 ? "secondary" : "supporting",
        readingOrder: placements.length,
      });
    });
    cursor += count;
  }
  // remainder as supporting
  while (cursor < ordered.length) {
    const o = ordered[cursor]!;
    const i = cursor;
    placements.push({
      objectId: o.id,
      x: spacing.originX + (i % 3) * (spacing.objectW + spacing.gapX),
      y: spacing.originY + 4 * (spacing.objectH + spacing.gapY + 8),
      visualRole: "optional",
      readingOrder: placements.length,
    });
    cursor++;
  }
  return placements;
}

function placeRelationship(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  if (!ordered.length) return [];
  const center = ordered[0]!;
  const rest = ordered.slice(1);
  const placements: LayoutObjectPlacement[] = [
    {
      objectId: center.id,
      x: 360,
      y: 220,
      visualRole: "primary",
      readingOrder: 0,
    },
  ];
  const ringGap = spacing.objectW + spacing.groupGap;
  rest.forEach((o, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(1, rest.length) - Math.PI / 2;
    const radius = ringGap + (i % 2) * (spacing.gapX * 0.5);
    placements.push({
      objectId: o.id,
      x: 360 + Math.cos(angle) * radius - spacing.objectW / 4,
      y: 220 + Math.sin(angle) * radius * 0.75,
      visualRole: i < 3 ? "secondary" : i < 6 ? "supporting" : "optional",
      readingOrder: i + 1,
    });
  });
  return placements;
}

function placeComparison(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  const criteria = ordered.filter(
    (o) =>
      o.type === "summary" ||
      o.type === "title" ||
      /criteria|shared|compare/i.test(o.title),
  );
  const options = ordered.filter((o) => !criteria.includes(o));
  const placements: LayoutObjectPlacement[] = [];
  criteria.forEach((o, i) => {
    placements.push({
      objectId: o.id,
      x: spacing.originX,
      y: spacing.originY + i * (spacing.objectH + spacing.gapY),
      visualRole: i === 0 ? "primary" : "secondary",
      readingOrder: placements.length,
    });
  });
  const colStart = spacing.originX + spacing.objectW + spacing.groupGap;
  options.forEach((o, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    placements.push({
      objectId: o.id,
      x: colStart + col * (spacing.objectW + spacing.gapX),
      y: spacing.originY + row * (spacing.objectH + spacing.gapY),
      visualRole: "secondary",
      readingOrder: placements.length,
    });
  });
  return placements;
}

function placeTimeline(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
  profile: LayoutViewportProfile,
): LayoutObjectPlacement[] {
  if (profile === "mobile") {
    return placeProcess(ordered, spacing, profile);
  }
  return ordered.map((o, i) => ({
    objectId: o.id,
    x: spacing.originX + i * (spacing.objectW + spacing.gapX),
    y:
      spacing.originY +
      (i % 2 === 0 ? 0 : spacing.objectH * 0.35) +
      (o.type === "warning" ? spacing.groupGap : 0),
    visualRole: inferVisualRole(o, i, ordered.length),
    readingOrder: i,
  }));
}

function placeDecision(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  const layers: ThinkingObject[][] = [[], [], [], [], []];
  for (const o of ordered) {
    const r = decisionRank(o.type);
    layers[Math.min(4, r)]!.push(o);
  }
  const placements: LayoutObjectPlacement[] = [];
  layers.forEach((layer, level) => {
    const rowWidth =
      layer.length * spacing.objectW + Math.max(0, layer.length - 1) * spacing.gapX;
    const startX = Math.max(spacing.originX, 420 - rowWidth / 2);
    layer.forEach((o, i) => {
      placements.push({
        objectId: o.id,
        x: startX + i * (spacing.objectW + spacing.gapX),
        y: spacing.originY + level * (spacing.objectH + spacing.gapY + 12),
        visualRole:
          level === 0 ? "primary" : level === 1 ? "secondary" : "supporting",
        readingOrder: placements.length,
      });
    });
  });
  return placements;
}

function placeLearning(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  return ordered.map((o, i) => ({
    objectId: o.id,
    x: spacing.originX + (learningRank(o) % 2) * 28,
    y: spacing.originY + i * (spacing.objectH + spacing.gapY),
    visualRole: i === 0 ? "primary" : i < 3 ? "secondary" : "supporting",
    readingOrder: i,
  }));
}

function placeGrouped(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
  groups: ThinkingGroup[],
): { placements: LayoutObjectPlacement[]; anchors: Record<string, { x: number; y: number }> } {
  const buckets = new Map<string, ThinkingObject[]>();
  for (const o of ordered) {
    const key = clusterKey(o);
    const list = buckets.get(key) ?? [];
    list.push(o);
    buckets.set(key, list);
  }
  const keys = [...buckets.keys()];
  const placements: LayoutObjectPlacement[] = [];
  const anchors: Record<string, { x: number; y: number }> = {};
  keys.forEach((key, clusterIndex) => {
    const col = clusterIndex % 2;
    const row = Math.floor(clusterIndex / 2);
    const baseX = spacing.originX + col * (spacing.objectW * 2 + spacing.groupGap);
    const baseY = spacing.originY + row * (spacing.objectH * 3 + spacing.groupGap);
    const groupMeta = groups.find((g) => key === `group:${g.id}`);
    if (groupMeta) anchors[groupMeta.id] = { x: baseX, y: baseY };
    const members = buckets.get(key) ?? [];
    members.forEach((o, i) => {
      placements.push({
        objectId: o.id,
        x: baseX + (i % 2) * (spacing.objectW + spacing.gapX * 0.5),
        y: baseY + Math.floor(i / 2) * (spacing.objectH + spacing.gapY),
        visualRole: i === 0 ? "secondary" : "supporting",
        readingOrder: placements.length,
      });
    });
  });
  return { placements, anchors };
}

function placeJourney(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  return ordered.map((o, i) => {
    const stage = Math.floor(i / 2);
    const lane = i % 2;
    return {
      objectId: o.id,
      x: spacing.originX + stage * (spacing.objectW + spacing.gapX),
      y: spacing.originY + lane * (spacing.objectH + spacing.groupGap * 0.6),
      visualRole: stage === 0 ? "primary" : "secondary",
      readingOrder: i,
    };
  });
}

function placeFree(
  ordered: ThinkingObject[],
  spacing: LayoutSpacing,
): LayoutObjectPlacement[] {
  const cols = 3;
  return ordered.map((o, i) => ({
    objectId: o.id,
    x: spacing.originX + (i % cols) * (spacing.objectW + spacing.gapX),
    y: spacing.originY + Math.floor(i / cols) * (spacing.objectH + spacing.gapY),
    visualRole: inferVisualRole(o, i, ordered.length),
    readingOrder: i,
  }));
}

export function buildLayoutSuggestions(
  intent: WorkspaceLayoutIntent,
  objects: ThinkingObject[],
  connectors: ThinkingConnector[],
): LayoutSuggestion[] {
  const suggestions: LayoutSuggestion[] = [];
  const steps = objects.filter(
    (o) => o.type === "step" || o.type === "process" || o.type === "checklist_item",
  ).length;
  const decisions = objects.filter((o) => o.type === "decision").length;
  const comparisons = objects.filter((o) => o.type === "comparison").length;

  if (intent === "process" && steps > 6) {
    suggestions.push({
      id: "sug_vertical_process",
      kind: "vertical_process",
      message: "This process may be easier to understand vertically.",
      suggestedIntent: "process",
    });
  }
  if (intent === "relationship" || intent === "grouped_ideas") {
    const clusterCount = new Set(objects.map(clusterKey)).size;
    if (clusterCount >= 3) {
      suggestions.push({
        id: "sug_natural_groups",
        kind: "natural_groups",
        message: "These concepts appear to form natural groups.",
        suggestedIntent: "grouped_ideas",
      });
    }
  }
  if (
    (intent === "grouped_ideas" || intent === "relationship") &&
    steps >= 3 &&
    connectors.some((c) => classifyConnectorKind(c.kind) === "sequence")
  ) {
    suggestions.push({
      id: "sug_timeline",
      kind: "timeline",
      message: "A timeline may clarify this information.",
      suggestedIntent: "timeline",
    });
  }
  if (comparisons >= 2 && intent !== "comparison") {
    suggestions.push({
      id: "sug_comparison",
      kind: "comparison",
      message: "A side-by-side comparison may make the differences clearer.",
      suggestedIntent: "comparison",
    });
  }
  if (decisions >= 1 && intent !== "decision") {
    suggestions.push({
      id: "sug_decision",
      kind: "simpler_focus",
      message: "A decision layout can separate options without picking a winner.",
      suggestedIntent: "decision",
    });
  }
  if (objects.length > 12 && intent !== "learning_progression") {
    suggestions.push({
      id: "sug_learning",
      kind: "learning_progression",
      message: "A learning progression can reveal foundations before detail.",
      suggestedIntent: "learning_progression",
    });
  }
  return suggestions.slice(0, 3);
}

/**
 * Compute intentional placements for the current layout intent.
 * Pinned and (by default) user notes keep their coordinates.
 */
export function computeLayout(input: LayoutEngineInput): LayoutResult {
  const adaptive = input.respectAdaptiveCompanion
    ? resolveAdaptivePresentation({
        destinationHint: "visual_thinking_studio",
      })
    : null;
  const profile = input.profile ?? "desktop";
  const simplify = Boolean(adaptive?.summaryFirst || adaptive?.maxVisibleChoices === 1);
  const spacing = layoutSpacingForProfile(profile, simplify);

  const layoutable = input.objects.filter((o) => o.type !== "group");
  const pinned = new Set(layoutable.filter((o) => o.pinned).map((o) => o.id));
  const ordered = sortForIntent(layoutable, input.intent, input.connectors);

  let placements: LayoutObjectPlacement[] = [];
  let groupAnchors: Record<string, { x: number; y: number }> = {};

  switch (input.intent) {
    case "process":
      placements = placeProcess(ordered, spacing, profile);
      break;
    case "hierarchy":
      placements = placeHierarchy(ordered, spacing);
      break;
    case "relationship":
      placements = placeRelationship(ordered, spacing);
      break;
    case "comparison":
      placements = placeComparison(ordered, spacing);
      break;
    case "timeline":
      placements = placeTimeline(ordered, spacing, profile);
      break;
    case "decision":
      placements = placeDecision(ordered, spacing);
      break;
    case "learning_progression":
      placements = placeLearning(ordered, spacing);
      break;
    case "journey":
      placements = placeJourney(ordered, spacing);
      break;
    case "grouped_ideas": {
      const grouped = placeGrouped(ordered, spacing, input.groups);
      placements = grouped.placements;
      groupAnchors = grouped.anchors;
      break;
    }
    case "free_workspace":
    default:
      placements = placeFree(ordered, spacing);
      break;
  }

  // Preserve pinned (and user notes unless unpinned desire to organize — mission: preserve user notes)
  const positionsById: Record<string, { x: number; y: number }> = {};
  for (const p of placements) {
    const obj = layoutable.find((o) => o.id === p.objectId);
    if (!obj) continue;
    if (pinned.has(obj.id) || obj.userCreated) {
      positionsById[obj.id] = { x: obj.x, y: obj.y };
      p.x = obj.x;
      p.y = obj.y;
    } else {
      positionsById[obj.id] = { x: p.x, y: p.y };
    }
  }

  // Focus: nudge selected object toward visual center without moving pins/notes
  if (input.focusObjectId && positionsById[input.focusObjectId]) {
    const focus = positionsById[input.focusObjectId]!;
    const dx = 360 - focus.x;
    const dy = 220 - focus.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
      for (const id of Object.keys(positionsById)) {
        const obj = layoutable.find((o) => o.id === id);
        if (!obj || obj.pinned || obj.userCreated) continue;
        const pos = positionsById[id]!;
        positionsById[id] = { x: pos.x + dx * 0.35, y: pos.y + dy * 0.35 };
      }
      for (const p of placements) {
        if (positionsById[p.objectId]) {
          p.x = positionsById[p.objectId]!.x;
          p.y = positionsById[p.objectId]!.y;
        }
      }
    }
  }

  const readingOrder = [...placements]
    .sort((a, b) => a.readingOrder - b.readingOrder)
    .map((p) => p.objectId);

  return {
    intent: input.intent,
    placements,
    positionsById,
    readingOrder,
    suggestions: buildLayoutSuggestions(input.intent, layoutable, input.connectors),
    groupAnchors,
    profile,
  };
}

export function createLayoutProposal(
  input: LayoutEngineInput,
): LayoutProposal {
  const result = computeLayout(input);
  const preservedPinnedIds = input.objects.filter((o) => o.pinned).map((o) => o.id);
  const preservedUserNoteIds = input.objects
    .filter((o) => o.userCreated)
    .map((o) => o.id);
  return {
    id: `layout_proposal_${Date.now().toString(36)}`,
    intent: result.intent,
    positionsById: result.positionsById,
    readingOrder: result.readingOrder,
    preservedPinnedIds,
    preservedUserNoteIds,
    createdAt: new Date().toISOString(),
  };
}

export function applyLayoutPositions(
  objects: ThinkingObject[],
  positionsById: Record<string, { x: number; y: number }>,
  options?: { respectPins?: boolean; respectUserNotes?: boolean },
): ThinkingObject[] {
  const respectPins = options?.respectPins !== false;
  const respectUserNotes = options?.respectUserNotes !== false;
  return objects.map((o) => {
    const next = positionsById[o.id];
    if (!next) return o;
    if (respectPins && o.pinned) return o;
    if (respectUserNotes && o.userCreated) return o;
    if (o.x === next.x && o.y === next.y) return o;
    return { ...o, x: next.x, y: next.y, manuallyMoved: false };
  });
}

export function applyVisualRoles(
  objects: ThinkingObject[],
  placements: LayoutObjectPlacement[],
): ThinkingObject[] {
  const roleById = new Map(placements.map((p) => [p.objectId, p.visualRole]));
  return objects.map((o) => {
    const role = roleById.get(o.id);
    return role ? { ...o, visualRole: role } : o;
  });
}

/** Focus viewport: keep selection central; does not move pinned content. */
export function computeFocusViewport(
  objects: ThinkingObject[],
  focusObjectId: string | null,
  zoom = 1,
): WorkspaceViewport | null {
  if (!focusObjectId) return null;
  const focus = objects.find((o) => o.id === focusObjectId);
  if (!focus) return null;
  return {
    zoom,
    panX: 480 - (focus.x + focus.width / 2) * zoom,
    panY: 280 - (focus.y + focus.height / 2) * zoom,
  };
}

export function layoutEnginePreservesContent(
  before: ThinkingObject[],
  after: ThinkingObject[],
): boolean {
  const key = (o: ThinkingObject) =>
    `${o.id}:${o.sourceBlockId}:${o.sourceKnowledgeItemId}:${o.summary}:${o.title}`;
  const a = before
    .filter((o) => o.immutable)
    .map(key)
    .sort();
  const b = after
    .filter((o) => o.immutable)
    .map(key)
    .sort();
  return JSON.stringify(a) === JSON.stringify(b);
}

export function supportedLayoutIntents(): WorkspaceLayoutIntent[] {
  return [...ALL_INTENTS];
}

export function resolveLayoutProfile(
  width: number | null | undefined,
): LayoutViewportProfile {
  if (width == null) return "desktop";
  if (width < 640) return "mobile";
  if (width < 960) return "tablet";
  return "desktop";
}
