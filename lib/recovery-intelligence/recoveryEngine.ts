/**
 * Recovery Intelligence — protect energy before burnout.
 */

import { collectRecoverySignals } from "./recoverySignals";
import {
  recoveryOverridesProductivity,
  scoreRecovery,
} from "./recoveryScoring";
import {
  notifyRecoveryUpdated,
  recordRecoverySnapshot,
} from "./recoveryStore";
import {
  recoveryHintForChat,
  recoveryWelcomeLine,
} from "./recoveryMessages";
import type { RecoveryInput, RecoverySnapshot } from "./types";

export function evaluateRecovery(input: RecoveryInput = {}): RecoverySnapshot {
  const signals = collectRecoverySignals(input);
  return scoreRecovery(input, signals, input.now ?? new Date());
}

export function evaluateAndRecordRecovery(
  input: RecoveryInput = {},
): RecoverySnapshot {
  const snapshot = evaluateRecovery(input);
  recordRecoverySnapshot(snapshot);
  notifyRecoveryUpdated();
  return snapshot;
}

export {
  recoveryHintForChat,
  recoveryWelcomeLine,
  recoveryOverridesProductivity,
};

export type { RecoveryInput, RecoverySnapshot };
