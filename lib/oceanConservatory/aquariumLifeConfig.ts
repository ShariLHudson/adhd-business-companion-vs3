export type AquariumFishTone = "yellow" | "blue" | "teal" | "orange" | "silver" | "violet";
export type AquariumFishSize = "xs" | "sm" | "md" | "lg";
export type AquariumFishShape = "tang" | "streamlined" | "moorish" | "minnow";
export type AquariumFishDepth = "near" | "mid" | "far";

export type AquariumFishSpec = {
  id: string;
  tone: AquariumFishTone;
  size: AquariumFishSize;
  shape: AquariumFishShape;
  depth: AquariumFishDepth;
  path: string;
  durationSec: number;
  delaySec: number;
};

export type AquariumPlantSpec = {
  id: string;
  left: string;
  bottom: string;
  width: string;
  height: string;
  delaySec: number;
  durationSec: number;
};

export type AquariumCoralSpec = {
  id: string;
  left: string;
  bottom: string;
  width: string;
  height: string;
  tone: "pink" | "purple" | "orange";
  delaySec: number;
  durationSec: number;
};

export type AquariumBubbleSpec = {
  id: string;
  left: string;
  bottom: string;
  size: string;
  durationSec: number;
  delaySec: number;
};

export type AquariumParticleSpec = {
  id: string;
  left: string;
  top: string;
  durationSec: number;
  delaySec: number;
};

/** Independent swim paths — durations are prime-ish for non-repeating feel */
export const OCEAN_AQUARIUM_FISH: readonly AquariumFishSpec[] = [
  {
    id: "f01",
    tone: "yellow",
    size: "sm",
    shape: "tang",
    depth: "mid",
    path: "swim-1",
    durationSec: 53,
    delaySec: 0,
  },
  {
    id: "f02",
    tone: "blue",
    size: "md",
    shape: "tang",
    depth: "near",
    path: "swim-2",
    durationSec: 67,
    delaySec: 4,
  },
  {
    id: "f03",
    tone: "teal",
    size: "xs",
    shape: "minnow",
    depth: "far",
    path: "swim-3",
    durationSec: 41,
    delaySec: 9,
  },
  {
    id: "f04",
    tone: "orange",
    size: "sm",
    shape: "minnow",
    depth: "mid",
    path: "swim-4",
    durationSec: 59,
    delaySec: 2,
  },
  {
    id: "f05",
    tone: "silver",
    size: "lg",
    shape: "streamlined",
    depth: "mid",
    path: "swim-5",
    durationSec: 89,
    delaySec: 11,
  },
  {
    id: "f06",
    tone: "yellow",
    size: "xs",
    shape: "minnow",
    depth: "far",
    path: "swim-6",
    durationSec: 37,
    delaySec: 16,
  },
  {
    id: "f07",
    tone: "blue",
    size: "sm",
    shape: "tang",
    depth: "far",
    path: "swim-7",
    durationSec: 47,
    delaySec: 7,
  },
  {
    id: "f08",
    tone: "violet",
    size: "md",
    shape: "moorish",
    depth: "near",
    path: "swim-8",
    durationSec: 71,
    delaySec: 19,
  },
  {
    id: "f09",
    tone: "teal",
    size: "sm",
    shape: "streamlined",
    depth: "mid",
    path: "swim-9",
    durationSec: 43,
    delaySec: 23,
  },
  {
    id: "f10",
    tone: "yellow",
    size: "md",
    shape: "tang",
    depth: "near",
    path: "swim-10",
    durationSec: 61,
    delaySec: 5,
  },
  {
    id: "f11",
    tone: "orange",
    size: "xs",
    shape: "minnow",
    depth: "far",
    path: "swim-11",
    durationSec: 39,
    delaySec: 28,
  },
  {
    id: "f12",
    tone: "silver",
    size: "sm",
    shape: "streamlined",
    depth: "far",
    path: "swim-12",
    durationSec: 57,
    delaySec: 14,
  },
  {
    id: "f13",
    tone: "blue",
    size: "lg",
    shape: "streamlined",
    depth: "mid",
    path: "swim-13",
    durationSec: 97,
    delaySec: 31,
  },
  {
    id: "f14",
    tone: "teal",
    size: "xs",
    shape: "minnow",
    depth: "mid",
    path: "swim-14",
    durationSec: 33,
    delaySec: 8,
  },
  {
    id: "f15",
    tone: "yellow",
    size: "sm",
    shape: "tang",
    depth: "mid",
    path: "swim-15",
    durationSec: 49,
    delaySec: 21,
  },
];

