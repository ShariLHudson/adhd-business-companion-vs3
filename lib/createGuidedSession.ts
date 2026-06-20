import {
  catalogLabelToCreateType,
  getNextRequiredField,
  getRequiredFields,
  getTemplateProgress,
  guidedRequiredFieldsComplete,
  hasGuidedTemplateFields,
  type CreateType,
  type CreateTemplateField,
} from "./createTemplateFields";
import { isCreateExplorationRequest } from "./createExplorationMode";
import { shouldCaptureFieldAnswer, shouldRevisePendingValue } from "./createBuilderModes";
import type { CreateWorkflowState } from "./createWorkflow";

export type PendingApproval = {
  fieldId: string;
  fieldLabel: string;
  value: string;
};

export type GuidedCreateSession = {
  type: CreateType;
  title: string;
  values: Record<string, string>;
  pendingApproval: PendingApproval | null;
};

const APPROVAL_RE =
  /^(yes|yep|yeah|yes use that|use that|use this|sounds good|looks good|look good|correct|that's right|thats right|approved|ok|okay)$/i;

export function isApprovalText(text: string): boolean {
  return APPROVAL_RE.test(text.trim());
}

export function guidedSessionFromWorkflow(
  typeLabel: string,
  workflow: CreateWorkflowState,
): GuidedCreateSession | null {
  const type = catalogLabelToCreateType(typeLabel);
  if (!type || !hasGuidedTemplateFields(typeLabel)) return null;
  const pending = workflow.pendingFieldApproval;
  return {
    type,
    title: typeLabel,
    values: { ...workflow.discoveryAnswers },
    pendingApproval: pending
      ? {
          fieldId: pending.questionId ?? "",
          fieldLabel: pending.fieldLabel ?? "Field",
          value: pending.summary || pending.rawAnswer,
        }
      : null,
  };
}

export function startGuidedCreateSession(type: CreateType): GuidedCreateSession {
  return {
    type,
    title: type,
    values: {},
    pendingApproval: null,
  };
}

export function createPendingApproval(
  field: CreateTemplateField,
  userText: string,
): PendingApproval {
  return {
    fieldId: field.id,
    fieldLabel: field.label,
    value: userText.trim(),
  };
}

export function approvePendingValue(
  session: GuidedCreateSession,
): GuidedCreateSession {
  if (!session.pendingApproval) return session;
  return {
    ...session,
    values: {
      ...session.values,
      [session.pendingApproval.fieldId]: session.pendingApproval.value,
    },
    pendingApproval: null,
  };
}

export function getNextCreateQuestion(
  session: GuidedCreateSession,
): string | null {
  const next = getNextRequiredField(session.type, session.values);
  return next?.question ?? null;
}

export function canCreateDraft(session: GuidedCreateSession): boolean {
  return guidedRequiredFieldsComplete(session.type, session.values);
}

export function getCreateProgressText(session: GuidedCreateSession): string {
  const progress = getTemplateProgress(session.type, session.values);
  return `${progress.completed} of ${progress.total} required sections complete`;
}

export function guidedProgressForWorkflow(
  typeLabel: string,
  workflow: CreateWorkflowState,
): { completed: number; total: number; complete: boolean } | null {
  const type = catalogLabelToCreateType(typeLabel);
  if (!type || !hasGuidedTemplateFields(typeLabel)) return null;
  return getTemplateProgress(type, workflow.discoveryAnswers);
}

export type GuidedCreateTurnResult = {
  values: Record<string, string>;
  pendingApproval: PendingApproval | null;
  assistantMessage: string;
  actions: string[];
  readyForDraft: boolean;
  explorationMode?: boolean;
};

function formatCandidateApprovalPrompt(
  field: CreateTemplateField,
  value: string,
): string {
  const text = value.trim();
  if (field.id === "audience") {
    return `It sounds like your audience is **${text}**.\n\nWould you like me to use that?`;
  }
  if (field.id === "problem") {
    return (
      `It sounds like the problem is:\n\n**${text}**\n\n` +
      `Would you like me to use that?`
    );
  }
  return (
    `It sounds like ${field.label.toLowerCase()} is:\n\n**${text}**\n\n` +
    `Would you like me to use that?`
  );
}

export function handleGuidedCreateMessage(
  session: GuidedCreateSession,
  userText: string,
): GuidedCreateTurnResult {
  if (session.pendingApproval) {
    if (isApprovalText(userText)) {
      const approvedField = session.pendingApproval.fieldLabel;
      const approvedValue = session.pendingApproval.value;
      const nextSession = approvePendingValue(session);
      const nextQuestion = getNextCreateQuestion(nextSession);
      if (!nextQuestion) {
        return {
          values: nextSession.values,
          pendingApproval: null,
          assistantMessage:
            `Done — I added "${approvedValue}" to ${approvedField}.\n\n` +
            `We have the required pieces now. Ready to create the first draft?`,
          actions: ["Create Draft", "Review Template", "Keep Working"],
          readyForDraft: true,
        };
      }
      return {
        values: nextSession.values,
        pendingApproval: null,
        assistantMessage:
          `Done — I added "${approvedValue}" to ${approvedField}.\n\n` +
          `${getCreateProgressText(nextSession)}.\n\n` +
          `**${nextQuestion}**`,
        actions: [],
        readyForDraft: false,
      };
    }

    if (/^(revise it|revise|keep talking)$/i.test(userText.trim())) {
      return {
        values: session.values,
        pendingApproval: null,
        assistantMessage:
          userText.toLowerCase().includes("talk")
            ? "Sure — tell me more when you're ready."
            : "No problem — how would you like to put that?",
        actions: [],
        readyForDraft: false,
      };
    }

    if (isCreateExplorationRequest(userText)) {
      return {
        values: session.values,
        pendingApproval: session.pendingApproval,
        assistantMessage: "",
        actions: [],
        readyForDraft: false,
        explorationMode: true,
      };
    }

    if (!shouldRevisePendingValue(userText)) {
      return {
        values: session.values,
        pendingApproval: session.pendingApproval,
        assistantMessage: "",
        actions: [],
        readyForDraft: false,
        explorationMode: true,
      };
    }

    return {
      values: session.values,
      pendingApproval: {
        ...session.pendingApproval,
        value: userText.trim(),
      },
      assistantMessage:
        `Got it. I revised that to:\n\n"${userText.trim()}"\n\n` +
        `Would you like me to use that?`,
      actions: ["Use This", "Revise It", "Keep Talking"],
      readyForDraft: false,
    };
  }

  const activeField = getNextRequiredField(session.type, session.values);
  if (!activeField) {
    return {
      values: session.values,
      pendingApproval: null,
      assistantMessage:
        "We have the required pieces now. Ready to create the first draft?",
      actions: ["Create Draft", "Review Template", "Keep Working"],
      readyForDraft: true,
    };
  }

  if (isCreateExplorationRequest(userText)) {
    return {
      values: session.values,
      pendingApproval: null,
      assistantMessage: "",
      actions: [],
      readyForDraft: false,
      explorationMode: true,
    };
  }

  if (!shouldCaptureFieldAnswer(userText, false)) {
    return {
      values: session.values,
      pendingApproval: null,
      assistantMessage: "",
      actions: [],
      readyForDraft: false,
      explorationMode: true,
    };
  }

  const pendingApproval = createPendingApproval(activeField, userText);

  return {
    values: session.values,
    pendingApproval,
    assistantMessage: formatCandidateApprovalPrompt(
      activeField,
      pendingApproval.value,
    ),
    actions: ["Use This", "Revise It", "Keep Talking"],
    readyForDraft: false,
  };
}
