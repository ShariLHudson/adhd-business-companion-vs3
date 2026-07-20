export type {
  EventCreationWorkspaceSnapshot,
  EventWorkspaceSectionDef,
  EventWorkspaceSectionView,
  WorkspaceSectionVisibility,
} from "./types";

export {
  focusSectionIdsForEventType,
  allEventWorkspaceSectionDefs,
  workspaceLabelForEventType,
} from "./sectionProfiles";

export {
  buildEventCreationWorkspace,
  establishedFactsFromRecord,
  acknowledgeEstablishedLead,
} from "./buildEventWorkspace";

export {
  applyEventWorkspaceToCreateWorkflow,
  eventWorkspaceTemplateSections,
} from "./applyWorkspaceToCreateWorkflow";
