/** Premium top-fold correspondence card — flap lifts upward. */
export type JournalNoteCardBeat =
  | "waiting"
  | "pause"
  | "lift"
  | "flap-lift"
  | "flap-open"
  | "flap-bottom"
  | "revealed"
  | "complete";

/** @deprecated Legacy envelope — retained for unused component. */
export type JournalEnvelopeBeat =
  | "waiting"
  | "pause"
  | "flap-lift"
  | "flap-open"
  | "lining-reveal"
  | "letter-peek"
  | "letter-rise"
  | "letter-unfold"
  | "complete";

/** @deprecated Gift unwrap removed. */
export type JournalGiftBeat = "hidden";

/**
 * Preparing Your Journal — one choice at a time on the writing desk.
 */
export type JournalWorkshopBeat =
  | "workshop-arrive"
  | "cover-intro"
  | "cover-select"
  | "cover-chosen"
  | "step-linger"
  | "title-intro"
  | "title-custom"
  | "title-embossing"
  | "title-linger"
  | "first-opening"
  | "paper-intro"
  | "paper-select"
  | "paper-linger"
  | "pen-intro"
  | "pen-select"
  | "pen-linger"
  | "bookmark-intro"
  | "bookmark-select"
  | "bookmark-linger"
  | "dedication-invite"
  | "future-letter"
  | "turn-to-writing"
  | "writing";

/** @deprecated Use JournalWorkshopBeat */
export type JournalBookBeat = JournalWorkshopBeat;
