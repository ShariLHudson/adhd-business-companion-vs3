// SOP coach — turns user messages into guided step actions (not freeform parsing).

import type { DayLevel } from "./companionStore";
import {
  acceptSopSuggestion,
  advanceSopSession,
  extractNumberedOptions,
  extractSuggestedValue,
  getCurrentSopStep,
  getScopedSteps,
  getStepValue,
  getWorkflow,
  goToSopStep,
  hasStepValue,
  parseOptionSelection,
  retreatSopSession,
  selectSopOption,
  setSopStepValue,
  setSopOptions,
  setSopSuggestion,
  syncSessionFromPanel,
  updateSessionEnergy,
  type SopStepId,
  type WorkspaceSession,
} from "./workspaceSop";
import {
  applyResumeIntent,
  buildResumeReviewMessage,
  detectWorkspaceResumeIntent,
} from "./workspaceResume";
import { buildHelpTurn } from "./workspaceSopHelp";
import {
  buildClarificationTurn,
  buildConversationTurn,
  buildFeedbackTurn,
  buildProgressTurn,
  buildQuestionTurn,
  buildWorkflowCompletionMessage,
} from "./workspaceSopConversation";
import { isGoBackToStepRequest, isProgressQuestion } from "./workspaceIntent";
import type {
  WorkspaceCoachTurn,
  WorkspaceContext,
  WorkspaceFieldId,
} from "./workspaceAwareness";
import {
  classifyWorkspaceIntent,
  isFieldContentIntent,
  isKnowledgeQuestion,
} from "./workspaceIntent";
import {
  getEffectiveSuggestions,
  tryResolveSuggestionSelection,
} from "./workspaceSuggestion";

