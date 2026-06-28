import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";

/** Estate destination — not a playlist. */
export type PeacefulPlaceId = "summer-storm-covered-deck" | "cozy-cafe";

export type PeacefulPlaceAudioLayerRole =
  | "primary"
  | "secondary"
  | "nature"
  | "weather"
  | "interior";

/** V2 layered audio — spec stored now; Web Audio engine consumes later. */
export type PeacefulPlaceAudioLayer = {
  id: string;
  role: PeacefulPlaceAudioLayerRole;
  description: string;
  /** V1 may proxy via single stream; V2 maps to discrete assets. */
  alwaysOn?: boolean;
  intervalMinutes?: { min: number; max: number };
};

export type PeacefulPlaceWorkspaceZone = {
  /** Center stays visually quiet for workspace panels. */
  centerQuiet: true;
  layout: "left-experience | workspace | right-experience";
};

export type PeacefulPlace = {
  id: PeacefulPlaceId;
  /** Full estate name — e.g. Summer Storm at the Covered Deck™ */
  title: string;
  shortTitle: string;
  signature: boolean;
  emotionalGoal: string;
  arrivalCopy: string;
  environment: string;
  description: string;
  backgroundImageUrl: string;
  backgroundObjectPosition: string;
  workspaceZone: PeacefulPlaceWorkspaceZone;
  /** Canonical image-generation / asset brief — internal. */
  imagePrompt: string;
  audioLayers: readonly PeacefulPlaceAudioLayer[];
  /** Linked soundscape id in lib/soundscapes/catalog.ts */
  soundscapeId: string;
  /** PeacefulPlaceSession — estate copy, not player language */
  sessionLeaveLabel: string;
  sessionSoundOnLabel?: string;
  sessionSoundOffLabel?: string;
  sessionSoundNote?: string;
  audioWaitingCopy: string;
  intelligenceHooks?: IntelligenceReadyHooks;
};