/** Soft sway fields aligned to kelp in the room plate — blur only, no solid strips */
export const OCEAN_AQUARIUM_PLANTS: readonly AquariumPlantSpec[] = [
  {
    id: "k1",
    left: "46.5%",
    bottom: "15%",
    width: "3.2rem",
    height: "38%",
    delaySec: 0,
    durationSec: 7.4,
  },
  {
    id: "k2",
    left: "54%",
    bottom: "14%",
    width: "2.8rem",
    height: "44%",
    delaySec: 1.2,
    durationSec: 8.6,
  },
  {
    id: "k3",
    left: "61%",
    bottom: "15%",
    width: "3.5rem",
    height: "46%",
    delaySec: 0.5,
    durationSec: 7.9,
  },
  {
    id: "k4",
    left: "70%",
    bottom: "14%",
    width: "3rem",
    height: "40%",
    delaySec: 2.1,
    durationSec: 9.2,
  },
  {
    id: "k5",
    left: "78%",
    bottom: "16%",
    width: "2.6rem",
    height: "34%",
    delaySec: 1.6,
    durationSec: 8.1,
  },
  {
    id: "k6",
    left: "86%",
    bottom: "17%",
    width: "2.2rem",
    height: "28%",
    delaySec: 3,
    durationSec: 7.2,
  },
];

/** Gentle polyp sway on coral clusters — soft-light shimmer, not visible dots */
export const OCEAN_AQUARIUM_CORAL: readonly AquariumCoralSpec[] = [
  {
    id: "c1",
    left: "48%",
    bottom: "13%",
    width: "4.5rem",
    height: "3.2rem",
    tone: "purple",
    delaySec: 0,
    durationSec: 6.2,
  },
  {
    id: "c2",
    left: "56%",
    bottom: "12%",
    width: "5rem",
    height: "3.6rem",
    tone: "pink",
    delaySec: 1.1,
    durationSec: 5.8,
  },
  {
    id: "c3",
    left: "64%",
    bottom: "11%",
    width: "4.8rem",
    height: "3.4rem",
    tone: "orange",
    delaySec: 0.7,
    durationSec: 6.8,
  },
  {
    id: "c4",
    left: "72%",
    bottom: "12%",
    width: "5.2rem",
    height: "3.8rem",
    tone: "purple",
    delaySec: 2.3,
    durationSec: 7.1,
  },
  {
    id: "c5",
    left: "80%",
    bottom: "13%",
    width: "4.2rem",
    height: "3rem",
    tone: "pink",
    delaySec: 1.8,
    durationSec: 6.4,
  },
  {
    id: "c6",
    left: "88%",
    bottom: "12%",
    width: "3.8rem",
    height: "2.8rem",
    tone: "orange",
    delaySec: 2.9,
    durationSec: 5.5,
  },
  {
    id: "c7",
    left: "52%",
    bottom: "16%",
    width: "3.6rem",
    height: "2.6rem",
    tone: "pink",
    delaySec: 0.4,
    durationSec: 7.4,
  },
];

export const OCEAN_AQUARIUM_BUBBLES: readonly AquariumBubbleSpec[] = [
  { id: "b1", left: "48%", bottom: "18%", size: "3px", durationSec: 14, delaySec: 0 },
  { id: "b2", left: "49%", bottom: "16%", size: "2px", durationSec: 11, delaySec: 3 },
  { id: "b3", left: "47%", bottom: "17%", size: "2px", durationSec: 16, delaySec: 6 },
  { id: "b4", left: "63%", bottom: "15%", size: "3px", durationSec: 13, delaySec: 1 },
  { id: "b5", left: "64%", bottom: "14%", size: "2px", durationSec: 12, delaySec: 5 },
  { id: "b6", left: "78%", bottom: "16%", size: "3px", durationSec: 15, delaySec: 2 },
  { id: "b7", left: "79%", bottom: "13%", size: "2px", durationSec: 10, delaySec: 7 },
  { id: "b8", left: "88%", bottom: "17%", size: "2px", durationSec: 17, delaySec: 4 },
  { id: "b9", left: "55%", bottom: "19%", size: "2px", durationSec: 18, delaySec: 9 },
  { id: "b10", left: "71%", bottom: "18%", size: "2px", durationSec: 14, delaySec: 11 },
];

export const OCEAN_AQUARIUM_PARTICLES: readonly AquariumParticleSpec[] = [
  { id: "d1", left: "44%", top: "28%", durationSec: 22, delaySec: 0 },
  { id: "d2", left: "52%", top: "35%", durationSec: 27, delaySec: 4 },
  { id: "d3", left: "61%", top: "42%", durationSec: 19, delaySec: 8 },
  { id: "d4", left: "70%", top: "30%", durationSec: 24, delaySec: 2 },
  { id: "d5", left: "79%", top: "38%", durationSec: 21, delaySec: 11 },
  { id: "d6", left: "86%", top: "45%", durationSec: 26, delaySec: 6 },
  { id: "d7", left: "58%", top: "52%", durationSec: 23, delaySec: 14 },
  { id: "d8", left: "67%", top: "24%", durationSec: 20, delaySec: 9 },
  { id: "d9", left: "74%", top: "56%", durationSec: 28, delaySec: 3 },
  { id: "d10", left: "82%", top: "32%", durationSec: 25, delaySec: 16 },
  { id: "d11", left: "91%", top: "48%", durationSec: 18, delaySec: 7 },
  { id: "d12", left: "50%", top: "46%", durationSec: 29, delaySec: 12 },
];
