/**
 * Journal Gazebo™ — unhurried ceremony; linger between steps.
 * Paced ~18% slower — luxury never rushes.
 */

const PACE = 1.18;
/** Envelope / note card — unhurried, ceremonial (+38% on note beats). */
const NOTE_CEREMONY = 1.38;

function pace(ms: number): number {
  return Math.round(ms * PACE);
}

function noteCeremony(ms: number): number {
  return pace(Math.round(ms * NOTE_CEREMONY));
}

export const CINEMATIC = {
  arrivalMs: pace(6200),
  estateStillnessMs: pace(2200),
  /** Quiet beat — birds, water, wind; no UI */
  estateBreatheMs: pace(1200),
  notePauseMs: noteCeremony(600),
  noteLiftMs: noteCeremony(900),
  noteFlapLiftMs: noteCeremony(1200),
  noteFlapOpenMs: noteCeremony(1100),
  noteFlapBottomMs: noteCeremony(1100),
  noteRevealMs: noteCeremony(1100),
  noteFoldCloseMs: noteCeremony(1600),
  workshopGlideMs: pace(3200),
  stepLingerMs: pace(1800),
  coverSelectPauseMs: pace(2200),
  titleCycleMs: pace(2400),
  titleEmbossMs: pace(1600),
  titleLingerMs: pace(2000),
  bookmarkLingerMs: pace(1800),
  journalCoverOpenMs: pace(5800),
  pageTurnMs: pace(2400),
  pageTurnPauseMs: pace(700),
  /** Linger on a finished page before the turn arrow feels ready */
  pageAdmireMs: pace(1200),
  cameraShiftJournalMs: pace(2800),
  handcraftPauseMs: pace(2200),
  /** Finished journal alone — admire before wrapping */
  giftCraftedAdmireMs: pace(1800),
  giftWrappingMs: pace(2200),
  giftWrappedPauseMs: pace(1400),
  giftBowMs: pace(1600),
  giftRibbonPullMs: pace(1200),
  giftRibbonMs: pace(1600),
  giftUnwrapMs: pace(2400),
  giftRevealMs: pace(2800),
  giftAdmireMs: pace(5200),
  journalRevealAdmireMs: pace(4800),
  /** Spark whisper after Open today's page / journal ready */
  sparkLineMs: pace(7200),
  sparkInviteMs: pace(6500),
} as const;

export type CinematicTimingKey = keyof typeof CINEMATIC;
