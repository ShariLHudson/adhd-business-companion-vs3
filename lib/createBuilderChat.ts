/**
 * Create + Chat integration — when split beside Create, chat becomes a typed
 * builder (SOP Builder, Workshop Builder, etc.). One question per turn; generate
 * only after explicit user approval.
 */

import { matchCatalogFromText } from "./createCatalog";
import {
  advanceAfterDiscoveryAnswer,
  buildBriefFromDiscovery,
  discoveryComplete,
  discoveryQuestionsForState,
  getDiscoveryQuestions,
  type CreateWorkflowState,
  EMPTY_CREATE_WORKFLOW,
  advanceAfterTypePick,
} from "./createWorkflow";
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
    workflow: { ...EMPTY_CREATE_WORKFLOW },
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
  return /^(yes|yep|yeah|sure|ok|okay|please|go ahead|do it|generate|create it|create draft|sounds good|let's go|lets go|y)\b/.test(
    t,
  );
}

export function isAddMoreInformation(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(no|nope|not yet|wait|hold|stop|add more|more info|more information)\b/.test(
    t,
  );
}

export const READINESS_ACTIONS: CreateBuilderAction[] = [
  { id: "create-draft", label: "Create Draft" },
  { id: "add-more-info", label: "Add More Information" },
];

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
        "I'm here to help you build something real — one question at a time.\n\nPick a category and type in the workspace first, or tell me what you're creating (SOP, workshop, proposal, strategy, email…).",
    };
  }

  const session: CreateBuilderSession = {
    typeLabel: resolved,
    workflow: advanceAfterTypePick(resolved, null),
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
      workflow: advanceAfterTypePick(type, null),
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
    if (isAffirmative(trimmed) || /^create draft$/i.test(trimmed)) {
      const brief = buildBriefFromDiscovery(
        typeLabel,
        session.workflow.discoveryAnswers,
      );
      return {
        session: { ...session, phase: "generating", collectingExtra: false },
        reply: `Building your **${typeLabel}** now — using everything you shared. Watch the workspace on the right.`,
        generateBrief: brief,
        generateType: typeLabel,
      };
    }
    if (isAddMoreInformation(trimmed)) {
      return enterExtraDiscovery(session, typeLabel);
    }
    return {
      session,
      reply:
        "I think I have enough information to build this. Would you like me to create the draft?",
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
      return enterReadiness(session, typeLabel);
    }

    const nextWorkflow = advanceAfterDiscoveryAnswer(
      session.workflow,
      typeLabel,
      question.id,
      trimmed,
    );

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
  const answered = Object.values(session.workflow.discoveryAnswers).filter((v) =>
    v.trim(),
  ).length;
  if (answered < 2) {
    const nextQ = discoveryQuestionsForState(typeLabel, session.workflow);
    if (nextQ) {
      return {
        session: { ...session, phase: "discovery" },
        reply: `**${nextQ.prompt}**`,
      };
    }
  }

  const ready: CreateBuilderSession = {
    ...session,
    phase: "readiness",
    collectingExtra: false,
    workflow: { ...session.workflow, step: "readiness" },
  };
  return {
    session: ready,
    reply:
      "I think I have enough information to build this. Would you like me to create the draft?",
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
