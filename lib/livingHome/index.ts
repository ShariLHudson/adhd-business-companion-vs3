export {
  LIVING_HOME_PERMANENT_ELEMENTS,
  LIVING_HOME_PHILOSOPHY,
  LIVING_HOME_PRINCIPLE,
  type LivingHomeEvaluation,
  type LivingHomeLifeEvent,
  type LivingHomeMotionProfile,
  type LivingHomeSeason,
  type LivingHomeShariPresence,
  type LivingHomeSurface,
  type LivingHomeTimeProfile,
  type LivingHomeWeather,
} from "./types";

export { livingHomeTimeProfileFromPeriod } from "./timeOfDay";
export { resolveLivingHomeSeason, welcomeSeasonToLivingHomeSeason } from "./season";
export { resolveLivingHomeWeather, isLivingHomeWeather } from "./weather";
export {
  resolveLivingHomeLifeEvents,
  primaryLivingHomeLifeEvent,
} from "./lifeEvents";
export { resolveLivingHomeMotion } from "./livingMotion";
export { resolveLivingHomeShariPresence } from "./shariPresence";
export { livingHomeCssVars, livingHomeDataAttributes } from "./render";
export {
  evaluateLivingHome,
  prefersReducedMotion,
  type EvaluateLivingHomeInput,
} from "./evaluateLivingHome";
export {
  LOGIN_DOORWAY_PRESENCE,
  LOGIN_DOORWAY_ZONE,
} from "./loginDoorwayPresence";
export {
  LOGIN_SCENE_ASSET,
  LOGIN_SCENE_LAYER_CLASSES,
  LOGIN_SCENE_MOTION_LAYERS,
  LOGIN_SCENE_PORCH_SIGN,
  LOGIN_SCENE_PORCH_SIGN_ASSET,
  LOGIN_SCENE_POST_EXCLUSION,
  motionMaskAvoidsPorchPost,
  type LoginSceneMotionLayer,
  type LoginSceneMotionLayerId,
} from "./loginSceneLayers";
