/**
 * Cartographer's Studio public exports.
 */

export {
  CARTOGRAPHERS_STUDIO_BACKGROUND,
  CARTOGRAPHERS_STUDIO_PLACE_ID,
  CARTOGRAPHERS_STUDIO_OFFICIAL_NAME,
  CARTOGRAPHERS_ATLAS_SAVE_LINE,
  CARTOGRAPHERS_RETURN_TO_ESTATE,
  CARTOGRAPHERS_RESUME_PREVIOUS,
  CARTOGRAPHERS_CONTINUE_MAPPING,
  CARTOGRAPHERS_HELP,
  CARTOGRAPHERS_BROWSE_MAP_TYPES,
  CARTOGRAPHERS_EXIT,
  CARTOGRAPHERS_UPDATE_MAP,
  CARTOGRAPHERS_ASK_SHARI,
} from "./media";

export {
  CARTOGRAPHERS_FRAMED_MAPS,
  CARTOGRAPHERS_ROOM_INTRO,
  CARTOGRAPHERS_ATLAS_TEASER,
  getFramedMapById,
  wallSelectableFramedMaps,
  type CartographersFramedMap,
  type CartographersFramedMapId,
} from "./framedMaps";

export {
  CARTOGRAPHY_MAP_REGISTRY,
  productionWallMaps,
  namingMatrixRow,
  assertMindMapNamingConsistent,
  assertAllWallMapsActiveAndNamed,
  canonicalMapName,
  getCartographyMapDefinition,
  getCartographyMapDefinitionByMode,
  visualFocusModeForWallMap,
  type CartographyMapRegistryEntry,
  type CartographyProductionStatus,
} from "./mapRegistry";

export {
  CARTOGRAPHY_MAP_DEFINITIONS,
  activeCartographyMaps,
  type CartographyMapDefinition,
  type CartographyStepDefinition,
} from "./mapDefinitions";

export {
  CARTOGRAPHERS_ATLAS_ENTRIES,
  CARTOGRAPHERS_ATLAS_INTRO,
  getAtlasEntry,
  type CartographersAtlasEntry,
} from "./atlas";

export {
  detectsVisualBeginnerUnsure,
  formatVisualBeginnerChoiceMessage,
  parseVisualBeginnerChoice,
  isVisualBeginnerChoiceMessage,
  VISUAL_BEGINNER_CHOICE_LINE,
  type VisualBeginnerChoice,
} from "./visualBeginnerChoice";

export {
  CARTOGRAPHERS_WELCOME_TITLE,
  CARTOGRAPHERS_WELCOME_SUBTITLE,
  CARTOGRAPHERS_WELCOME_BODY,
  CARTOGRAPHERS_WELCOME_BEGIN_HEADING,
  CARTOGRAPHERS_WELCOME_TELL_SPARK,
  CARTOGRAPHERS_WELCOME_CLICK_FRAME,
  CARTOGRAPHERS_WELCOME_ABOUT_HEADING,
  CARTOGRAPHERS_WELCOME_MAP_BLURBS,
  CARTOGRAPHERS_WELCOME_FOOTER,
  CARTOGRAPHERS_WELCOME_REQUEST_EVENT,
  hasDismissedCartographersWelcome,
  dismissCartographersWelcome,
  requestCartographersWelcome,
} from "./welcome";
