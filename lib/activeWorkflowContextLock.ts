/**
 * Active Workflow Context Lock — Active Workspace > Active Workflow > Teaching Mode.
 * When a guided workflow is in progress, concept questions are answered in-context;
 * Teaching Mode path menus must not appear and discovery must not restart.
 */

import type { BusinessStrategySession } from "./businessStrategyBuilder";
import type { CreateBuilderSession } from "./createBuilderChat";
import { createBuilderLabel } from "./createBuilderChat";
import {
  incompleteTemplateSections,
  isInSectionDiscoveryPhase,
} from "./createSectionDiscovery";
import { discoveryQuestionsForState } from "./createWorkflow";
import type { AppSection } from "./companionUi";
import type { StrategyApplySession } from "./strategyApplyCoach";
import {
  extractTeachingTopic,
  isConceptTeachingRequest,
} from "./teachingMode";
import type { WorkspaceSession } from "./workspaceSop";

export type ActiveWorkflowKind =
  | "strategy_apply"
  | "create_builder"
  | "business_strategy"
  | "day_designer"
  | "workspace_coach";

export type ActiveWorkflowContext = {
  kind: ActiveWorkflowKind;
  label: string;
  resumeQuestion: string | null;
};

export type ActiveWorkflowContextInput = {
  strategyApplyActive?: boolean;
  strategyApplySession?: StrategyApplySession | null;
  createBuilderActive?: boolean;
  createBuilderSession?: CreateBuilderSession | null;
  businessStrategyActive?: boolean;
  businessStrategySession?: BusinessStrategySession | null;
  dayDesignerActive?: boolean;
  workspaceCoachActive?: boolean;
  workspacePanel?: AppSection | null;
  workspaceSession?: WorkspaceSession | null;
  lastAssistantText?: string;
};

const GUIDED_WORKSPACE_PANELS = new Set<AppSection>([
  "client-avatars",
  "projects",
  "email-generator",
]);

/** Concept question mid-workflow — not an answer to the current discovery step. */
export function isWorkflowConceptQuestion(text: string): boolean {
  return isConceptTeachingRequest(text.trim());
}

export function extractPendingQuestionFromAssistant(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  const bold = t.match(/\*\*([^*?\n]+[?])\*\*/);
  if (bold?.[1]) return bold[1].trim();
  for (const line of t.split("\n").reverse()) {
    const cleaned = line.replace(/\*\*/g, "").trim();
    if (cleaned.endsWith("?") && cleaned.length >= 8 && cleaned.length <= 220) {
      return cleaned;
    }
  }
  return null;
}

export function isCreateBuilderWorkflowActive(
  session: CreateBuilderSession | null | undefined,
  workspacePanel: AppSection | null,
): boolean {
  return Boolean(
    session &&
      session.phase !== "done" &&
      workspacePanel === "content-generator",
  );
}

export function isWorkspaceGuidedCoachActive(
  workspacePanel: AppSection | null,
  workspaceSession: WorkspaceSession | null | undefined,
  coGuideBesideChat: boolean,
): boolean {
  if (!coGuideBesideChat || !workspacePanel) return false;
  if (GUIDED_WORKSPACE_PANELS.has(workspacePanel)) return true;
  return Boolean(workspaceSession?.workflowId && workspaceSession?.currentStepId);
}

function resumeQuestionForStrategyApply(
  session: StrategyApplySession | null | undefined,
  lastAssistantText: string,
): string | null {
  if (!session || session.phase === "done") return null;
  const pending = session.questions[session.questionIndex]?.prompt?.trim();
  if (pending) return pending;
  return extractPendingQuestionFromAssistant(lastAssistantText);
}

function resumeQuestionForCreateBuilder(
  session: CreateBuilderSession | null | undefined,
  lastAssistantText: string,
): string | null {
  if (!session || session.phase !== "discovery" || !session.typeLabel) {
    return extractPendingQuestionFromAssistant(lastAssistantText);
  }
  if (isInSectionDiscoveryPhase(session.workflow)) {
    const activeId = session.workflow.activeSectionId;
    const incomplete = incompleteTemplateSections(session.workflow);
    if (activeId) {
      const active = incomplete.find((s) => s.id === activeId);
      if (active) {
        return `What would you like to include in ${active.label}?`;
      }
    }
    if (incomplete.length) {
      return `Which section would you like to work on next? (${incomplete.map((s) => s.label).join(", ")})`;
    }
  }
  const q = discoveryQuestionsForState(session.typeLabel, session.workflow);
  return q?.prompt?.trim() ?? extractPendingQuestionFromAssistant(lastAssistantText);
}

