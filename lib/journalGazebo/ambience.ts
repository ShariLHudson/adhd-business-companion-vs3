/**
 * Journal Gazebo™ ambient layers — gentle estate atmosphere.
 * Assets optional; silence is valid until plates are added to public/audio/.
 */

export const JOURNAL_GAZEBO_AMBIENCE = {
  water: "/audio/journal-gazebo-water.mp3",
  birds: "/audio/journal-gazebo-birds.mp3",
  breeze: "/audio/journal-gazebo-breeze.mp3",
  piano: "/audio/journal-gazebo-piano.mp3",
} as const;

export type JournalGazeboAmbienceLayer = keyof typeof JOURNAL_GAZEBO_AMBIENCE;
