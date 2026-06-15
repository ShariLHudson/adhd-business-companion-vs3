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

export type CreateBuilderPhase =
  | "pick-type"
  | "discovery"
  | "readiness"
  | "generating"
  | "done";

export type CreateBuilderSession = {
  typeLabel: string | null;
  workflow: CreateWorkflowState;
  phase: CreateBuilderPhase;
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
  if (/\bstrateg(y|ies)\b/i.test(t)) return "Strategy";
  if (/\bsop\b|standard operating procedure/i.test(t)) return "SOP";
  if (/\bworkshop\b|webinar\b/i.test(t)) return "Workshop";
  if (/\bproposal\b|\bsow\b/i.test(t)) return "Proposal";
  return null;
}

export function isAffirmative(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(yes|yep|yeah|sure|ok|okay|please|go ahead|do it|generate|create it|sounds good|let's go|lets go|y)\b/.test(
    t,
  );
}

export function isNegative(text: string): boolean {
  const t = text.trim().toLowerCase();
  return /^(no|nope|not yet|wait|hold|stop)\b/.test(t);
}

export function bootstrapCreateBuilderSession(
  typeLabel?: string | null,
): { session: CreateBuilderSession; opener: string } {
  const resolved = typeLabel?.trim() || null;
  if (!resolved || resolved === "content") {
    return {
      session: emptyCreateBuilderSession(),
      opener:
        "I'm here to help you build something real — one question at a time.\n\nWhat are you creating? (For example: SOP, workshop, proposal, or strategy.)",
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
  /** When set, parent should trigger draft generation in Create panel. */
  generateBrief?: string;
  generateType?: string;
  exportReady?: boolean;
};

export function processCreateBuilderTurn(
  session: CreateBuilderSession,
  userText: string,
): CreateBuilderTurnResult {
  const trimmed = userText.trim();
  if (!trimmed) {
    return {
      session,
      reply: "Take your time — even a rough answer helps. What's on your mind?",
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
          "I can help with **SOP**, **Workshop**, **Proposal**, **Strategy**, and more. Which one are you building?",
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

  if (session.phase === "readiness") {
    if (isAffirmative(trimmed)) {
      const brief = buildBriefFromDiscovery(
        typeLabel,
        session.workflow.discoveryAnswers,
      );
      return {
        session: { ...session, phase: "generating" },
        reply: `Building your **${typeLabel}** now — using everything you shared. Watch the workspace on the right.`,
        generateBrief: brief,
        generateType: typeLabel,
      };
    }
    if (isNegative(trimmed)) {
      const lastQ = getDiscoveryQuestions(typeLabel).at(-1);
      return {
        session: {
          ...session,
          phase: "discovery",
          workflow: {
            ...session.workflow,
            step: "discovery",
            discoveryIndex: Math.max(0, getDiscoveryQuestions(typeLabel).length - 1),
          },
        },
        reply: lastQ
          ? `No problem — what else should I know?\n\n**${lastQ.prompt}**`
          : "No problem — what should we add or change?",
      };
    }
    return {
      session,
      reply:
        "Would you like me to generate it? Reply **yes** when you're ready, or tell me what to adjust first.",
    };
  }

  if (session.phase === "discovery") {
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
      reply: nextQ
        ? `Got it.\n\n**${nextQ.prompt}**`
        : "Thanks — one more thing…",
    };
  }

  if (session.phase === "generating") {
    return { session, reply: "" };
  }

  return { session, reply: "" };
}

function enterReadiness(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  const ready: CreateBuilderSession = {
    ...session,
    phase: "readiness",
    workflow: { ...session.workflow, step: "readiness" },
  };
  return {
    session: ready,
    reply:
      `I think I have enough information to create this **${typeLabel}**. ` +
      "Would you like me to generate it?",
  };
}

export function markCreateBuilderGenerated(
  session: CreateBuilderSession,
): CreateBuilderSession {
  return { ...session, phase: "done" };
}

export function createBuilderExportMessage(typeLabel: string): string {
  return (
    `Your **${typeLabel}** draft is in the workspace. From here you can:\n\n` +
    "- **Edit** in the panel\n" +
    "- **Print** or **Google Docs**\n" +
    "- **Save** to Saved Work\n" +
    "- **Add to Project**\n\n" +
    "Tell me what to change, or use the actions above the draft."
  );
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
    "You are a collaborative builder — NOT generic home coaching.",
    "- One question per reply. Never ask 'what feels most important right now'.",
    "- Do NOT generate a full draft in chat — the Create panel is the canvas.",
    "- Do NOT skip ahead to generation without user approval at readiness.",
    `- Artifact type: ${type}. Phase: ${session.phase}.`,
  ];

  if (session.phase === "discovery" && q) {
    lines.push(`CURRENT QUESTION (ask only this): ${q.prompt}`);
  }
  if (session.phase === "readiness") {
    lines.push(
      "READINESS: Ask exactly — I think I have enough information to create this. Would you like me to generate it?",
    );
  }

  return lines.join("\n");
}