function resumeQuestionForBusinessStrategy(
  session: BusinessStrategySession | null | undefined,
  lastAssistantText: string,
): string | null {
  return extractPendingQuestionFromAssistant(lastAssistantText);
}

function resumeQuestionForWorkspaceCoach(
  workspaceSession: WorkspaceSession | null | undefined,
  lastAssistantText: string,
): string | null {
  const hint = workspaceSession?.currentStepHint?.trim();
  if (hint) return hint;
  return extractPendingQuestionFromAssistant(lastAssistantText);
}

export function resolveActiveWorkflowContext(
  input: ActiveWorkflowContextInput,
): ActiveWorkflowContext | null {
  const lastAssistant = input.lastAssistantText?.trim() ?? "";

  if (input.strategyApplyActive && input.strategyApplySession) {
    return {
      kind: "strategy_apply",
      label: input.strategyApplySession.title || "this strategy",
      resumeQuestion: resumeQuestionForStrategyApply(
        input.strategyApplySession,
        lastAssistant,
      ),
    };
  }

  if (input.createBuilderActive && input.createBuilderSession) {
    const type = input.createBuilderSession.typeLabel ?? "content";
    return {
      kind: "create_builder",
      label: createBuilderLabel(type),
      resumeQuestion: resumeQuestionForCreateBuilder(
        input.createBuilderSession,
        lastAssistant,
      ),
    };
  }

  if (input.businessStrategyActive && input.businessStrategySession) {
    return {
      kind: "business_strategy",
      label: input.businessStrategySession.typeLabel || "Business Strategy",
      resumeQuestion: resumeQuestionForBusinessStrategy(
        input.businessStrategySession,
        lastAssistant,
      ),
    };
  }

  if (input.dayDesignerActive) {
    return {
      kind: "day_designer",
      label: "Adapt My Day",
      resumeQuestion: extractPendingQuestionFromAssistant(lastAssistant),
    };
  }

  if (input.workspaceCoachActive) {
    const panelLabel =
      input.workspacePanel === "client-avatars"
        ? "Client Avatar"
        : input.workspacePanel === "projects"
          ? "Project"
          : input.workspacePanel === "email-generator"
            ? "Email"
            : "this workspace";
    return {
      kind: "workspace_coach",
      label: panelLabel,
      resumeQuestion: resumeQuestionForWorkspaceCoach(
        input.workspaceSession,
        lastAssistant,
      ),
    };
  }

  return null;
}

export function isActiveWorkflowLocked(
  input: ActiveWorkflowContextInput,
): boolean {
  return resolveActiveWorkflowContext(input) !== null;
}

export function shouldSuppressTeachingMode(
  input: ActiveWorkflowContextInput,
): boolean {
  return isActiveWorkflowLocked(input);
}

export function activeWorkflowConceptHintForChat(opts: {
  userText: string;
  workflow: ActiveWorkflowContext;
  topic?: string | null;
}): string {
  const topic =
    opts.topic?.trim() ||
    extractTeachingTopic(opts.userText) ||
    "this concept";
  const resume = opts.workflow.resumeQuestion?.trim();

  return [
    "ACTIVE WORKFLOW CONTEXT LOCK (mandatory — overrides Teaching Mode):",
    `Priority: Active Workspace > Active Workflow > Teaching Mode.`,
    `User is already building **${opts.workflow.label}** — they are NOT starting from zero.`,
    `They asked about **${topic}** while a workflow question was pending.`,
    "Do NOT enter Teaching Mode.",
    "Do NOT offer: Quick Answer / Example / Apply to My Business / Deep Dive.",
    "Do NOT restart discovery, offer learning paths, or open unrelated workspaces.",
    "Instead:",
    "1) Brief plain-language answer (2–4 sentences max).",
    `2) Tie the answer to **${opts.workflow.label}** and what you are building together now.`,
    resume
      ? `3) Resume with this exact workflow question — do not skip ahead: **${resume}**`
      : "3) Resume the current workflow question — do not advance the step.",
  ].join("\n");
}
