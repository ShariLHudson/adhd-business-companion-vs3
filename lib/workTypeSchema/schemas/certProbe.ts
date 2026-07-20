/**
 * Minimal Work Type used only to prove schema-only registration
 * without modifying shared Create runtime. Not a product Work Type.
 */

import type { WorkTypeSchema } from "../types";
import { registerWorkTypeSchema } from "../registry";

export const CERT_PROBE_WORK_TYPE_ID = "cert_probe";

export const CERT_PROBE_MAP_SECTIONS = [
  { id: "intent", title: "Intent" },
  { id: "outcome", title: "Desired Outcome" },
  { id: "next_step", title: "Next Step" },
] as const;

export const CERT_PROBE_SCHEMA: WorkTypeSchema = {
  workTypeId: CERT_PROBE_WORK_TYPE_ID,
  displayName: "Cert Probe",
  sections: CERT_PROBE_MAP_SECTIONS,
  defaultFocusSectionIds: ["intent"],
};

export function ensureCertProbeSchemaRegistered(): void {
  registerWorkTypeSchema(CERT_PROBE_SCHEMA);
}
