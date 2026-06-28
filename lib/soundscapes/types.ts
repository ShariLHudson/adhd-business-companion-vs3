import type { PeacefulPlaceId } from "@/lib/peacefulPlaces";

export type SoundscapeMoodId = "calming" | "focus" | "unwind" | "energize";

export type Soundscape = {
  id: string;
  mood: SoundscapeMoodId;
  emoji: string;
  title: string;
  description: string;
  /** Legacy environment label — prefer destinationName on directory cards. */
  environment: string;
  /** Estate destination name on directory cards. */
  destinationName: string;
  /** Season or experience subtitle on directory cards. */
  experience: string;
  /** One short emotional sentence on directory cards. */
  tagline: string;
  playbackUrl: string;
  peacefulPlaceId?: PeacefulPlaceId;
  signature?: boolean;
};

export type SoundscapeMood = {
  id: SoundscapeMoodId;
  label: string;
};

export type SoundscapePlayback = {
  id: string;
  label: string;
  description: string;
  environment: string;
  playbackUrl: string;
};