const LOW_ENERGY_RE =
  /\b(?:still\s+)?(?:don'?t|do not) have (?:much )?energy|(?:still\s+)?low energy|no energy|not much energy|exhausted|overwhelmed|don'?t have the bandwidth|can'?t think\b/i;

const GO_BACK_STEP_MAP: Record<string, SopStepId> = {
  title: "workshop-title",
  outcome: "workshop-outcome",
  audience: "workshop-audience",
  sections: "workshop-sections",
  problem: "workshop-problem",
  story: "workshop-story",
  exercise: "workshop-exercise",
  offer: "workshop-offer",
};

function focusPrefix(fieldId: WorkspaceFieldId): string {
  return `[[focus:${fieldId}]]`;
}

function buildAdvanceTurn(
  session: WorkspaceSession,
  ctx: WorkspaceContext,
  energy: DayLevel,
  isSkip: boolean,
): WorkspaceCoachTurn {
  const current = getCurrentSopStep(session);
  const scoped = getScopedSteps(session.workflowId, session.energyScope);
  const hasValue = hasStepValue(session, current.id);

  if (!hasValue && !isSkip) {
    return {
      reply: `${focusPrefix(current.fieldId)}Let's fill in **${current.label}** first. ${current.coachQuestion}`,
      focusField: current.fieldId,
      sessionPatch: session,
    };
  }

  const ack = current.completeAck;
  const wasLast = scoped[scoped.length - 1]?.id === current.id;
  const advanced = advanceSopSession(session, { skip: isSkip });

  if (wasLast) {
    return {
      reply: buildWorkflowCompletionMessage(advanced, ctx, energy),
      focusField: current.fieldId,
      workflow: { type: isSkip ? "skip" : "advance" },
      sessionPatch: advanced,
    };
  }

  const next = getCurrentSopStep(advanced);
  return {
    reply: `${focusPrefix(next.fieldId)}${ack}`,
    focusField: next.fieldId,
    workflow: { type: isSkip ? "skip" : "advance" },
    sessionPatch: advanced,
  };
}

function buildOptionSelectTurn(
  session: WorkspaceSession,
  index: number,
  options = session.suggestedOptions,
): WorkspaceCoachTurn {
  const current = getCurrentSopStep(session);
  const value = options[index]?.trim();
  if (!value) {
    return {
      reply: `${focusPrefix(current.fieldId)}I didn't catch which option — try **number 1**, **number 2**, or type your own in the field beside us.`,
      focusField: current.fieldId,
      sessionPatch: session,
    };
  }
  const updated = selectSopOption(session, index, options);
  return {
    reply: `${focusPrefix(current.fieldId)}Got it — **${value}** is in the ${current.label.toLowerCase()} field. Say **next** when you're ready, or edit it directly.`,
    focusField: current.fieldId,
    fill: { field: current.fieldId, value, stepId: current.id },
    sessionPatch: updated,
  };
}

function buildConfirmTurn(
  session: WorkspaceSession,
  userText = "",
): WorkspaceCoachTurn {
  const selection = tryResolveSuggestionSelection(userText, session, "");
  if (selection) {
    return buildOptionSelectTurn(session, selection.index, selection.options);
  }

  if (session.suggestedOptions.length) {
    const idx = parseOptionSelection(
      userText.trim(),
      session.suggestedOptions.length,
    );
    if (idx !== null) {
      return buildOptionSelectTurn(session, idx);
    }
  }

  if (session.pendingConfirmation && session.suggestedValue?.trim()) {
    const fillingStep = getCurrentSopStep(session);
    const value = session.suggestedValue.trim();
    const withValue = setSopStepValue(session, session.currentStepId, value);
    const accepted = advanceSopSession(withValue);
    const next = getCurrentSopStep(accepted);
    return {
      reply: `${focusPrefix(next.fieldId)}Perfect — we'll keep **${value}** as the ${fillingStep.label.toLowerCase()}. ${next.coachQuestion}`,
      focusField: next.fieldId,
      workflow: { type: "confirm" },
      sessionPatch: accepted,
      fill: {
        field: fillingStep.fieldId,
        value,
        stepId: fillingStep.id,
      },
    };
  }

  const current = getCurrentSopStep(session);
  const value = getStepValue(session, current.id);
  if (!value) {
    return {
      reply: `${focusPrefix(current.fieldId)}Sounds good — ${current.coachQuestion}`,
      focusField: current.fieldId,
      sessionPatch: session,
    };
  }

  const advanced = advanceSopSession(session);
  const next = getCurrentSopStep(advanced);
  return {
    reply: `${focusPrefix(next.fieldId)}Perfect — **${value}** stays as the ${current.label.toLowerCase()}. ${next.coachQuestion}`,
    focusField: next.fieldId,
    workflow: { type: "confirm" },
    sessionPatch: advanced,
  };
}

function buildContentTurn(
  session: WorkspaceSession,
  userText: string,
  energy: DayLevel,
  lastAssistantText = "",
): WorkspaceCoachTurn {
  if (tryResolveSuggestionSelection(userText, session, lastAssistantText)) {
    const selection = tryResolveSuggestionSelection(
      userText,
      session,
      lastAssistantText,
    )!;
    return buildOptionSelectTurn(session, selection.index, selection.options);
  }

  const current = getCurrentSopStep(session);
  const value = userText.trim();
  const updated = setSopStepValue(session, current.id, value);

  const short = value.length > 80 ? `${value.slice(0, 77)}…` : value;
  const energyNote =
    energy === "low"
      ? " That's enough for today if your energy is low — say **next** when you're ready."
      : " Say **next** when you want to move on, or edit the field beside you.";

  return {
    reply: `${focusPrefix(current.fieldId)}I added that as the **${current.label.toLowerCase()}**: ${short}.${energyNote}`,
    focusField: current.fieldId,
    fill: { field: current.fieldId, value, stepId: current.id },
    sessionPatch: updated,
  };
}

function applySuggestionFromAssistant(
  session: WorkspaceSession,
  lastAssistantText: string,
): WorkspaceSession {
  const options = extractNumberedOptions(lastAssistantText);
  if (options.length >= 2) {
    return setSopOptions(session, options, session.currentStepHint ?? undefined);
  }
  const suggested = extractSuggestedValue(lastAssistantText);
  if (suggested) return setSopSuggestion(session, suggested);
  return session;
}

export function resolveSopCoachTurn(
  session: WorkspaceSession,
  ctx: WorkspaceContext,
  userText: string,
  energy: DayLevel,
  lastAssistantText = "",
): WorkspaceCoachTurn | null {
  if (ctx.section === "content-generator") {
    return null;
  }

  let active = syncSessionFromPanel(
    updateSessionEnergy(
      applySuggestionFromAssistant(session, lastAssistantText),
      energy,
    ),
    ctx,
  );

  if (LOW_ENERGY_RE.test(userText.trim())) {
    active = updateSessionEnergy(active, "low");
    const current = getCurrentSopStep(active);
    return {
      reply: `${focusPrefix(current.fieldId)}That's okay — we're not building the whole thing today. Let's only do **${current.label.toLowerCase()}**. ${current.coachQuestion}`,
      focusField: current.fieldId,
      sessionPatch: active,
    };
  }

  const t = userText.trim();

  // 1. Pending suggestion selection — highest priority
  const selection = tryResolveSuggestionSelection(
    t,
    active,
    lastAssistantText,
  );
  if (selection) {
    const options = getEffectiveSuggestions(active, lastAssistantText);
    const withOptions =
      active.suggestedOptions.length === options.length
        ? active
        : setSopOptions(active, options, active.currentStepHint ?? undefined);
    return buildOptionSelectTurn(
      withOptions,
      selection.index,
      selection.options,
    );
  }

  const { intent } = classifyWorkspaceIntent(userText, lastAssistantText, {
    session: active,
  });

  if (intent === "navigation") {
    if (isGoBackToStepRequest(t)) {
      const m = t.match(/\bgo back to (?:the )?(\w+)\b/i);
      const stepId = m?.[1] ? GO_BACK_STEP_MAP[m[1].toLowerCase()] : undefined;
      if (stepId) {
        const jumped = goToSopStep(active, stepId);
        const step = getCurrentSopStep(jumped);
        const val = getStepValue(jumped, stepId);
        return {
          reply: `${focusPrefix(step.fieldId)}Sure — back to **${step.label}**${val ? ` (**${val}**)` : ""}. ${step.coachQuestion}`,
          focusField: step.fieldId,
          sessionPatch: jumped,
        };
      }
    }
    if (/^back\.?$/i.test(t)) {
      const retreated = retreatSopSession(active);
      const step = getCurrentSopStep(retreated);
      return {
        reply: `${focusPrefix(step.fieldId)}No problem — back to **${step.label}**. ${step.coachQuestion}`,
        focusField: step.fieldId,
        sessionPatch: retreated,
      };
    }
    const isSkip = /^skip\.?$/i.test(t);
    return buildAdvanceTurn(active, ctx, energy, isSkip);
  }

  if (intent === "reviewRequest") {
    const reviewIntent = detectWorkspaceResumeIntent(userText);
    if (reviewIntent) {
      const applied = applyResumeIntent(active, reviewIntent);
      const step = getCurrentSopStep(applied);
      return {
        reply: buildResumeReviewMessage(applied, reviewIntent),
        focusField: step.fieldId,
        sessionPatch: applied,
      };
    }
  }

  if (intent === "helpRequest") {
    return buildHelpTurn(active, userText);
  }

  if (intent === "confirmation") {
    return buildConfirmTurn(active, userText);
  }

  if (intent === "projectLookup") {
    return buildQuestionTurn(active, ctx, userText);
  }

  if (intent === "feedback") {
    return buildFeedbackTurn(active, userText);
  }

  if (intent === "clarification") {
    return buildClarificationTurn(active, ctx);
  }

  if (intent === "conversation") {
    if (isKnowledgeQuestion(userText)) return null;
    if (isProgressQuestion(userText)) return buildProgressTurn(active);
    return buildConversationTurn(active, userText);
  }

  if (
    intent === "fieldContent" &&
    isFieldContentIntent(userText, lastAssistantText, { session: active })
  ) {
    return buildContentTurn(active, userText, energy, lastAssistantText);
  }

  return null;
}

export function buildSopAcceptMessage(session: WorkspaceSession): string {
  const step = getCurrentSopStep(session);
  const wf = getWorkflow(session.workflowId);
  const scopeNote =
    session.energyScope === "low"
      ? " With low energy, we'll only do a couple of fields today."
      : "";
  return `${focusPrefix(step.fieldId)}I can see **${wf.title}** open beside us.${scopeNote} ${step.coachQuestion}`;
}
