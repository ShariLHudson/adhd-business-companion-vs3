/**
 * Accept a contribution from another destination without minting a second
 * Strategy Work Item. Strategy remains decision owner.
 */

import type { StrategyContributionReturn } from "./connectionContracts";
import {
  addStrategyConnection,
  getStrategyWorkItem,
  updateStrategyWorkItem,
} from "./strategyWorkItemStore";
import { recordOutcomeFromContribution } from "./memory/recordOutcome";
import type { StrategyWorkItem } from "./types";

export function applyStrategyContributionReturn(
  contribution: StrategyContributionReturn,
): StrategyWorkItem | null {
  const item = getStrategyWorkItem(contribution.strategyWorkItemId);
  if (!item) return null;

  const note = contribution.conciseContribution.trim();
  if (!note) return item;

  const observations = [...(item.observations ?? [])];
  const stamped = `[${contribution.from}] ${note}`;
  if (!observations.includes(stamped)) {
    observations.push(stamped);
  }

  const updated = updateStrategyWorkItem(item.id, {
    observations,
    plainLanguageSummary:
      item.plainLanguageSummary || note.slice(0, 220),
  });

  addStrategyConnection({
    strategyWorkItemId: item.id,
    connectedEntityType: contribution.from,
    connectedEntityId:
      contribution.sourceId ||
      contribution.linkedConversationId ||
      `contrib_${Date.now().toString(36)}`,
    connectionType: "supports",
    relationshipSummary: "Returned contribution — does not overwrite the decision",
    syncDirection: "from_destination",
    memberApproved: true,
  });

  // Phase 6 — link aftermath without overwriting the decision
  recordOutcomeFromContribution(contribution);

  return updated;
}
