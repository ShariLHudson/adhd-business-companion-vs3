/**
 * 051 — Readiness coordinator (wraps 049 readiness).
 */

import { computeCreationReadiness } from "@/lib/creationEcosystem";
import type { CreationReadinessSummary } from "./types";

export function coordinateCreationReadiness(input: {
  creationId: string;
}): CreationReadinessSummary {
  const snap = computeCreationReadiness({ creationId: input.creationId });
  return {
    overallPercent: snap.overallPercent,
    byArea: snap.byArea,
  };
}
