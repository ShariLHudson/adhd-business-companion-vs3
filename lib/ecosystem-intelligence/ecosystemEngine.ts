/**
 * Ecosystem Intelligence Hub — central orchestration.
 */

import {
  gatherEcosystemSignals,
  type EcosystemSignalContext,
} from "./ecosystemSignals";
import {
  buildEcosystemSnapshot,
  isSuppressed,
  priorityLabel,
} from "./ecosystemPriority";
import { ecosystemGuidanceForChat } from "./ecosystemMessages";
import {
  notifyEcosystemUpdated,
  recordEcosystemSnapshot,
} from "./ecosystemStore";
import { observeEcosystemSuppressions } from "@/lib/intelligence-layer/governorTrustSignals";
import type { EcosystemInput, EcosystemSnapshot, EcosystemSuppression } from "./types";

export function evaluateEcosystem(
  input: EcosystemInput = {},
): EcosystemSnapshot {
  const context = gatherEcosystemSignals(input);
  return buildEcosystemSnapshot(context);
}

export function evaluateAndRecordEcosystem(
  input: EcosystemInput = {},
): EcosystemSnapshot {
  const snapshot = evaluateEcosystem(input);
  recordEcosystemSnapshot(snapshot);
  try {
    observeEcosystemSuppressions(snapshot);
  } catch {
    /* observational only */
  }
  notifyEcosystemUpdated();
  return snapshot;
}

export { isSuppressed, ecosystemGuidanceForChat, priorityLabel };
export type { EcosystemInput, EcosystemSnapshot, EcosystemSuppression };
