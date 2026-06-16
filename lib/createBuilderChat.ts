/**
 * Create + Chat integration — when split beside Create, chat becomes a typed
 * builder (SOP Builder, Workshop Builder, etc.). One question per turn; generate
 * only after explicit user approval.
 */

import { matchCatalogFromText } from "./createCatalog";
import {
  advanceAfterDiscoveryAnswer,
  advanceAfterItemPick,
  advanceToDiscovery,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryComplete,
  discoveryQuestionsForState,
  getDiscoveryQuestions,
  mergeCreateWorkflow,
  requiredFieldsComplete,
  resolvedTypeLabel,
  type CreateWorkflowState,
  EMPTY_CREATE_WORKFLOW,
  answeredDiscoveryCount,
} from "./createWorkflow";
import { buildFullCreateBrief } from "./createTemplates";
import { logCreateBuild } from "./createBuild";
import { logSharedCreateSession } from "./createSharedSession";
import { DRAFT_QUICK_EDITS } from "./createWorkspaceUx";

export type CreateBuilderPhase =
  | "pick-type"
  | "discovery"
  | "readiness"
  | "generating"
  | "revise-offer"
  | "done";

export type CreateBuilderAction =
  | { id: "create-draft"; label: string }
  | { id: "add-more-info"; label: string }
  | { id: "revise"; label: string; instruction: string };

export type CreateBuilderSession = {
  typeLabel: string | null;
  workflow: CreateWorkflowState;
  phase: CreateBuilderPhase;
  /** Collecting optional extra context before readiness. */
  collectingExtra?: boolean;
};

export function emptyCreateBuilderSession(): CreateBuilderSession {
  return {
    typeLabel: null,
    workflow: { ...EMPTY_CREATE_WORKFLOW, questionMode: "split_screen" },
    phase: "pick-type",
  };
}

const BUILDER_NAMES: Record<string, string> = {
  SOP: "SOP Builder",
  Workshop: "Workshop Builder",
  Proposal: "Proposal Builder",
  Strategy: "Strategy Builder",
  "Business Strategy": "Strategy Builder",
  "Personal Companion Strategy": "Strategy Builder",
  "Marketing Strategy": "Marketing Strategy Builder",
  "Content Strategy": "Content Strategy Builder",
  Email: "Email Builder",
  Blog: "Blog Builder",
  Presentation: "Presentation Builder",
  Newsletter: "Newsletter Builder",
  Offer: "Offer Builder",
  "Sales Page": "Sales Page Builder",
  "Marketing Plan": "Marketing Plan Builder",
  "Business Plan": "Business Plan Builder",
};

export function createBuilderLabel(typeLabel: string): string {
  return BUILDER_NAMES[typeLabel] ?? `${typeLabel} Builder`;
}

export function resolveBuilderType(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  const match = matchCatalogFromText(t);
  if (match?.type && !match.route) return match.type;
  if (/\bstrateg(y|ies)\b/i.test(t)) return "Business Strategy";
  if (/\bsop\b|standard operating procedure/i.test(t)) return "SOP";
  if (/\bworkshop\b|webinar\b/i.test(t)) return "Workshop";
  if (/\bproposal\b|\bsow\b/i.test(t)) return "Proposal";
  if (/\bemail\b/i.test(t)) return "Email";
  if (/\bpresentation\b|\bslides\b/i.test(t)) return "Presentation";
  return null;
}

export function isAffirmative(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(yes|yep|yeah|sure|ok|okay|please|go ahead|do it|generate|create it|create draft|build draft|build it|ready|sounds good|let's go|lets go|y)\b/.test(
    t,
  ) || /^(generate it|draft it|create it|build it)$/i.test(t.trim());
}

export function isAddMoreInformation(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(no|nope|not yet|wait|hold|stop|add more|more info|more information)\b/.test(
    t,
  );
}

export const READINESS_ACTIONS: CreateBuilderAction[] = [
  { id: "create-draft", label: "Build Draft" },
  { id: "add-more-info", label: "Add More Information" },
];

