/**
 * P0.20.1 — Visual type availability registry (single source of truth).
 * Only `available` types may be opened or offered as creatable.
 */

import type { VisualFocusMode } from "./visualFocus/types";
import type { VisualThinkingViewId } from "./visualThinkingStudio";

export type VisualTypeId =
  | "mind_map"
  | "decision_tree"
  | "flowchart"
  | "diagram"
  | "hierarchy_tree"
  | "funnel_map";

export type VisualTypeStatus = "available" | "planned";

export type VisualTypeDef = {
  status: VisualTypeStatus;
  label: string;
  viewId: VisualThinkingViewId;
  mode: VisualFocusMode;
  aliases: RegExp[];
};

export const VISUAL_TYPES: Record<VisualTypeId, VisualTypeDef> = {
  mind_map: {
    status: "available",
    label: "Mind Map",
    viewId: "mind-map",
    mode: "mind-map",
    aliases: [/\bmind\s*maps?\b/i, /\bvisual\s*maps?\b/i],
  },
  decision_tree: {
    status: "available",
    label: "Decision Tree",
    viewId: "decision-tree",
    mode: "decision-tree",
    aliases: [/\bdecision\s*trees?\b/i, /\bdecision\s*maps?\b/i],
  },
  flowchart: {
    status: "planned",
    label: "Flowchart",
    viewId: "process-flow",
    mode: "decision-tree",
    aliases: [
      /\bflowcharts?\b/i,
      /\bflow\s*charts?\b/i,
      /\bprocess\s*flows?\b/i,
    ],
  },
  diagram: {
    status: "planned",
    label: "Diagram",
    viewId: "mind-map",
    mode: "mind-map",
    aliases: [/\bdiagrams?\b/i],
  },
  hierarchy_tree: {
    status: "planned",
    label: "Hierarchy Tree",
    viewId: "hierarchy-tree",
    mode: "project-map",
    aliases: [
      /\bhierarchy\s*(?:trees?|maps?)\b/i,
      /\bhierarch(?:y|ical)\s*(?:chart|structure)\b/i,
      /\b(?:create|build|make)\s+(?:a |an )?hierarchy\b/i,
    ],
  },
  funnel_map: {
    status: "planned",
    label: "Funnel Map",
    viewId: "funnel-map",
    mode: "strategy-map",
    aliases: [/\bfunnel\s*maps?\b/i],
  },
};

const VISUAL_TYPE_IDS = Object.keys(VISUAL_TYPES) as VisualTypeId[];

export function isVisualTypeAvailable(typeId: VisualTypeId): boolean {
  return VISUAL_TYPES[typeId]?.status === "available";
}

export function availableVisualTypeIds(): VisualTypeId[] {
  return VISUAL_TYPE_IDS.filter((id) => isVisualTypeAvailable(id));
}

export function detectVisualTypeInText(text: string): VisualTypeId | null {
  const t = text.trim();
  if (!t) return null;
  for (const id of VISUAL_TYPE_IDS) {
    if (VISUAL_TYPES[id].aliases.some((re) => re.test(t))) return id;
  }
  return null;
}

export function viewIdToVisualTypeId(
  viewId: VisualThinkingViewId,
): VisualTypeId | null {
  for (const id of VISUAL_TYPE_IDS) {
    if (VISUAL_TYPES[id].viewId === viewId) return id;
  }
  return null;
}

export function isViewIdAvailable(viewId: VisualThinkingViewId): boolean {
  const typeId = viewIdToVisualTypeId(viewId);
  if (!typeId) return true;
  return isVisualTypeAvailable(typeId);
}

export function isPlannedVisualTypeRequest(text: string): boolean {
  const typeId = detectVisualTypeInText(text);
  if (!typeId) return false;
  return VISUAL_TYPES[typeId].status === "planned";
}

const VISUAL_CREATE_RE =
  /\b(?:create|build|make|open|start|help me (?:create|make|build|open)|map out|turn (?:this|it|that) into|visuali[sz]e)\b/i;

export function isVisualCreateIntent(text: string): boolean {
  return VISUAL_CREATE_RE.test(text.trim());
}

export function buildPlannedVisualTypeReply(typeId: VisualTypeId): string {
  const def = VISUAL_TYPES[typeId];
  const alt =
    isVisualTypeAvailable("mind_map")
      ? " I can still outline the steps here, or we can use a mind map if that would help."
      : " I can still outline the steps here in chat.";
  return `${def.label}s aren't built into Visual Thinking yet.${alt}`;
}

export function resolveUnavailableVisualTypeReply(
  text: string,
): string | null {
  const t = text.trim();
  if (!t || !isVisualCreateIntent(t)) return null;
  const typeId = detectVisualTypeInText(t);
  if (!typeId || isVisualTypeAvailable(typeId)) return null;
  return buildPlannedVisualTypeReply(typeId);
}

export function visualTypeAvailabilityHintForChat(): string {
  const available = availableVisualTypeIds()
    .map((id) => VISUAL_TYPES[id].label)
    .join(", ");
  const planned = VISUAL_TYPE_IDS.filter((id) => !isVisualTypeAvailable(id))
    .map((id) => VISUAL_TYPES[id].label)
    .join(", ");
  return [
    "VISUAL TYPE AVAILABILITY (P0.20.1):",
    `Available now: ${available}.`,
    `Planned (do not open or promise): ${planned}.`,
    "Learn questions (what is, how is it used, explain) → answer in chat — never open Visual Thinking.",
    "If user asks to create a planned type, say it is not built yet and offer chat outline or mind map.",
  ].join("\n");
}
