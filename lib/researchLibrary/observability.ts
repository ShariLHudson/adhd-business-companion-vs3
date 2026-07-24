/**
 * Internal Research Library telemetry — never expose to members.
 * Does not store sensitive research body text.
 */

export type ResearchLibraryEvent =
  | "research_library_opened"
  | "research_request_submitted"
  | "research_mode_inferred"
  | "live_research_attempted"
  | "source_type_used"
  | "findings_added"
  | "follow_up_question_asked"
  | "research_collection_created"
  | "use_this_research_opened"
  | "format_options_inferred"
  | "option_selected"
  | "dynamic_blueprint_created"
  | "creation_generated"
  | "project_proposal_generated"
  | "visual_handoff_opened"
  | "strategy_handoff_opened"
  | "research_continued"
  | "research_refreshed"
  | "failure_recovery";

export function trackResearchLibraryEvent(
  event: ResearchLibraryEvent,
  meta?: Record<string, string | number | boolean | null>,
): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      __sparkResearchLibraryEvents?: Array<{
        event: ResearchLibraryEvent;
        meta?: Record<string, string | number | boolean | null>;
        at: string;
      }>;
    };
    w.__sparkResearchLibraryEvents = w.__sparkResearchLibraryEvents ?? [];
    w.__sparkResearchLibraryEvents.push({
      event,
      meta,
      at: new Date().toISOString(),
    });
    if (w.__sparkResearchLibraryEvents.length > 200) {
      w.__sparkResearchLibraryEvents =
        w.__sparkResearchLibraryEvents.slice(-100);
    }
  } catch {
    /* ignore */
  }
}