const READINESS_PROMPT =
  "I'm ready to build this. Click **Build Draft** when you're ready.";

function freshDiscoveryWorkflow(typeLabel: string): CreateWorkflowState {
  const picked = advanceAfterItemPick(typeLabel);
  return {
    ...advanceToDiscovery(
      {
        ...picked,
        categoryId: picked.categoryId ?? categoryIdForType(typeLabel),
        selectedTypeLabel: typeLabel,
        step: "discovery",
      },
      { preserveAnswers: false },
    ),
    questionMode: "split_screen",
  };
}

export function panelWorkflowHasProgress(
  panelWorkflow: CreateWorkflowState | null | undefined,
): boolean {
  if (!panelWorkflow) return false;
  if (panelWorkflow.step === "readiness") return true;
  return answeredDiscoveryCount(panelWorkflow) > 0;
}

/** Resume chat builder from answers already collected in the Create panel. */
export function bootstrapCreateBuilderFromWorkflow(
  typeLabel: string,
  panelWorkflow: CreateWorkflowState,
): { session: CreateBuilderSession; opener: string } {
  const resolved = typeLabel.trim();
  const merged: CreateWorkflowState = {
    ...panelWorkflow,
    selectedTypeLabel: panelWorkflow.selectedTypeLabel ?? resolved,
    categoryId: panelWorkflow.categoryId ?? categoryIdForType(resolved),
    questionMode: "split_screen",
  };

  if (
    merged.step === "readiness" ||
    discoveryComplete(resolved, merged)
  ) {
    const session: CreateBuilderSession = {
      typeLabel: resolved,
      workflow: { ...merged, step: "readiness" },
      phase: "readiness",
    };
    return {
      session,
      opener:
        `I have your answers for **${resolved}**.\n\n` +
        `${READINESS_PROMPT}`,
    };
  }

  const answered = answeredDiscoveryCount(merged);
  if (answered > 0) {
    const workflow: CreateWorkflowState = { ...merged, step: "discovery" };
    const nextQ = discoveryQuestionsForState(resolved, workflow);
    const session: CreateBuilderSession = {
      typeLabel: resolved,
      workflow,
      phase: "discovery",
    };
    if (nextQ) {
      return {
        session,
        opener:
          `I have your answers so far for **${resolved}**.\n\n` +
          `**${nextQ.prompt}**`,
      };
    }
    return bootstrapCreateBuilderFromWorkflow(resolved, {
      ...workflow,
      step: "readiness",
    });
  }

  return bootstrapCreateBuilderSession(resolved);
}

export function reviseOfferActions(): CreateBuilderAction[] {
  return [
    ...DRAFT_QUICK_EDITS.map((e) => ({
      id: "revise" as const,
      label: e.label,
      instruction: e.instruction,
    })),
    {
      id: "revise",
      label: "Custom change",
      instruction: "__custom__",
    },
  ];
}

export function bootstrapCreateBuilderSession(
  typeLabel?: string | null,
): { session: CreateBuilderSession; opener: string } {
  const resolved = typeLabel?.trim() || null;
  if (!resolved || resolved === "content") {
    return {
      session: emptyCreateBuilderSession(),
      opener:
        "I'm here to help you build something real — one question at a time.\n\nTell me what you're creating (SOP, workshop, proposal, newsletter, video script, training guide…).",
    };
  }

  const session: CreateBuilderSession = {
    typeLabel: resolved,
    workflow: freshDiscoveryWorkflow(resolved),
    phase: "discovery",
  };
  const first = discoveryQuestionsForState(resolved, session.workflow);
  return {
    session,
    opener: formatBuilderOpener(resolved, first?.prompt),
  };
}

