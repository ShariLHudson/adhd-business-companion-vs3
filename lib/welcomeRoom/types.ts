/** Permanent room — not settings, not marketing. */
export const WELCOME_ROOM_ASSET =
  "/images/shari/shari-images/shari-about-room.png" as const;

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
