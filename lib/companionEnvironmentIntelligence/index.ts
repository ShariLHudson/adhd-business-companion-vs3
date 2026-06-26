export {
  evaluateCompanionEnvironmentIntelligence,
  composeLivingCompanionRoom,
  hasActivePrototypeOverrides,
  recomposeLivingRoomWithPrototype,
} from "./evaluateCompanionEnvironmentIntelligence";
export { selectWelcomePhotograph } from "./selectPhotograph";
export { FEATURED_BOOK_LIBRARY, featuredBookForDay } from "./bookLibrary";
export { resolveDailyDiscovery } from "./dailyDiscovery";
export { resolveIowaWeather } from "./iowaAtmosphere";
export { IMAGE_CONTEXT_REGISTRY, imageContextById } from "./imageContextRegistry";
export { applyPermissionToShow, defaultRoomPermissionContext } from "./permissionToShow";
export { applyObjectLimits } from "./objectLimits";
export {
  DIRECTOR_STUDIO_DEMO_PATH,
  isDirectorStudioDemoMode,
  showDirectorStudio,
} from "./directorStudio";
export {
  WELCOME_ROOM_PROTOTYPE_STORAGE_KEY,
  showWelcomeRoomPrototypePanel,
} from "./welcomeRoomPrototype";
export type {
  BookCategory,
  FeaturedBook,
} from "./bookLibrary";
export {
  COMPANION_PRESENCE_WELCOME_FALLBACK_IMAGE_ID,
  effectiveWelcomePhotographId,
  welcomeImageCapabilities,
} from "./welcomeImageCapabilities";
export type { WelcomeImageCapabilities } from "./welcomeImageCapabilities";
export type { ImageContextEntry, ImageEmotionalTone } from "./imageContextRegistry";
export type {
  CompanionEnvironmentInput,
  CompanionEnvironmentIntelligence,
  CompanionMotionKind,
  CompanionMotionProfile,
  DailyDiscovery,
  LivingCompanionRoom,
  PersonalRoomPermission,
  RoomObject,
  RoomObjectKind,
  RoomPermissionContext,
  WelcomeRoomPrototypeDiscovery,
  WelcomeRoomPrototypeOverrides,
  WelcomeWeather,
} from "./types";
