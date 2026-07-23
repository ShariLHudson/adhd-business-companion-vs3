/**
 * Authoritative Conversation Router — public API.
 *
 * Production path: every conversational entry → routeConversationTurn →
 * Continuity gate + chatScope identity + navigation resolver.
 *
 * @see docs/conversation/AUTHORITATIVE_CONVERSATION_ROUTING_STANDARD.md
 */

export type {
  AuthoritativeRoutingPriorityStep,
  ConversationRouteResult,
  ConversationScopeOwner,
  ResponsePolicy,
  RouteConversationTurnInput,
  RoutingAction,
  RoutingConfidence,
  RoutingDecision,
  RoutingEffect,
  RoutingIntentFamily,
  RoutingScopeType,
  RoutingTargetType,
  RoutingTrace,
} from "./routingTypes";

export {
  AUTHORITATIVE_ROUTING_PRIORITY,
  chatScopeKindToRoutingScope,
} from "./routingTypes";

export { routeConversationTurn } from "./routeConversationTurn";
export { classifyTurnIntent } from "./classifyTurnIntent";
export {
  isWelcomeHomeNavigation,
  resolveNavigationTarget,
} from "./resolveNavigationTarget";
export {
  conversationOwnerToScopeOwner,
  ownerMayClaimTurn,
  resolveActiveScopeOwner,
} from "./resolveScopeOwnership";
export {
  isNonClaimableByAwaitingOwner,
  outranks,
  priorityForIntentFamily,
  priorityRank,
} from "./resolveTurnPriority";
export { resolveClarification } from "./resolveClarification";
export { resolveWorkflowEffects } from "./resolveWorkflowAction";
export {
  clearRoutingTracesForTests,
  exportRoutingTraceForDiagnostics,
  getRecentRoutingTraces,
  recordRoutingTrace,
} from "./routingTrace";
export {
  beginRoutedChatRequest,
  createChatRequestIdentity,
  shouldAcceptAssistantResponse,
  validateResponseEnvelope,
} from "./validateResponseEnvelope";
export type { ChatRequestIdentity } from "@/lib/chatScope";
