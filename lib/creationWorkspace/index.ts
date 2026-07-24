export * from "./types";
export { projectCreationPackageToWorkspace } from "./projectPackage";
export { validateCreationWorkspaceSubstance } from "./substanceValidation";
export { decideCreationWorkspaceOpen } from "./openDecision";
export {
  selectWorkspaceSection,
  editWorkspaceItem,
  applyGeneratedSectionUpdate,
  inferSelectedAreaActions,
  applySelectedAreaAction,
  askShariAboutSelection,
  type SelectedAreaActionId,
} from "./editing";
export { inferUseThisWorkOptions } from "./useThisWork";
export {
  prepareCreationWorkspaceHandoff,
  completeHandoff,
  detectPostHandoffSyncOffer,
  handoffDestinationLabel,
} from "./handoffs";
export { researchSelectedWorkspaceArea } from "./researchThis";
export { reviewMissingPieces } from "./missingPieces";
export {
  createWorkspaceAlternative,
  createShorterAlternative,
  snapshotWorkspaceVersion,
  restoreWorkspaceVersion,
  replaceDraftWithAlternative,
} from "./alternatives";
export {
  saveCreationWorkspace,
  loadCreationWorkspace,
  loadActiveCreationWorkspace,
  listCreationWorkspaces,
  groupCreationWorkspaces,
} from "./persistence";
export {
  runRequestIntoCreationWorkspace,
  openWorkspaceFromCreationPackage,
  type CreationWorkspacePipelineResult,
} from "./runRequestIntoCreationWorkspace";
export {
  trackCreationWorkspaceEvent,
  type CreationWorkspaceEvent,
} from "./observability";
