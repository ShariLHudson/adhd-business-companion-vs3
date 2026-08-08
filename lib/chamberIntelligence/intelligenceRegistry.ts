/**
 * Chamber Intelligence Registry — I-1/I-2 pilot + I-4 batch 1.
 *
 * Contains the three approved pilot experts (Marketing, Systems, Events)
 * plus the first evidence-driven expansion batch (Strategy, Client
 * Relationships — chosen by activation frequency across both
 * founder-language validation rounds, see
 * docs/estate/CHAMBER_ACTIVATION_V2_NEXT_BATCH.md). Per the migration
 * plan (docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md §6), this
 * is expected to be a partial registry during migration — any expert
 * without an entry here falls back to the existing thinking-pattern-only
 * hint (see lib/chamberExpertise/chamberExpertiseHintForChat.ts). No
 * expert is ever worse off mid-migration. Deliberately NOT expanded to
 * all 24 at once — small, evidence-driven batches only.
 *
 * This is a lookup table, not a second activation system — it never
 * decides WHO is relevant (that's resolveChamberExpertActivation.ts); it
 * only answers "do we have deep intelligence for this already-activated
 * expert?"
 */

import type { ChamberExpertId } from "@/lib/chamberExpertise/types";
import { MKT_INTELLIGENCE } from "./experts/MKT";
import { SYS_INTELLIGENCE } from "./experts/SYS";
import { EVT_INTELLIGENCE } from "./experts/EVT";
import { STR_INTELLIGENCE } from "./experts/STR";
import { CR_INTELLIGENCE } from "./experts/CR";
import type { ChamberExpertIntelligence } from "./types";

const CHAMBER_INTELLIGENCE_MODULES: Partial<Record<ChamberExpertId, ChamberExpertIntelligence>> = {
  MKT: MKT_INTELLIGENCE,
  SYS: SYS_INTELLIGENCE,
  EVT: EVT_INTELLIGENCE,
  STR: STR_INTELLIGENCE,
  CR: CR_INTELLIGENCE,
};

/** Deep intelligence for this expert, or undefined if not yet migrated. */
export function chamberIntelligenceForExpert(
  id: ChamberExpertId,
): ChamberExpertIntelligence | undefined {
  return CHAMBER_INTELLIGENCE_MODULES[id];
}

/** Migrated expert ids — used by tests and by anything that needs to know migration scope. */
export const CHAMBER_INTELLIGENCE_PILOT_EXPERT_IDS: readonly ChamberExpertId[] = [
  "MKT",
  "SYS",
  "EVT",
  "STR",
  "CR",
];
