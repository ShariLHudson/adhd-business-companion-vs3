/** Bump when `welcome-home-background.png` is replaced so browsers fetch the fresh file. */
export const WELCOME_HOME_BACKGROUND_VERSION = "20260630d" as const;

/** Permanent room — not settings, not marketing. */
export const WELCOME_HOME_BACKGROUND =
  `/backgrounds/welcome-home-background.png?v=${WELCOME_HOME_BACKGROUND_VERSION}` as const;

/** @deprecated Use WELCOME_HOME_BACKGROUND */
export const WELCOME_HOME_ROOM_BACKGROUND = WELCOME_HOME_BACKGROUND;

export const WELCOME_ROOM_ASSET = WELCOME_HOME_BACKGROUND;

export type WelcomeRoomSectionId =
  | "welcome"
  | "meet-shari"
  | "why-built"
  | "faq"
  | "my-story";

/** Future Living Room Growth modules — register when implemented. */
export type WelcomeRoomFutureModuleId =
  | "bookshelf"
  | "photographs"
  | "craft-basket"
  | "journal"
  | "voice-welcome"
  | "community-wall"
  | "founder-timeline"
  | "coffee-with-shari";

export type WelcomeRoomFutureModule = {
  id: WelcomeRoomFutureModuleId;
  label: string;
  implemented: boolean;
};

export type WelcomeRoomSeason = "spring" | "summer" | "autumn" | "winter";

export type WelcomeRoomWelcomeMode = "immersive" | "listen" | "read";

export type WelcomeRoomMemory = {
  visited: boolean;
  visitCount: number;
  firstVisitedAt: string | null;
  lastVisitedAt: string | null;
  invitationDismissed: boolean;
  loginOfferDismissed: boolean;
  /** User opted into optional sunroom ambience. */
  ambienceEnabled?: boolean;
  /** Remembered Listen vs Read preference — never auto-plays voice. */
  welcomeMode?: WelcomeRoomWelcomeMode;
};
