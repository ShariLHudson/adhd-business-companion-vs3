export type CreationWorkspaceEvent =
  | "workspace_pipeline_ran"
  | "workspace_created"
  | "creation_package_projected"
  | "substance_validation_passed"
  | "substance_validation_failed"
  | "section_selected"
  | "section_edited"
  | "research_this_invoked"
  | "research_returned"
  | "missing_pieces_review"
  | "alternative_created"
  | "version_created"
  | "use_this_work_opened"
  | "destination_option_selected"
  | "handoff_prepared"
  | "handoff_approved"
  | "handoff_completed"
  | "handoff_failed"
  | "workspace_resumed"
  | "recovery_used";

export function trackCreationWorkspaceEvent(
  event: CreationWorkspaceEvent,
  meta?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      __sparkCreationWorkspaceEvents?: Array<{
        event: CreationWorkspaceEvent;
        meta?: Record<string, string | number | boolean | null>;
        at: string;
      }>;
    };
    w.__sparkCreationWorkspaceEvents = w.__sparkCreationWorkspaceEvents ?? [];
    w.__sparkCreationWorkspaceEvents.push({
      event,
      meta,
      at: new Date().toISOString(),
    });
    if (w.__sparkCreationWorkspaceEvents.length > 200) {
      w.__sparkCreationWorkspaceEvents =
        w.__sparkCreationWorkspaceEvents.slice(-100);
    }
  } catch {
    /* ignore */
  }
}
