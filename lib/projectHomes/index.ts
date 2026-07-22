export type * from "./types";

export {
  PROJECT_HOMES_ROOM_BACKGROUND,
  PROJECT_HOME_ROOMS,
  getProjectHomeRoom,
  listProjectHomeRooms,
  recommendProjectHome,
  resolveProjectHomeArtwork,
  getProjectHomeBackgroundUrl,
} from "./roomCatalog";

export { PROJECTS_BACKGROUND_SRC } from "@/lib/estateExperienceBackgrounds";

export {
  CONNECTED_PLACES,
  connectedPlacesForProjectHome,
} from "./connectedPlaces";

export {
  PROJECT_HOME_STATUS_LABEL,
  SAMPLE_PROJECT_HOMES,
  SAMPLE_PROJECTS_GALLERY_NOTE,
  EXPLORE_EXAMPLES_SECTION_NOTE,
  VIEW_SAMPLE_PROJECTS_PROMPT,
  formatProjectHomeDate,
  isSampleProjectHome,
} from "./sampleProjects";

export {
  shortPurpose,
  prototypeRecentProgress,
  prototypeUpcomingMilestones,
  prototypeRelatedConversations,
  prototypeOpenQuestions,
  prototypeRecentWins,
} from "./workspaceContent";

export {
  DEFAULT_PROJECT_HOME_ROOM,
  newProjectHomeId,
  mapProjectToHomeRecord,
  loadMemberProjectHomesFromStore,
  mergeMemberHomesWithStore,
  exploreExampleHomes,
  renameProjectHome,
  duplicateProjectHome,
  createPersistedProjectHome,
  createPersistedProjectHomeWithResult,
  archiveProjectHome,
  restoreProjectHome,
  setProjectHomeCurrentFocus,
  completeProjectHome,
  reopenProjectHome,
  deleteProjectHome,
  visibleGalleryHomes,
  ensureCompanionProject,
  addSectionToHome,
  addTaskToHome,
  addSubtaskToHome,
  renameHomeItem,
  deleteHomeItem,
  toggleHomeItemDone,
  moveTaskToSection,
  applyApprovedShariTask,
  addNoteToHome,
  listHomeProjectItems,
} from "./homeActions";

export type {
  DeleteProjectHomeResult,
  CreatePersistedProjectHomeResult,
} from "./homeActions";
