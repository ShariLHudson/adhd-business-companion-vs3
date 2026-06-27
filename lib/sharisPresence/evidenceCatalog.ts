import type { ShariPresenceState } from "./types";

export const NEARBY_EVIDENCE = [
  "coffee-mug",
  "open-journal",
  "reading-glasses",
  "crochet-project",
  "fresh-flowers",
  "kinsey-toy",
] as const;

export const RETURNING_EVIDENCE = [
  "open-book",
  "warm-mug",
  "chair-pulled-back",
] as const;

export const BESIDE_YOU_EVIDENCE = [
  "handwritten-note",
  "tea",
  "blanket",
] as const;

export const EVIDENCE_BY_STATE: Record<
  ShariPresenceState,
  readonly string[]
> = {
  host: [],
  "beside-you": BESIDE_YOU_EVIDENCE,
  nearby: NEARBY_EVIDENCE,
  returning: RETURNING_EVIDENCE,
};

export const STATE_HOST_LINES: Record<ShariPresenceState, string> = {
  host: "Shari welcomes, listens, and shares the room.",
  "beside-you":
    "Shari is fully available through the Communication Anchor — the guest has space to think.",
  nearby:
    "The room holds evidence of everyday life — accompanied without being observed.",
  returning: "She's nearby if you need her.",
};
