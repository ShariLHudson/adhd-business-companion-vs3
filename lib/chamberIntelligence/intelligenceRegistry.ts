/**
 * Chamber Intelligence Registry — I-1/I-2 pilot.
 *
 * Deliberately contains ONLY the three approved pilot experts (Marketing,
 * Systems, Events). Per the migration plan
 * (docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md §6), this is
 * expected to be a partial registry during migration — any expert without
 * an entry here falls back to the existing thinking-pattern-only hint
 * (see lib/chamberExpertise/chamberExpertiseHintForChat.ts). No expert is
 * ever worse off mid-migration.
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
import type { ChamberExpertIntelligence } from "./types";

const CHAMBER_INTELLIGENCE_MODULES: Partial<Record<ChamberExpertId, ChamberExpertIntelligence>> = {
  MKT: MKT_INTELLIGENCE,
  SYS: SYS_INTELLIGENCE,
  EVT: EVT_INTELLIGENCE,
};

/** Deep intelligence for this expert, or undefined if not yet migrated. */
export function chamberIntelligenceForExpert(
  id: ChamberExpertId,
): ChamberExpertIntelligence | undefined {
  return CHAMBER_INTELLIGENCE_MODULES[id];
}

/** Pilot expert ids — used by tests and by anything that needs to know migration scope. */
export const CHAMBER_INTELLIGENCE_PILOT_EXPERT_IDS: readonly ChamberExpertId[] = ["MKT", "SYS", "EVT"];
