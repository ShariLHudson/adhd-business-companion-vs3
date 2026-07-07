/**
 * High-priority fast paths — research, retrieve, create, capture, session continue.
 */

import type { IntentRoutingDecision } from "@/lib/intentRoutingIntelligence";
import {
  resolveImmediateCreateProjectAction,
  isProjectCreationIntent,
} from "@/lib/createExperience/createExperienceRouting";
import {
  resolveImmediateResearchOpen,
} from "@/lib/estateBrain/routeEstateIntelligence";
import { searchEstateBrain } from "@/lib/estateBrain/search";
import {
  formatUniversalCreationQuestion,
  formatUniversalCreationTurnReply,
  isUniversalCreationMessage,
  loadUniversalCreationSession,
  resolveUniversalCreationTurn,
  saveUniversalCreationSession,
  universalCreationHint,
} from "@/lib/universalCreation";
import { isSimpleCreateRequest } from "@/lib/universalCreation/createFastPath";
import type { ArbitrationResult } from "./arbitration";
import {
  isCaptureIntent,
  isProjectNamingContinuation,
  isRetrieveIntent,
  isTemplateIntent,
} from "./goalClassifier";

export type StabilizationFastPathInput = {
  userText: string;
  lastAssistantText?: string | null;
  currentTurn?: number;
  activeWorkflow?: string | null;
  workspace?: string | null;
  arbitration: ArbitrationResult;
};

export type StabilizationFastPathResult = {
  winningSubsystem: string;
  localReply: string;
  responseHint: string;
  category: "direct_action" | "universal_creation" | "none";
  immediateResearchOpen?: NonNullable<
    ReturnType<typeof resolveImmediateResearchOpen>
  >;
  immediateCreateProjectOpen?: NonNullable<
    ReturnType<typeof resolveImmediateCreateProjectAction>
  >;
  suppressRelationship: boolean;
  suppressRecap: boolean;
  suppressReflectionFirst: boolean;
};

function extractRetrieveTopic(text: string): string {
  const patterns = [
    /\babout\s+(.+?)(?:[.?!]|$)/i,
    /\b(?:snippet|excerpt|passage)\s+(?:about|on|for)\s+(.+?)(?:[.?!]|$)/i,
    /\bfind(?: me)?(?: a)?\s+(.+?)(?:[.?!]|$)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    const topic = m?.[1]?.trim();
    if (topic && topic.length >= 3) {
      return topic.replace(/\b(?:snippet|template|content|section)\b/gi, "").trim();
    }
  }
  return text.trim();
}

export function tryStabilizationFastPath(
  input: StabilizationFastPathInput,
  routing: IntentRoutingDecision,
): StabilizationFastPathResult | null {
  const userText = input.userText.trim();
  if (!userText) return null;

  const { arbitration } = input;
  const currentTurn = input.currentTurn ?? 0;

  if (
    arbitration.sessionLocked &&
    arbitration.activeSession === "brain_dump" &&
    !arbitration.explicitDirectionChange
  ) {
    const result: StabilizationFastPathResult = {
      winningSubsystem: "brain_dump_capture",
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "CLEAR MY MIND: Capture the thought quietly. Never launch Create or suggest rooms.",
      localReply: "Got it — I saved that with your other thoughts.",
    };
    return result;
  }

  if (isProjectNamingContinuation(input.lastAssistantText)) {
    const title = userText.replace(/^["']|["']$/g, "").trim();
    const result: StabilizationFastPathResult = {
      winningSubsystem: "project_continuation",
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "PROJECT CONTINUATION: Name captured — ask one goal question. Do not re-open Create or suggest rooms.",
      localReply: `Got it — "${title}" works.\n\nWhat's the main goal for this project?`,
    };
    return result;
  }

  const ucSession = loadUniversalCreationSession();
  if (
    ucSession ||
    (input.lastAssistantText && isUniversalCreationMessage(input.lastAssistantText))
  ) {
    const turn = resolveUniversalCreationTurn(
      userText,
      currentTurn,
      input.lastAssistantText ?? undefined,
    );
    if (turn) {
      saveUniversalCreationSession(turn.session);
      const localReply =
        turn.kind === "question"
          ? formatUniversalCreationQuestion(turn)
          : formatUniversalCreationTurnReply(turn);
      const result: StabilizationFastPathResult = {
        winningSubsystem: "universal_creation_session",
        category: "universal_creation",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: universalCreationHint(turn.session, turn),
        localReply,
      };
      return result;
    }
  }

  if (isProjectCreationIntent(userText)) {
    const project = resolveImmediateCreateProjectAction(userText);
    if (project) {
      const result: StabilizationFastPathResult = {
        winningSubsystem: "create_project",
        category: "direct_action",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "CREATE PROJECT: Open projects in Create — one naming question only.",
        localReply: project.followUpLine,
        immediateCreateProjectOpen: project,
      };
      return result;
    }
  }

  if (arbitration.goal === "research" || /\bresearch\b/i.test(userText)) {
    const research = resolveImmediateResearchOpen(userText);
    if (research) {
      const result: StabilizationFastPathResult = {
        winningSubsystem: "research",
        category: "direct_action",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint:
          "RESEARCH: Open research workspace — never suggest Estate rooms for research intent.",
        localReply: research.followUpLine,
        immediateResearchOpen: research,
      };
      return result;
    }
  }

  if (isRetrieveIntent(userText)) {
    const topic = extractRetrieveTopic(userText);
    const search = searchEstateBrain(topic);
    const top = search.best ?? search.matches[0];
    const hint = top
      ? `I found something on "${top.entry.name}" that might be close.`
      : `I'll search for anything we have on "${topic}".`;
    const result: StabilizationFastPathResult = {
      winningSubsystem: "retrieve",
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "RETRIEVE: Find member content/snippets — not Estate Guide or room suggestions.",
      localReply: `${hint}\n\nWhat would you use this for — so I pull the right piece?`,
    };
    return result;
  }

  if (isTemplateIntent(userText) || isSimpleCreateRequest(userText)) {
    const turn = resolveUniversalCreationTurn(
      userText,
      currentTurn,
      input.lastAssistantText ?? undefined,
    );
    if (turn) {
      saveUniversalCreationSession(turn.session);
      const localReply =
        turn.kind === "question"
          ? formatUniversalCreationQuestion(turn)
          : formatUniversalCreationTurnReply(turn);
      const result: StabilizationFastPathResult = {
        winningSubsystem: "template_create",
        category: "universal_creation",
        suppressRelationship: true,
        suppressRecap: true,
        suppressReflectionFirst: true,
        responseHint: universalCreationHint(turn.session, turn),
        localReply,
      };
      return result;
    }
  }

  if (
    isCaptureIntent(userText, {
      activeWorkflow: input.activeWorkflow,
      workspace: input.workspace,
    })
  ) {
    const result: StabilizationFastPathResult = {
      winningSubsystem: "brain_dump_capture",
      category: "direct_action",
      suppressRelationship: true,
      suppressRecap: true,
      suppressReflectionFirst: true,
      responseHint:
        "CLEAR MY MIND CAPTURE: Record the thought — do not open Create or suggest rooms.",
      localReply: "Got it — I saved that with your other thoughts.",
    };
    return result;
  }

  void routing;
  return null;
}
