/**
 * Conversation → Artifact → Create orchestration helpers.
 */

export {
  assembleConversationArtifact,
  buildAssemblyClarificationMessage,
  buildAssemblyConfirmationMessage,
  buildHandoffReceipt,
  conversationArtifactToResolved,
  evaluateConversationHandoff,
  hasUsableConversationContext,
  isConversationAssemblyIntent,
  isExplicitBlankCreateOpen,
  tryAssembleFromConversation,
  userAcceptedAssemblyConfirmation,
  type AssemblyInput,
  type ConversationArtifact,
  type HandoffEvaluation,
} from "./conversationArtifactAssembler";

export {
  buildRecoveryOfferLine,
  buildRecoveryRestoredMessage,
  clearStashedConversation,
  hasStashedConversation,
  isReturnToConversationRequest,
  loadStashedConversation,
  stashConversationBeforeHandoff,
} from "./conversationHandoffRecovery";

import type { ConversationArtifact } from "./conversationArtifactAssembler";
import { buildHandoffReceipt } from "./conversationArtifactAssembler";

export function handoffReceiptForArtifact(
  artifact: ConversationArtifact,
): string {
  return buildHandoffReceipt(artifact);
}
