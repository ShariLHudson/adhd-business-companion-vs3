/** Shared arrival/ambience types — avoids circular imports with estatePlaceMedia. */

export type EstateArrivalAmbienceProfile = {
  src: string;
  volume: number;
  /** Member-facing description — not shown in UI; documents intent. */
  character: string;
};

export type EstateArrivalExperienceConfig = {
  roomId: string;
  title: string;
  motto: string;
  shariGreeting: string;
  ambience?: EstateArrivalAmbienceProfile;
  invitationAfterArrival?: boolean;
};
