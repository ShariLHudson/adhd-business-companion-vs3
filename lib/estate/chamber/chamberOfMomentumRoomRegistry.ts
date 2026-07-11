/**
 * Chamber of Momentum — room registry (Phase 7 visual identity).
 */

import { CHAMBER_OF_MOMENTUM_SECTION } from "@/lib/estate/chamberOfMomentumIdentity";
import { ESTATE_ROOM_BG } from "@/lib/estate/estateRoomAssets";

export const CHAMBER_OF_MOMENTUM_ROOM_BG = ESTATE_ROOM_BG.chamberOfMomentum;

export const CHAMBER_OF_MOMENTUM_ROOM_META = {
  section: CHAMBER_OF_MOMENTUM_SECTION,
  title: "Welcome to the Chamber of Momentum",
  trademark: "Chamber of Momentum",
  subtitle: "Let's find what will help you move forward today.",
  purpose: "A guided place to discover your next best step.",
  background: CHAMBER_OF_MOMENTUM_ROOM_BG,
  status: "live" as const,
} as const;

export const CHAMBER_EXPERIENCE_TAGLINE = "I can move forward from here.";
