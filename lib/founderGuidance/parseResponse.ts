import type {
  FounderGuidanceActionType,
  FounderGuidanceResponse,
  FounderGuidanceSuggestedAction,
} from "./types";

const VALID_ACTIONS = new Set<FounderGuidanceActionType>([
  "add_project",
  "add_experiment",
  "add_note",
  "add_issue",
  "add_tracked_experiment",
  "issue_to_experiment",
  "mark_done",
  "park",
  "export_google_doc",
  "copy_summary",
  "copy_cursor_prompt",
  "start_working",
  "research_this",
  "needs_research",
]);

function parseSuggestedAction(raw: unknown): FounderGuidanceSuggestedAction | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const type = obj.type;
  if (typeof type !== "string" || !VALID_ACTIONS.has(type as FounderGuidanceActionType)) {
    return null;
  }
  const label = typeof obj.label === "string" ? obj.label.trim() : "";
  if (!label) return null;
  const payload =
    obj.payload && typeof obj.payload === "object"
      ? (obj.payload as FounderGuidanceSuggestedAction["payload"])
      : undefined;
  return {
    type: type as FounderGuidanceActionType,
    label: label.slice(0, 120),
    payload,
  };
}

export function parseFounderGuidanceResponse(raw: string): FounderGuidanceResponse {
  const trimmed = raw.trim();
  try {
    const json = JSON.parse(trimmed) as Record<string, unknown>;
    const message =
      typeof json.message === "string" && json.message.trim()
        ? json.message.trim()
        : trimmed;
    const suggestedAction = parseSuggestedAction(json.suggestedAction);
    return { message, suggestedAction };
  } catch {
    return { message: trimmed, suggestedAction: null };
  }
}
