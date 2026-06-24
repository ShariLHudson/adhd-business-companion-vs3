/**
 * P0.20.1 — Visual type availability registry (single source of truth).
 * Only `available` types may be opened or offered as creatable.
 */

import type { VisualFocusMode } from "./visualFocus/types";
import type { VisualThinkingViewId } from "./visualThinkingStudio";
import { validateVisualSourceContent } from "./visualSourceContentValidation";

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

import { isHowToLearningQuestion } from "./howToLearningIntelligence";

const VISUAL_CREATE_RE =
  /\b(?:create|build|make|open|start|help me (?:create|make|build|open)|map out|turn (?:this|it|that) into|visuali[sz]e)\b/i;

export function isVisualCreateIntent(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isHowToLearningQuestion(t)) return false;
  return VISUAL_CREATE_RE.test(t);
}

export type PlannedVisualFallbackContext = {
  priorContent?: string | null;
};

export function extractFlowStepsFromContent(content: string): string[] {
  const t = content.trim();
  if (!t) return [];

  const lines = t
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  const fromLines = lines
    .map((line) => line.replace(/^(?:\d+[\.\)]\s*|[-*•]\s*)/, "").trim())
    .filter((line) => line.length > 0);
  if (fromLines.length >= 2) return fromLines;

  const colonIdx = t.indexOf(":");
  const segment =
    colonIdx >= 0 && colonIdx < 80 ? t.slice(colonIdx + 1).trim() : t;
  const commaParts = segment
    .split(/[,;]/)
    .map((part) => part.trim().replace(/[.!?]+$/, ""))
    .filter((part) => part.length > 0 && part.length < 120);
  if (commaParts.length >= 2) return commaParts;

  return [];
}

export function formatFlowOutline(steps: string[]): string {
  return steps.join(" → ");
}

function mindMapAlternative(): string {
  if (!isVisualTypeAvailable("mind_map")) return "";
  return "\n\nOr I can open **Mind Map** instead if you want a visual version now.";
}

export function buildPlannedVisualTypeFallbackReply(
  typeId: VisualTypeId,
  context?: PlannedVisualFallbackContext,
): string {
  const alt = mindMapAlternative();
  const prior = context?.priorContent?.trim();

  switch (typeId) {
    case "flowchart": {
      if (prior) {
        const validation = validateVisualSourceContent({
          userText: `create a ${typeId.replace("_", " ")}`,
          sourceContent: prior,
        });
        if (validation.ok) {
          const steps = extractFlowStepsFromContent(prior);
          if (steps.length >= 2) {
            return [
              "Flowcharts aren't fully built into Visual Thinking yet, but I can turn those steps into a draft flow here.",
              "",
              formatFlowOutline(steps),
              alt.trim(),
            ]
              .filter(Boolean)
              .join("\n");
          }
        }
      }
      return [
        "Flowcharts aren't fully built into Visual Thinking yet, but I can still help you draft the flow here.",
        "",
        "What are the steps you want included?",
        alt.trim(),
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "diagram":
      return [
        "Diagrams aren't fully built into Visual Thinking yet.",
        "",
        "I can still help you sketch the structure here.",
        "",
        "What are you trying to show?",
        alt.trim(),
      ]
        .filter(Boolean)
        .join("\n");
    case "hierarchy_tree":
      return [
        "Hierarchy trees aren't fully built yet, but I can still outline the structure here.",
        "",
        "What is the top-level topic?",
        alt.trim(),
      ]
        .filter(Boolean)
        .join("\n");
    case "funnel_map":
      return [
        "Funnel maps aren't fully built into Visual Thinking yet, but I can still map the stages here.",
        "",
        "What is the funnel for?",
        alt.trim(),
      ]
        .filter(Boolean)
        .join("\n");
    default:
      return [
        `${VISUAL_TYPES[typeId].label}s aren't fully built into Visual Thinking yet, but I can still help you outline it here.`,
        alt.trim(),
      ]
        .filter(Boolean)
        .join("\n");
  }
}

/** @deprecated use buildPlannedVisualTypeFallbackReply */
export function buildPlannedVisualTypeReply(typeId: VisualTypeId): string {
  return buildPlannedVisualTypeFallbackReply(typeId);
}

export function resolveUnavailableVisualTypeReply(
  text: string,
  context?: PlannedVisualFallbackContext,
): string | null {
  const t = text.trim();
  if (!t || !isVisualCreateIntent(t)) return null;
  const typeId = detectVisualTypeInText(t);
  if (!typeId || isVisualTypeAvailable(typeId)) return null;
  return buildPlannedVisualTypeFallbackReply(typeId, context);
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
    "If user asks to create a planned type, explain it is not built yet, offer chat outline help, and optionally Mind Map — never open Visual Thinking or Create.",
  ].join("\n");
}
