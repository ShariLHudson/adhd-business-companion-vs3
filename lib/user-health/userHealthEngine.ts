/**
 * User Health Intelligence — identify who may need support.
 */

import { gatherUserHealthInput } from "./userHealthSignals";
import { scoreUserHealth } from "./userHealthScoring";
import {
  notifyUserHealthUpdated,
  recordUserHealthSnapshot,
} from "./userHealthStore";
import { userHealthHintForChat } from "./userHealthMessages";
import type { UserHealthInput, UserHealthSnapshot } from "./types";

export function evaluateUserHealth(
  input: UserHealthInput = {},
): UserHealthSnapshot {
  const gathered = gatherUserHealthInput(input);
  return scoreUserHealth(gathered, gathered.now ?? new Date());
}

export function evaluateAndRecordUserHealth(
  input: UserHealthInput = {},
): UserHealthSnapshot {
  const snapshot = evaluateUserHealth(input);
  recordUserHealthSnapshot(snapshot);
  notifyUserHealthUpdated();
  return snapshot;
}

export { userHealthHintForChat, userHealthWelcomeLine } from "./userHealthMessages";
