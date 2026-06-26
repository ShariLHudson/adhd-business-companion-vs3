import type { SceneState } from "@/lib/sceneRenderContract";
import { resolveConversationIntelligence } from "./conversationIntelligence/resolveConversation";
import type { ConversationIntelligenceInput } from "./conversationIntelligence/types";
import {
  resolveCompanionIntelligence,
  type CompanionIntelligenceInput,
} from "./companionIntelligence/resolveCompanionIntelligence";
import { createCompanionState, type CompanionState } from "./companionState";
import { resolveEnvironment } from "./environmentIntelligence/resolveEnvironment";
import type {
  EnvironmentInput,
  EnvironmentState,
} from "./environmentIntelligence/types";
import { resolvePresence } from "./presenceIntelligence/resolvePresence";
import type {
  PresenceInput,
  PresenceState,
} from "./presenceIntelligence/types";
import type { ConversationIntelligenceVerdict } from "./conversationIntelligence/types";
import type { CompanionOrchestration } from "./companionIntelligence/resolveCompanionIntelligence";

export type CompanionRenderContext = {
  conversation: ConversationIntelligenceVerdict;
  orchestration: CompanionOrchestration;
  companion: CompanionState;
  environment: EnvironmentState;
  presence: PresenceState;
};

export type CompanionRenderContextInput = {
  scene?: SceneState;
  conversation?: ConversationIntelligenceInput;
  orchestration?: Omit<CompanionIntelligenceInput, "conversation">;
  companion?: CompanionState;
  environment?: EnvironmentInput;
  presence?: PresenceInput;
};

/**
 * Full constitutional pipeline — top to render layers.
 * Conversation → Companion Intelligence → Environment → Presence → (Scene Render below)
 */
export function resolveCompanionRenderContext(
  input: CompanionRenderContextInput = {},
): CompanionRenderContext {
  const scene = input.scene;

  const conversation = resolveConversationIntelligence({
    activeSection: input.conversation?.activeSection,
    workspacePanel: input.conversation?.workspacePanel,
    workspaceBesideChat: input.conversation?.workspaceBesideChat,
    messageCount: input.conversation?.messageCount,
    userText: input.conversation?.userText,
    arrivalActive: input.conversation?.arrivalActive,
  });

  const orchestration = resolveCompanionIntelligence({
    conversation,
    workspaceId: scene?.workspaceId,
    activeSection: input.conversation?.activeSection,
    ...input.orchestration,
  });

  const companion =
    input.companion ?? scene?.companion ?? orchestration.companionState;

  const environment =
    scene?.environment ??
    resolveEnvironment({
      workspaceId: scene?.workspaceId,
      focusCategoryId: scene?.focusCategoryId,
      seed: scene?.seed,
      scenePage: scene?.scenePage,
      now: scene?.now,
      section: input.conversation?.activeSection ?? undefined,
      companion,
      ...input.environment,
    });

  const presence =
    scene?.presence ??
    resolvePresence({
      workspaceId: scene?.workspaceId ?? environment.workspaceId,
      section: environment.section,
      placeId: environment.placeId,
      writingActive: companion.writingActive,
      voiceConversation: companion.voiceConversation,
      overwhelmed: companion.overwhelmed,
      ...input.presence,
    });

  return { conversation, orchestration, companion, environment, presence };
}
