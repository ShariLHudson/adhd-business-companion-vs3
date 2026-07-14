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

export {
  CONNECTED_PLACES,
  connectedPlacesForProjectHome,
} from "./connectedPlaces";

export {
  PROJECT_HOME_STATUS_LABEL,
  SAMPLE_PROJECT_HOMES,
  SAMPLE_PROJECTS_GALLERY_NOTE,
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
  newProjectHomeId,
  renameProjectHome,
  duplicateProjectHome,
  archiveProjectHome,
  deleteProjectHome,
  visibleGalleryHomes,
  ensureCompanionProject,
  addSectionToHome,
  addTaskToHome,
  addNoteToHome,
  listHomeProjectItems,
} from "./homeActions";
