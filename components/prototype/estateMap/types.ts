export type EstateMapPhase = "closed" | "lifting" | "unfolding" | "open" | "closing";

export type EstateLocation = {
  id: string;
  name: string;
  tagline: string;
  region: string;
  /** Percent position on map canvas */
  x: number;
  y: number;
  /** Current location marker */
  youAreHere?: boolean;
};
