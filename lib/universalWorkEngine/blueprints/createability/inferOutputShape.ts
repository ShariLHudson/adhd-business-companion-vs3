import type {
  BlueprintOutputCreationState,
  BlueprintOutputType,
} from "./types";

/** Heuristic typing for provisional seed manifests only — not certification. */
export function inferOutputType(name: string): BlueprintOutputType {
  const n = name.toLowerCase();
  if (/\b(checklist|packing list)\b/.test(n)) return "checklist";
  if (/\b(brief|overview)\b/.test(n)) return "brief";
  if (/\b(pricing|budget|cost|financial|pos)\b/.test(n)) return "financial_model";
  if (/\b(forecast|projection)\b/.test(n)) return "forecast";
  if (/\b(dashboard|scorecard)\b/.test(n)) return "dashboard";
  if (/\b(timeline|run-of-show|agenda|calendar)\b/.test(n)) {
    if (/\bcalendar\b/.test(n)) return "calendar";
    return "timeline";
  }
  if (/\b(campaign)\b/.test(n)) return "campaign";
  if (/\b(photo|visual|graphic|slide)/.test(n)) return "visual_asset";
  if (/\b(email|copy|script|message|invitation)\b/.test(n)) return "content_asset";
  if (/\b(package|launch package)\b/.test(n)) return "package";
  if (/\b(workflow|procedure|sop)\b/.test(n)) return "workflow";
  if (/\b(template)\b/.test(n)) return "template";
  if (/\b(assessment|score)\b/.test(n)) return "assessment";
  if (/\b(map|matrix)\b/.test(n)) return /\bmatrix\b/.test(n) ? "matrix" : "map";
  if (/\b(report)\b/.test(n)) return "report";
  if (/\b(plan|planner)\b/.test(n)) return "plan";
  if (/\b(project|next actions)\b/.test(n)) return "project";
  return "document";
}

export function inferCreationState(
  name: string,
  outputType: BlueprintOutputType,
): BlueprintOutputCreationState {
  const n = name.toLowerCase();
  if (outputType === "visual_asset" || /\b(photo|graphic|design)\b/.test(n)) {
    return "connected";
  }
  if (
    outputType === "financial_model" ||
    outputType === "forecast" ||
    outputType === "dashboard" ||
    outputType === "scorecard" ||
    outputType === "calculation"
  ) {
    return "structured";
  }
  if (outputType === "package" || /\b(launch package|operating)\b/.test(n)) {
    return "composed";
  }
  if (outputType === "calendar" || outputType === "project") {
    return "connected";
  }
  // Section assembly can draft text — not a certified finished artifact path.
  return "draft_only";
}
