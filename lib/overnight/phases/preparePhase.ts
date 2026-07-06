import type { PreparePhasePayload, PrioritizePhasePayload } from "../types";
import { composePreparedOffice } from "../summary/officeComposer";

export function runPreparePhase(input: PrioritizePhasePayload): PreparePhasePayload {
  return composePreparedOffice(input.items);
}
