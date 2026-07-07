/**
 * Canonical companion pipeline:
 * Active session → Primary goal → Estate Intelligence (when needed) → Respond.
 */

import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import type { HelpDiscoveryContext } from "@/lib/estateHelpDiscoveryIntelligence";
import {
  arbitrateConversationRouting,
  type ArbitrationResult,
} from "./arbitration";
import type { CapabilityEvaluation, EstateCapability } from "./capabilityTypes";
import { evaluateEstateIntelligenceCandidates } from "./estateIntelligenceCheck";
import { selectWinningCapability } from "./selectWinningCapability";
import {
  tryStabilizationFastPath,
  type StabilizationFastPathResult,
} from "./fastPath";
import { logConversationRoutingTrace } from "./routingTrace";

export type RoutingPipelineInput = {
  userText: string;
  lastAssistantText?: string | null;
  currentTurn?: number;
  activeWorkflow?: string | null;
  workspace?: string | null;
  helpDiscoveryContext?: HelpDiscoveryContext;
};

export type RoutingPipelineResult = {
  arbitration: ArbitrationResult;
  candidates: CapabilityEvaluation[];
  winningCapability: EstateCapability | null;
  fastPath: StabilizationFastPathResult | null;
  semanticIntent: ArbitrationResult["semanticIntent"];
};

export function runConversationRoutingPipeline(
  input: RoutingPipelineInput,
  routing: IntentRoutingDecision,
): RoutingPipelineResult {
  const userText = input.userText.trim();

  const arbitration = arbitrateConversationRouting({
    userText,
    lastAssistantText: input.lastAssistantText,
    activeWorkflow: input.activeWorkflow,
    workspace: input.workspace,
  });

  const candidates = arbitration.estateIntelligenceNeeded
    ? evaluateEstateIntelligenceCandidates({
        userText,
        lastAssistantText: input.lastAssistantText,
        activeWorkflow: input.activeWorkflow,
        workspace: input.workspace,
        arbitration,
        helpDiscoveryContext: input.helpDiscoveryContext,
      })
    : [];

  const winningCapability = selectWinningCapability(
    arbitration,
    candidates,
    userText,
  );

  const fastPath = tryStabilizationFastPath(
    {
      userText,
      lastAssistantText: input.lastAssistantText,
      currentTurn: input.currentTurn,
      activeWorkflow: input.activeWorkflow,
      workspace: input.workspace,
      arbitration,
    },
    routing,
  );

  logConversationRoutingTrace({
    userMessage: userText,
    detectedGoal: arbitration.goal,
    activeSession: arbitration.activeSession,
    winningCapability,
    winningSubsystem: fastPath?.winningSubsystem ?? winningCapability,
    candidates: candidates.map((c) => ({
      capability: c.capability,
      eligible: c.eligible,
      confidence: c.confidence,
      reason: c.reason,
    })),
    blockedSubsystems: arbitration.blockedSubsystems,
    reason: arbitration.reason,
    fastPath: fastPath != null,
  });

  return {
    arbitration,
    candidates,
    winningCapability,
    fastPath,
    semanticIntent: arbitration.semanticIntent,
  };
}
