/**
 * Create + Chat integration — when split beside Create, chat becomes a typed
 * builder (SOP Builder, Workshop Builder, etc.). One question per turn; generate
 * only after explicit user approval.
 */

import { matchCatalogFromText } from "./createCatalog";
import {
  catalogTypeFromUserPhrase,
  userFacingCreateTypeLabel,
} from "./createTypePickers";
import {
  CREATE_STEP1_CHAT,
  CREATE_KICKOFF_HEADER,
  CREATE_STEP1_QUESTION,
  isStaleCreateOpener,
} from "./builderKickoff";
import {
  advanceAfterItemPick,
  advanceAfterDiscoveryAnswer,
  advanceToDiscovery,
  buildBriefFromWorkflow,
  categoryIdForType,
  discoveryComplete,
  discoveryReadyForDraft,
  discoveryQuestionsForState,
  getDiscoveryQuestions,
  initialQuestionsComplete,
  mergeCreateWorkflow,
  requiredFieldsComplete,
  resolvedTypeLabel,
  type CreateWorkflowState,
  EMPTY_CREATE_WORKFLOW,
  answeredDiscoveryCount,
} from "./createWorkflow";
import { buildFullCreateBrief, resolveTemplateSections } from "./createTemplates";
import {
  formatIncompleteSectionsPrompt,
  formatSectionCollectionPrompt,
  incompleteTemplateSections,
  isDiscoveryHelpRequest,
  isExplicitBuildApproval,
  isInSectionDiscoveryPhase,
  isUnsaveableSectionText,
  matchSectionFromText,
  materializeDiscoverySections,
  setSectionContent,
  tryResolveSectionOptionApproval,
  verifySectionWrite,
} from "./createSectionDiscovery";
import {
  extractPendingBuilderContent,
  isBuilderAddCommand,
} from "./builderContentSync";
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
  const display = userFacingCreateTypeLabel(typeLabel);
  if (!display) return "Create with Shari";
  return BUILDER_NAMES[typeLabel] ?? BUILDER_NAMES[display] ?? `${display}`;
}

const PLACEHOLDER_CREATE_TITLES =
  /^(?:draft|new piece|untitled|content)$/i;

/** Title/brief that is only the artifact type label is not a real topic yet. */
export function resolvedCreateTopic(
  itemType: string | null | undefined,
  title?: string | null,
  brief?: string | null,
): string {
  const type = itemType?.trim() ?? "";
  const candidates = [title?.trim(), brief?.trim()].filter(Boolean) as string[];
  for (const c of candidates) {
    if (type && c.toLowerCase() === type.toLowerCase()) continue;
    if (PLACEHOLDER_CREATE_TITLES.test(c)) continue;
    return c;
  }
  return "";
}

/** Split-screen Create builder owns chat — block parallel coach/cards. */
export function shouldSuppressParallelCoaching(
  session: CreateBuilderSession | null,
  splitCreateChat: boolean,
): boolean {
  if (!splitCreateChat) return false;
  if (!session) return true;
  return session.phase !== "done";
}

