import type { CreateWorkflowState } from "@/lib/createWorkflow";
import { resolveCreateSectionLifecycleStatus } from "./resolve";
import type {
  CreateSectionLifecycleStatus,
  EventSectionDomainStatus,
} from "./types";

/**
 * Project universal Create section status → Event Record domain status.
 * Event Record never owns Create lifecycle; this is one-way compatibility.
 */
export function toEventSectionDomainStatus(
  status: CreateSectionLifecycleStatus,
): EventSectionDomainStatus {
  switch (status) {
    case "not_started":
      return "empty";
    case "in_progress":
    case "reopened":
    case "needs_review":
      return "drafting";
    case "complete_for_now":
      return "confirmed";
    case "skipped_for_now":
      return "skipped";
    default:
      return "empty";
  }
}

/** Sync Event Record section rows from Create workflow (adapter, not SoT). */
export function syncEventSectionsFromCreateWorkflow<
  T extends {
    id: string;
    content: string;
    status: EventSectionDomainStatus;
  },
>(sections: T[], workflow: CreateWorkflowState): T[] {
  const skipped = new Set(workflow.skippedSectionIds ?? []);
  return sections.map((s) => {
    const content = workflow.sectionContent?.[s.id] ?? s.content;
    const lifecycle = resolveCreateSectionLifecycleStatus(
      { id: s.id, content, skipped: skipped.has(s.id) },
      workflow,
    );
    return {
      ...s,
      content,
      status: toEventSectionDomainStatus(lifecycle),
    };
  });
}

/**
 * Lift Event Record domain status → universal Create status (best-effort).
 * Prefer resolving from CreateWorkflowState when available.
 */
export function fromEventSectionDomainStatus(
  status: EventSectionDomainStatus,
  opts?: { hasPriorMilestone?: boolean },
): CreateSectionLifecycleStatus {
  switch (status) {
    case "empty":
      return "not_started";
    case "drafting":
      return opts?.hasPriorMilestone ? "reopened" : "in_progress";
    case "confirmed":
      return "complete_for_now";
    case "skipped":
      return "skipped_for_now";
    default:
      return "not_started";
  }
}
