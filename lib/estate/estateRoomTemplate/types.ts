/**
 * Estate Room Template — five-layer room arrival contract.
 * @see docs/ESTATE_ROOM_TEMPLATE.md
 */

export type EstateRoomTemplateHero = {
  title: string;
  subtitle: string;
  purpose: string;
};

export type EstateRoomTemplateWelcome = {
  /** Shari's arrival line — hospitality, not instructions */
  shariLine: string;
  /** Optional follow-on paragraphs — same voice, one thought at a time */
  shariParagraphs?: readonly string[];
};

export type EstateRoomTemplateEmptyState = {
  /** Shown inside the feature layer when nothing is saved yet */
  headline: string;
  /** Optional supporting line */
  detail?: string;
};

/** Full template spec a room inherits */
export type EstateRoomTemplate = {
  roomId: string;
  hero: EstateRoomTemplateHero;
  welcome: EstateRoomTemplateWelcome;
  emptyState: EstateRoomTemplateEmptyState;
};