function formatBuilderOpener(typeLabel: string, firstQuestion?: string): string {
  const name = createBuilderLabel(typeLabel);
  const intro = `**${name}** — let's shape your **${typeLabel}** together. I'll ask one question at a time; you answer in chat.`;
  if (!firstQuestion) {
    return `${intro}\n\nTell me what you're working on.`;
  }
  return `${intro}\n\n**${firstQuestion}**`;
}

export type CreateBuilderTurnResult = {
  session: CreateBuilderSession;
  reply: string;
  actions?: CreateBuilderAction[];
  /** When set, parent should trigger draft generation in Create panel. */
  generateBrief?: string;
  generateType?: string;
  /** When set, parent should refine the workspace draft. */
  reviseInstruction?: string;
};

export function processCreateBuilderTurn(
  session: CreateBuilderSession,
  userText: string,
): CreateBuilderTurnResult {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      session,
      reply: "Take your time — even a rough answer helps.",
    };
  }

  if (session.phase === "done") {
    return { session, reply: "" };
  }

  if (session.phase === "pick-type") {
    const type = resolveBuilderType(trimmed);
    if (!type) {
      return {
        session,
        reply:
          "I can help with **SOP**, **Workshop**, **Proposal**, **Strategy**, **Email**, and more. Which one are you building?",
      };
    }
    const next: CreateBuilderSession = {
      typeLabel: type,
      workflow: freshDiscoveryWorkflow(type),
      phase: "discovery",
    };
    const first = discoveryQuestionsForState(type, next.workflow);
    return {
      session: next,
      reply: formatBuilderOpener(type, first?.prompt),
    };
  }

  const typeLabel = session.typeLabel;
  if (!typeLabel) {
    return {
      session: emptyCreateBuilderSession(),
      reply: "What are you creating — SOP, workshop, proposal, strategy, or something else?",
    };
  }

  if (session.phase === "revise-offer") {
    const quick = DRAFT_QUICK_EDITS.find(
      (e) => e.label.toLowerCase() === trimmed.toLowerCase(),
    );
    const instruction = quick?.instruction ?? trimmed;
    return {
      session,
      reply: `Updating your **${typeLabel}** draft — ${quick ? quick.label.toLowerCase() : "with your changes"}.`,
      reviseInstruction: instruction,
    };
  }

  if (session.phase === "readiness") {
    if (
      isAffirmative(trimmed) ||
      /^create draft$/i.test(trimmed) ||
      /^build draft$/i.test(trimmed) ||
      /^build it$/i.test(trimmed) ||
      /^create it$/i.test(trimmed) ||
      /^generate it$/i.test(trimmed) ||
      /^draft it$/i.test(trimmed)
    ) {
      const brief = buildFullCreateBrief(session.workflow);
      const generateType = resolvedTypeLabel(session.workflow) || typeLabel;
      logCreateBuild("Build requested", {
        itemType: generateType,
        source: "chat",
      });
      return {
        session: { ...session, phase: "generating", collectingExtra: false },
        reply: "",
        generateBrief: brief,
        generateType,
      };
    }
    if (isAddMoreInformation(trimmed)) {
      return enterExtraDiscovery(session, typeLabel);
    }
    return {
      session,
      reply: READINESS_PROMPT,
      actions: READINESS_ACTIONS,
    };
  }

  if (session.phase === "discovery") {
    if (session.collectingExtra) {
      const answers = {
        ...session.workflow.discoveryAnswers,
        "extra-info": [
          session.workflow.discoveryAnswers["extra-info"],
          trimmed,
        ]
          .filter(Boolean)
          .join("\n"),
      };
      return enterReadiness(
        {
          ...session,
          collectingExtra: false,
          workflow: { ...session.workflow, discoveryAnswers: answers },
        },
        typeLabel,
      );
    }

    const question = discoveryQuestionsForState(typeLabel, session.workflow);
    if (!question) {
      if (discoveryComplete(typeLabel, session.workflow)) {
        return enterReadiness(session, typeLabel);
      }
      return {
        session,
        reply: "Keep going — I still need a bit more before we build.",
      };
    }

    const nextWorkflow = advanceAfterDiscoveryAnswer(
      session.workflow,
      typeLabel,
      question.id,
      trimmed,
    );
    logCreateBuild("Chat answer saved", {
      itemType: typeLabel,
      questionId: question.id,
      answersCount: answeredDiscoveryCount(nextWorkflow),
    });

    if (discoveryComplete(typeLabel, nextWorkflow)) {
      return enterReadiness(
        { ...session, workflow: nextWorkflow },
        typeLabel,
      );
    }

    const nextQ = discoveryQuestionsForState(typeLabel, nextWorkflow);
    return {
      session: {
        ...session,
        workflow: nextWorkflow,
        phase: "discovery",
      },
      reply: nextQ ? `Got it.\n\n**${nextQ.prompt}**` : "Thanks — one more thing…",
    };
  }

  if (session.phase === "generating") {
    return { session, reply: "" };
  }

  return { session, reply: "" };
}

