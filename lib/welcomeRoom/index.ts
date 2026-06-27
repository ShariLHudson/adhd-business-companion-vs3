export {
  WELCOME_ROOM_ASSET,
  type WelcomeRoomFutureModule,
  type WelcomeRoomFutureModuleId,
  type WelcomeRoomMemory,
  type WelcomeRoomSeason,
  type WelcomeRoomSectionId,
  type WelcomeRoomWelcomeMode,
} from "./types";

export {
  WELCOME_ROOM_FUTURE_MODULES,
  WELCOME_ROOM_INVITATION,
  WELCOME_ROOM_GREETING,
  WELCOME_ROOM_LETTER,
  WELCOME_ROOM_LEAVE_INVITATION,
  WELCOME_ROOM_COMPANION_EXIT,
  WELCOME_ROOM_LOGIN_OFFER,
  WELCOME_ROOM_PERSONAL_INVITE,
  WELCOME_ROOM_SECTIONS,
  WELCOME_ROOM_VOICE_CONTROLS,
  WELCOME_ROOM_GREETING_SPEECH,
  welcomeRoomWelcomeBodySpeechText,
  welcomeRoomLetterSpeechText,
  type WelcomeRoomContentSection,
  type WelcomeRoomFaqItem,
} from "./content";

export {
  WELCOME_ROOM_ARRIVAL_MS,
  WELCOME_ROOM_ARRIVAL_ZOOM,
  WELCOME_ROOM_CHAIR_VIEW,
  WELCOME_ROOM_DARK_MS,
  WELCOME_ROOM_DOLLY_MS,
  WELCOME_ROOM_DOORWAY_VIEW,
  WELCOME_ROOM_ENTRANCE_VIEW,
  WELCOME_ROOM_FADE_MS,
  WELCOME_ROOM_INVITE_DELAY_MS,
  WELCOME_ROOM_LETTER_DELAY_MS,
  WELCOME_ROOM_OUTSIDE_HOLD_MS,
  WELCOME_ROOM_PAUSE_MS,
  WELCOME_ROOM_REVEAL_MS,
  WELCOME_ROOM_READY_ELAPSED_MS,
  WELCOME_ROOM_WALK_IN_MS,
  easeOutCubic,
  prefersReducedMotion,
  welcomeRoomArrivalPhase,
  welcomeRoomCinematicDollyProgress,
  welcomeRoomDarkOpacity,
  welcomeRoomDollyFrame,
  welcomeRoomDollyProgress,
  welcomeRoomFadeOpacity,
  WELCOME_ROOM_MUSIC_START_MS,
  WELCOME_ROOM_PLAY_MUSIC_START_MS,
  WELCOME_ROOM_PLAY_VOICE_START_MS,
  WELCOME_ROOM_SILENCE_MS,
  WELCOME_ROOM_VOICE_START_MS,
  welcomeRoomShowReadOffer,
  type WelcomeRoomArrivalPhase,
  type WelcomeRoomDollyFrame,
} from "./arrival";

export {
  markWelcomeRoomOpenedWithGesture,
  hasPendingWelcomeRoomGestureUnlock,
  clearWelcomeRoomGestureUnlock,
  consumeWelcomeRoomOpenedWithGesture,
} from "./welcomeRoomGesture";

export {
  useWelcomeRoomArrival,
  type WelcomeRoomArrivalState,
} from "./useWelcomeRoomArrival";

export {
  WELCOME_ROOM_AMBIENCE_CREDIT,
  WELCOME_ROOM_AMBIENCE_DUCK_VOLUME,
  WELCOME_ROOM_AMBIENCE_FADE_MS,
  WELCOME_ROOM_AMBIENCE_LABELS,
  WELCOME_ROOM_AMBIENCE_PAUSE_VOLUME,
  WELCOME_ROOM_AMBIENCE_RESTORE_MS,
  WELCOME_ROOM_AMBIENCE_SRC,
  WELCOME_ROOM_AMBIENCE_VOLUME,
} from "./ambience";

export { useWelcomeRoomAmbience } from "./useWelcomeRoomAmbience";

export {
  clearWelcomeRoomInvitationPending,
  dismissWelcomeRoomInvitation,
  dismissWelcomeRoomLoginOffer,
  getWelcomeRoomAmbienceEnabled,
  getWelcomeRoomMemory,
  getWelcomeRoomWelcomeMode,
  hasVisitedWelcomeRoom,
  peekWelcomeRoomInvitationPending,
  recordWelcomeRoomVisit,
  resetWelcomeRoomMemoryForTests,
  scheduleWelcomeRoomInvitation,
  setWelcomeRoomAmbienceEnabled,
  setWelcomeRoomWelcomeMode,
  shouldShowWelcomeRoomInvitation,
  shouldShowWelcomeRoomLoginOffer,
} from "./persistence";

export { resolveWelcomeRoomSeason, type WelcomeRoomSeasonProfile } from "./seasonal";

export {
  isWelcomeRoomConversation,
  WELCOME_ROOM_CONVERSATION_REPLY,
  welcomeRoomWorkspaceOffer,
} from "./conversationOffers";