export function resolveBuilderType(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  const fromPhrase = catalogTypeFromUserPhrase(t);
  if (fromPhrase) return fromPhrase;
  const match = matchCatalogFromText(t);
  if (match?.type && !match.route) return match.type;
  if (/\bstrateg(y|ies)\b/i.test(t)) return "Business Strategy";
  if (/\bsop\b|standard operating procedure/i.test(t)) return "SOP";
  if (/\bworkshop\b|webinar\b/i.test(t)) return "Workshop";
  if (/\bproposal\b|\bsow\b/i.test(t)) return "Proposal";
  if (/\bemail\b/i.test(t)) return "Email";
  if (/\bnewsletter\b/i.test(t)) return "Newsletter";
  if (/\bpresentation\b|\bslides\b/i.test(t)) return "Presentation";
  if (/\bsocial media post\b/i.test(t)) return "Social Post";
  if (/\blead magnet\b/i.test(t)) return "Lead Magnet";
  if (/\blanding page\b/i.test(t)) return "Landing Page";
  if (/\bfunnel\b/i.test(t)) return "Sales Funnel";
  if (/\btraining\b/i.test(t)) return "Training Guide";
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
export function isGenericCreateBuilderChatMessage(content: string): boolean {
  const c = content.trim();
  if (!c) return false;
  return (
    c.includes(CREATE_STEP1_QUESTION) ||
    c.includes(CREATE_KICKOFF_HEADER) ||
    /what would you like to create/i.test(c) ||
    /pick a type in the panel/i.test(c) ||
    /I see you(?:'re| are) creating/i.test(c) ||
    isStaleCreateOpener(c)
  );
}

type ChatLine = { role: "user" | "assistant"; content: string };

/** Strip system messages before builder opener sync. */
export function filterChatLines(
  messages: { role: string; content: string }[],
): ChatLine[] {
  return messages.filter(
    (m): m is ChatLine => m.role === "user" || m.role === "assistant",
  );
}

/** Replace generic Create picker chat with a typed builder opener. */
export function applyCreateBuilderChatOpener(
  messages: ChatLine[],
  opener: string,
  opts?: { replaceAll?: boolean },
): ChatLine[] {
  const hasUserTurns = messages.some((m) => m.role === "user");
  if (opts?.replaceAll || !hasUserTurns) {
    return [{ role: "assistant", content: opener }];
  }
  const cleaned = messages.filter(
    (m) => !(m.role === "assistant" && isGenericCreateBuilderChatMessage(m.content)),
  );
  const last = cleaned[cleaned.length - 1];
  if (last?.role === "assistant" && last.content === opener) {
    return cleaned;
  }
  return [...cleaned, { role: "assistant", content: opener }];
}

/** Panel workflow for split-screen sync — use advanceAfterItemPick when ref is stale. */
export function panelWorkflowForBuilderSync(
  typeLabel: string,
  panelWorkflow: CreateWorkflowState,
  sessionId?: string | null,
): CreateWorkflowState {
  const trimmed = typeLabel.trim();
  if (
    panelWorkflow.selectedTypeLabel === trimmed &&
    panelWorkflow.categoryId
  ) {
    return { ...panelWorkflow, questionMode: "split_screen" };
  }
  return {
    ...advanceAfterItemPick(trimmed),
    sessionId: sessionId ?? panelWorkflow.sessionId ?? undefined,
    questionMode: "split_screen",
  };
}

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

  if (discoveryComplete(resolved, merged)) {
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
    if (initialQuestionsComplete(resolved, merged)) {
      const sectionWorkflow: CreateWorkflowState = {
        ...merged,
        step: "discovery",
        discoverySubphase: "sections",
      };
      const incomplete = incompleteTemplateSections(sectionWorkflow);
      const session: CreateBuilderSession = {
        typeLabel: resolved,
        workflow: sectionWorkflow,
        phase: "discovery",
      };
      return {
        session,
        opener: incomplete.length
          ? `I have your answers so far for **${resolved}**.\n\n${formatIncompleteSectionsPrompt(incomplete)}`
          : `I have your answers so far for **${resolved}**.`,
      };
    }
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
      discoverySubphase: "sections",
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
      opener: CREATE_STEP1_CHAT,
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
  const display = userFacingCreateTypeLabel(typeLabel) ?? typeLabel;
  if (firstQuestion?.trim()) {
    const q = firstQuestion.trim();
    if (typeLabel === "Newsletter") {
      return `Great — let's create your **${display}**. ${q}`;
    }
    return q;
  }
  const article = /^[aeiou]/i.test(display) ? "an" : "a";
  return `What should we tackle first for ${article} **${display}**?`;
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
  lastAssistantText = "",
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
          "Pick one from the list — for example **Social Media Post**, **Email**, **SOP**, or **Workshop**.",
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
      const workflow = { ...session.workflow, discoveryAnswers: answers };
      if (isInSectionDiscoveryPhase(workflow)) {
        return handleSectionDiscoveryTurn(
          { ...session, collectingExtra: false, workflow },
          typeLabel,
          trimmed,
          lastAssistantText,
        );
      }
      return enterReadiness(
        {
          ...session,
          collectingExtra: false,
          workflow,
        },
        typeLabel,
      );
    }

    if (isInSectionDiscoveryPhase(session.workflow)) {
      return handleSectionDiscoveryTurn(session, typeLabel, trimmed, lastAssistantText);
    }

    if (isDiscoveryHelpRequest(trimmed)) {
      return { session, reply: "" };
    }

    const question = discoveryQuestionsForState(typeLabel, session.workflow);
    if (!question) {
      if (initialQuestionsComplete(typeLabel, session.workflow)) {
        return transitionToSectionDiscovery(
          session,
          typeLabel,
          session.workflow,
        );
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

    if (initialQuestionsComplete(typeLabel, nextWorkflow)) {
      if (discoveryReadyForDraft(typeLabel, nextWorkflow)) {
        return enterReadiness(
          { ...session, workflow: nextWorkflow },
          typeLabel,
        );
      }
      return transitionToSectionDiscovery(session, typeLabel, nextWorkflow);
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

function handleSectionDiscoveryTurn(
  session: CreateBuilderSession,
  typeLabel: string,
  trimmed: string,
  lastAssistantText = "",
): CreateBuilderTurnResult {
  let workflow: CreateWorkflowState = materializeDiscoverySections(typeLabel, {
    ...session.workflow,
    discoverySubphase: "sections",
    step: "discovery",
  });

  if (isExplicitBuildApproval(trimmed)) {
    return enterReadiness({ ...session, workflow }, typeLabel);
  }

  const optionPick = tryResolveSectionOptionApproval(
    trimmed,
    workflow,
    lastAssistantText,
  );
  if (!optionPick && isBuilderAddCommand(trimmed) && workflow.activeSectionId) {
    const pending = extractPendingBuilderContent(lastAssistantText);
    const activeId = workflow.activeSectionId;
    const sections = resolveTemplateSections(workflow) ?? [];
    const activeSection = sections.find((s) => s.id === activeId);
    if (
      pending &&
      activeSection &&
      verifySectionWrite(workflow, activeId, pending)
    ) {
      workflow = setSectionContent(workflow, activeId, pending);
      const stillIncomplete = incompleteTemplateSections(workflow);
      if (stillIncomplete.length === 0) {
        return enterReadiness({ ...session, workflow }, typeLabel);
      }
      return {
        session: { ...session, workflow, phase: "discovery" },
        reply:
          `Added to **${activeSection.label}**:\n${pending}\n\n` +
          formatIncompleteSectionsPrompt(stillIncomplete),
      };
    }
  }
  if (optionPick) {
    const sections = resolveTemplateSections(workflow) ?? [];
    const section = sections.find((s) => s.id === optionPick.sectionId);
    if (section && verifySectionWrite(workflow, optionPick.sectionId, optionPick.value)) {
      workflow = setSectionContent(workflow, optionPick.sectionId, optionPick.value);
      const stillIncomplete = incompleteTemplateSections(workflow);
      if (stillIncomplete.length === 0) {
        return enterReadiness({ ...session, workflow }, typeLabel);
      }
      return {
        session: { ...session, workflow, phase: "discovery" },
        reply:
          `Added to **${section.label}**:\n${optionPick.value}\n\n` +
          formatIncompleteSectionsPrompt(stillIncomplete),
      };
    }
  }

  if (isDiscoveryHelpRequest(trimmed)) {
    return { session: { ...session, workflow }, reply: "" };
  }

  const incomplete = incompleteTemplateSections(workflow);
  if (incomplete.length === 0) {
    return enterReadiness({ ...session, workflow }, typeLabel);
  }

  const activeId = workflow.activeSectionId;
  if (activeId) {
    const sections = resolveTemplateSections(workflow) ?? [];
    const activeSection = sections.find((s) => s.id === activeId);
    if (activeSection && !isUnsaveableSectionText(trimmed)) {
      if (verifySectionWrite(workflow, activeId, trimmed)) {
        workflow = setSectionContent(workflow, activeId, trimmed);
        const stillIncomplete = incompleteTemplateSections(workflow);
        if (stillIncomplete.length === 0) {
          return enterReadiness({ ...session, workflow }, typeLabel);
        }
        return {
          session: { ...session, workflow, phase: "discovery" },
          reply:
            `Added to **${activeSection.label}**:\n${trimmed}\n\n` +
            formatIncompleteSectionsPrompt(stillIncomplete),
        };
      }
      return {
        session: { ...session, workflow, phase: "discovery" },
        reply: `That looks similar to what's already in **${activeSection.label}**. Want to revise it or pick another section?`,
      };
    }
  }

  const picked = matchSectionFromText(trimmed, incomplete);
  if (picked && !isUnsaveableSectionText(trimmed)) {
    return {
      session: {
        ...session,
        workflow: { ...workflow, activeSectionId: picked.id, pendingSectionOptions: null },
        phase: "discovery",
      },
      reply: formatSectionCollectionPrompt(picked),
    };
  }

  return {
    session: { ...session, workflow, phase: "discovery" },
    reply: formatIncompleteSectionsPrompt(incomplete),
  };
}

function transitionToSectionDiscovery(
  session: CreateBuilderSession,
  typeLabel: string,
  workflow: CreateWorkflowState,
): CreateBuilderTurnResult {
  const materialized = materializeDiscoverySections(typeLabel, workflow);
  const incomplete = incompleteTemplateSections(materialized);
  if (incomplete.length === 0) {
    return enterReadiness({ ...session, workflow: materialized }, typeLabel);
  }
  const nextWorkflow: CreateWorkflowState = {
    ...materialized,
    discoverySubphase: "sections",
    step: "discovery",
    activeSectionId: null,
  };
  return {
    session: { ...session, workflow: nextWorkflow, phase: "discovery" },
    reply:
      `Got it — I've captured your answers.\n\n` +
      formatIncompleteSectionsPrompt(incomplete),
  };
}

function enterExtraDiscovery(
  session: CreateBuilderSession,
  typeLabel: string,
): CreateBuilderTurnResult {
  const workflow: CreateWorkflowState = {
    ...session.workflow,
    step: "discovery",
    discoverySubphase: isInSectionDiscoveryPhase(session.workflow)
      ? "sections"
      : session.workflow.discoverySubphase,
  };
  const incomplete = incompleteTemplateSections(workflow);
  return {
    session: {
      ...session,
      phase: "discovery",
      collectingExtra: true,
      workflow,
    },
    reply:
      incomplete.length > 0
        ? `Sure — what else should we add?\n\n${formatIncompleteSectionsPrompt(incomplete)}`
        : `Sure — what else should I know before we build your **${typeLabel}**?`,
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
  const sectionPhase = isInSectionDiscoveryPhase(session.workflow);
  const incomplete = sectionPhase
    ? incompleteTemplateSections(session.workflow)
    : [];

  const lines = [
    `ACTIVE MODE: ${name} (Create workspace beside chat).`,
    "You are a collaborative builder sitting beside the user — NOT generic coaching.",
    "- Ask ONE question per reply. Never dump a list of questions.",
    "- Do NOT generate a full draft in chat — the Create panel is the canvas.",
    "- Do NOT tell the user to fill out a form elsewhere.",
    "- Do NOT skip to generation without user approval at readiness.",
    "- Do NOT say you are ready to build while template sections remain empty.",
    `- Artifact type: ${type}. Phase: ${session.phase}.`,
  ];

  if (session.phase === "discovery" && sectionPhase) {
    lines.push(
      "SECTION DISCOVERY: Initial questions are done. Help fill empty template outline sections.",
    );
    if (incomplete.length) {
      lines.push(
        `INCOMPLETE SECTIONS: ${incomplete.map((s) => s.label).join(", ")}`,
      );
    }
    const activeId = session.workflow.activeSectionId;
    if (activeId) {
      const active = incomplete.find((s) => s.id === activeId);
      if (active) {
        lines.push(`ACTIVE SECTION: ${active.label}`);
      }
    }
    lines.push(
      "If the user asks for ideas, examples, or suggestions: give 3–5 concrete options tied to their topic and audience. Offer to use one or brainstorm more. Stay in discovery — do NOT enter build-ready.",
    );
    lines.push(
      "After they pick content for a section, confirm briefly and ask which remaining section to work on next.",
    );
  } else if (session.phase === "discovery" && q) {
    lines.push(`CURRENT QUESTION (ask only this): ${q.prompt}`);
    lines.push(
      "If the user asks what a concept means: brief answer tied to this build, then repeat the current question. Do NOT enter Teaching Mode or offer learning paths.",
    );
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
