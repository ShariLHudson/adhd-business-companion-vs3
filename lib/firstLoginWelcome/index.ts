export type {
  FirstLoginWelcomeRecord,
  FirstLoginWelcomeState,
} from "./types";
export {
  FIRST_LOGIN_HOW_THIS_WORKS,
  FIRST_LOGIN_WELCOME_MESSAGE,
  FIRST_LOGIN_WELCOME_PRIMARY,
  FIRST_LOGIN_WELCOME_SECONDARY,
  FIRST_LOGIN_WELCOME_STOP,
  FIRST_LOGIN_WELCOME_SKIP_AUDIO,
  FIRST_LOGIN_WELCOME_TITLE,
} from "./types";
export {
  isWelcomeCompleted,
  loadFirstLoginWelcomeRecord,
  markWelcomeAudioPlayed,
  markWelcomeCompleted,
  mergeWelcomeRecords,
  recordFromUserMetadata,
  resetFirstLoginWelcomeLocalForTests,
} from "./persistence";
