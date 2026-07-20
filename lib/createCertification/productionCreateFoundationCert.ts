/**
 * Production certification matrix — universal Create foundation
 * with Event Plan as the reference Work Type implementation.
 *
 * Not “Create finished.” This is the baseline every future Work Type builds on.
 */

export type ProductionCertDomain =
  | "event_lifecycle"
  | "sections"
  | "continue"
  | "recovery"
  | "save_honesty"
  | "routing"
  | "export"
  | "accessibility";

export type ProductionCertCheckId =
  | "event.create"
  | "event.refresh"
  | "event.reopen"
  | "event.duplicate"
  | "event.rename"
  | "event.archive"
  | "event.restore"
  | "event.delete"
  | "event.reopen_after_restore"
  | "section.every_opens"
  | "section.every_saves"
  | "section.autosave_buffer"
  | "section.refresh_preserves"
  | "section.complete_for_now"
  | "section.reopen"
  | "section.version_snapshot"
  | "continue.multiple_events"
  | "continue.newest_oldest_order"
  | "continue.archived_listed"
  | "continue.trashed_listed"
  | "continue.work_id_stable"
  | "continue.restore_same_id"
  | "continue.refresh_no_resurrect_trashed"
  | "recovery.focus_buffer"
  | "recovery.after_reload"
  | "recovery.offline_not_saved_securely"
  | "save.never_local_as_saved"
  | "save.requires_durable_ack"
  | "save.failed_not_saved"
  | "routing.map_to_focus"
  | "routing.focus_section_id"
  | "routing.continue_same_work_id"
  | "export.toolbar_bound_to_work"
  | "export.draft_gates_print_share"
  | "a11y.map_row_labels"
  | "a11y.focus_response_label"
  | "a11y.command_toolbar";

export type ProductionCertCheck = {
  id: ProductionCertCheckId;
  domain: ProductionCertDomain;
  title: string;
};

export const PRODUCTION_CREATE_FOUNDATION_CHECKS: readonly ProductionCertCheck[] =
  [
    {
      id: "event.create",
      domain: "event_lifecycle",
      title: "Create Event yields durable Work ID + full map",
    },
    {
      id: "event.refresh",
      domain: "event_lifecycle",
      title: "Refresh restores Event by Work ID",
    },
    {
      id: "event.reopen",
      domain: "event_lifecycle",
      title: "Reopen Event from Continue uses same Work ID",
    },
    {
      id: "event.duplicate",
      domain: "event_lifecycle",
      title: "Duplicate creates new Work ID; keeps content",
    },
    {
      id: "event.rename",
      domain: "event_lifecycle",
      title: "Rename preserves Work ID",
    },
    {
      id: "event.archive",
      domain: "event_lifecycle",
      title: "Archive hides from Continue; recoverable",
    },
    {
      id: "event.restore",
      domain: "event_lifecycle",
      title: "Restore returns same Work ID to Continue",
    },
    {
      id: "event.delete",
      domain: "event_lifecycle",
      title: "Permanent delete cannot restore",
    },
    {
      id: "event.reopen_after_restore",
      domain: "event_lifecycle",
      title: "After restore, reopen focuses same Work ID",
    },
    {
      id: "section.every_opens",
      domain: "sections",
      title: "Every Event map section opens in Current Focus",
    },
    {
      id: "section.every_saves",
      domain: "sections",
      title: "Every section accepts and keeps content",
    },
    {
      id: "section.autosave_buffer",
      domain: "sections",
      title: "Autosave recovery buffer holds Focus draft",
    },
    {
      id: "section.refresh_preserves",
      domain: "sections",
      title: "Section content survives reload hydrate",
    },
    {
      id: "section.complete_for_now",
      domain: "sections",
      title: "Complete for Now does not lock",
    },
    {
      id: "section.reopen",
      domain: "sections",
      title: "Reopen completed section preserves content",
    },
    {
      id: "section.version_snapshot",
      domain: "sections",
      title: "Complete for Now stores version snapshot",
    },
    {
      id: "continue.multiple_events",
      domain: "continue",
      title: "Multiple Events appear on Continue",
    },
    {
      id: "continue.newest_oldest_order",
      domain: "continue",
      title: "Continue orders newest first",
    },
    {
      id: "continue.archived_listed",
      domain: "continue",
      title: "Archived appears in recoverable list",
    },
    {
      id: "continue.trashed_listed",
      domain: "continue",
      title: "Trashed appears in recoverable list",
    },
    {
      id: "continue.work_id_stable",
      domain: "continue",
      title: "Work IDs never swap across rename/archive",
    },
    {
      id: "continue.restore_same_id",
      domain: "continue",
      title: "Restore keeps Work ID",
    },
    {
      id: "continue.refresh_no_resurrect_trashed",
      domain: "continue",
      title: "Hydrate does not resurrect trashed work as active",
    },
    {
      id: "recovery.focus_buffer",
      domain: "recovery",
      title: "Focus recovery buffer survives close/reload",
    },
    {
      id: "recovery.after_reload",
      domain: "recovery",
      title: "Reload restores map content from Event store",
    },
    {
      id: "recovery.offline_not_saved_securely",
      domain: "recovery",
      title: "Offline / local-only never claims Saved securely",
    },
    {
      id: "save.never_local_as_saved",
      domain: "save_honesty",
      title: "Local-only and dirty never start with Saved",
    },
    {
      id: "save.requires_durable_ack",
      domain: "save_honesty",
      title: "Saved securely requires lastDurableOk",
    },
    {
      id: "save.failed_not_saved",
      domain: "save_honesty",
      title: "Failed durable write is not Saved securely",
    },
    {
      id: "routing.map_to_focus",
      domain: "routing",
      title: "Workshop Map row → Current Focus section",
    },
    {
      id: "routing.focus_section_id",
      domain: "routing",
      title: "Focus carries Section ID",
    },
    {
      id: "routing.continue_same_work_id",
      domain: "routing",
      title: "Continue resume targets same Work ID",
    },
    {
      id: "export.toolbar_bound_to_work",
      domain: "export",
      title: "Command toolbar binds data-workspace-id",
    },
    {
      id: "export.draft_gates_print_share",
      domain: "export",
      title: "Print/Export/Share enabled only with draft",
    },
    {
      id: "a11y.map_row_labels",
      domain: "accessibility",
      title: "Map rows expose aria labels (contract)",
    },
    {
      id: "a11y.focus_response_label",
      domain: "accessibility",
      title: "Current Focus response has aria-label",
    },
    {
      id: "a11y.command_toolbar",
      domain: "accessibility",
      title: "Command toolbar exposes testids for each action",
    },
  ];

export function productionCertCheckCount(): number {
  return PRODUCTION_CREATE_FOUNDATION_CHECKS.length;
}