function enterExtraDiscovery(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  return {
    session: {
      ...session,
      phase: "discovery",
      collectingExtra: true,
      workflow: { ...session.workflow, step: "discovery" },
    },
    reply: `Sure — what else should I know before we build your **${typeLabel}**?`,
  };
}

function enterReadiness(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  const ready: CreateBuilderSession = {
    ...session,
    phase: "readiness",
    collectingExtra: false,
    workflow: {
      ...session.workflow,
      step: "readiness",
      questionMode: "split_screen",
      readinessConfirmed: true,
    },
  };
  logCreateBuild("Ready to build set", {
    itemType: typeLabel,
    answersCount: answeredDiscoveryCount(ready.workflow),
  });
  logSharedCreateSession("Ready to build", ready.workflow, ready.workflow.sessionId);
  return {
    session: ready,
    reply: READINESS_PROMPT,
    actions: READINESS_ACTIONS,
  };
}

export function markCreateBuilderGenerated(
  session: CreateBuilderSession,
): CreateBuilderSession {
  return { ...session, phase: "revise-offer" };
}

export function createBuilderExportMessage(typeLabel: string): string {
  return (
    `Your **${typeLabel}** draft is in the workspace.\n\n` +
    "**What would you like to change?** Pick an option below, or tell me in your own words."
  );
}

export function createBuilderActionsForPhase(
  session: CreateBuilderSession | null,
): CreateBuilderAction[] | undefined {
  if (!session) return undefined;
  if (session.phase === "readiness") return READINESS_ACTIONS;
  if (session.phase === "revise-offer") return reviseOfferActions();
  return undefined;
}

export function formatCreateBuilderChatHint(
  session: CreateBuilderSession | null,
): string | undefined {
  if (!session || session.phase === "done") return undefined;
  const type = session.typeLabel ?? "content";
  const name = session.typeLabel ? createBuilderLabel(type) : "Create Builder";
  const q = session.typeLabel
    ? discoveryQuestionsForState(session.typeLabel, session.workflow)
    : null;

  const lines = [
    `ACTIVE MODE: ${name} (Create workspace beside chat).`,
    "You are a collaborative builder sitting beside the user — NOT generic coaching.",
    "- Ask ONE question per reply. Never dump a list of questions.",
    "- Do NOT generate a full draft in chat — the Create panel is the canvas.",
    "- Do NOT tell the user to fill out a form elsewhere.",
    "- Do NOT skip to generation without user approval at readiness.",
    `- Artifact type: ${type}. Phase: ${session.phase}.`,
  ];

  if (session.phase === "discovery" && q) {
    lines.push(`CURRENT QUESTION (ask only this): ${q.prompt}`);
  }
  if (session.phase === "readiness") {
    lines.push(
      "READINESS: Say — I think I have enough information to build this. Would you like me to create the draft?",
    );
  }
  if (session.phase === "revise-offer") {
    lines.push(
      "REVISE: Draft is in the workspace. Ask what they want to change; offer shorter, longer, warmer, etc.",
    );
  }

  return lines.join("\n");
}
