/**
 * Universal Creation orchestrator — Discover → Prepare → Create → …
 *
 * @deprecated As Create open API — P0-03 ownership: use
 * `lib/universalCreationEntrypoint` (`resolveUniversalCreationEntrypoint`).
 * This module remains a **legacy chat-document adapter** only.
 * @see lib/createEstate/createOwnershipContract.ts
 */

import { isRegistryArtifactExecution } from "@/lib/artifactRegistry";
import { resolveImmediateCreateAction } from "@/lib/createExperience/createExperienceRouting";
import { isProjectCreationIntent } from "@/lib/createExperience/createExperienceRouting";
import { isEmailAutomationOrInboxHelpRequest } from "@/lib/estate/emailAutomationHelp";
import { isGoogleSheetWorthyRequest } from "@/lib/googleSheetsIntelligence";
import { shouldOfferVisualThinkingRecommendation } from "@/lib/visualThinkingOverreach";
import {
  adaptivePreparationExtras,
  prefillDiscoveryFromAdaptiveMemory,
  recordSignalsFromDiscoveryAnswer,
} from "@/lib/estateBrain/adaptiveIntelligence";
import {
  inferDocumentTypeFromCreateText,
  isSimpleCreateRequest,
  logCreateFastPath,
  SIMPLE_CREATE_VERB_RE,
  createFastPathRecoveryLine,
} from "./createFastPath";
import {
  UNIVERSAL_DOCUMENT_PLUGINS,
  pluginById,
} from "./documentRegistry";
import {
  formatUncertaintyMenu,
  guidedCreationHint,
} from "./phases";
import { formatPostDraftReviewPrompt } from "./guidedCreationFlow";
import {
  advanceGuidedCreationFlow,
  isGuidedCreationAssistantContext,
  isPostDiscoveryCreationPhase,
} from "./guidedCreationFlow";
import {
  EXPLICIT_EMAIL_START_OVER_RE,
  hasUsableApprovedEmailDraft,
} from "./emailWorkflowCompletion";
import {
  exitCreateWorkflow,
  parkCreateWorkflow,
  resumeCreateWorkflow,
} from "./createLifecycle";
import {
  classifyCreateTurnRelationship,
  createHandlerEligible,
} from "./createTurnRelationship";
import { isCreateRevisionInstruction } from "./createRevisionDetect";
import { resolveCreateFoundationClassification } from "@/lib/creationIdentity/createFoundationRouting";
import {
  formatShariCreationIntro,
  formatShariCreationQuestion,
} from "./shariCreationExperience";
import type {
  UniversalCreationSession,
  UniversalCreationTurnResult,
  UniversalDiscoveryConfidence,
  UniversalDocumentPlugin,
  UniversalDocumentType,
} from "./types";
import {
  computeUniversalDiscoveryConfidence,
  isUniversalDiscoveryComplete,
} from "./types";
import { isBareGenericAcceptance } from "../pendingAcceptanceAuthority";
import { assistantOfferedConsent } from "../conversationWorkflowContinuation";
import { inferMeaningTopicFromAssistant } from "../conversation/mostRecentMeaningWins";
import {
  isConversationSessionSpineEnabled,
  syncUniversalCreationToSession,
} from "@/lib/conversationSession";
import { getActiveSpineConversationId } from "@/lib/conversationSession/spine";
import { reportProjectionConversationIdMismatch } from "@/lib/conversationSession/spineInvariants";
import {
  isCreateFlowAssistantContext,
  isUniversalCreationMessage,
} from "./createFlowContext";
import {
  applyEmailDiscoveryDefaults,
  harvestDiscoveryFromConversation,
} from "./discoveryContextHarvest";
import { composeDocumentDraft } from "./draftComposer";
import { evaluateCreationCriticalGap } from "@/lib/shariAnswerFirst/creationCriticalGap";
import {
  classifyTurnRecovery,
  shouldRepairOrResumeTask,
} from "@/lib/shariAnswerFirst/turnRecovery";
import { isExplicitCreationCommand } from "@/lib/shariAnswerFirst/questionVersusAction";

const STORAGE_KEY = "universal-creation-session-v1";

let memoryUniversalCreationSession: UniversalCreationSession | null = null;

const EXPLICIT_ROOM_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me|step into)\b/i;

const UNCERTAINTY_RE =
  /\b(?:i don'?t know|not sure|no idea|you decide|whatever works|haven'?t figured|unsure)\b/i;

export { isUniversalCreationMessage, isCreateFlowAssistantContext };

export function detectUniversalDocumentType(
  userText: string,
): UniversalDocumentType | null {
  const t = userText.trim();
  if (!t) return null;
  if (isEmailAutomationOrInboxHelpRequest(t)) return null;
  // 105 — Marketing Plan Work Type never becomes a document type
  if (
    /\b(?:simple\s+)?marketing\s+plans?\b|\bmarket(?:ing)?\s+this\s+offer\b/i.test(
      t,
    )
  ) {
    return null;
  }
  // Sprint 2 — Event domain never becomes a document type
  // (workshop/webinar plugins retired; keep belt-and-suspenders)
  if (
    /\b(?:workshop|webinar|conference|retreat|summit|meetup|networking\s+event|launch\s+event|event\s+plan)\b/i.test(
      t,
    )
  ) {
    return null;
  }
  for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
    if (plugin.id === "document") continue;
    if (plugin.id === "workshop" || plugin.id === "webinar") continue;
    if (plugin.detectPatterns.some((re) => re.test(t))) return plugin.id;
  }
  if (isRegistryArtifactExecution(t)) return "document";
  // Revision phrasing often matches "make the …" — never invent a document type.
  if (isCreateRevisionInstruction(t)) return null;
  if (SIMPLE_CREATE_VERB_RE.test(t)) {
    return inferDocumentTypeFromCreateText(t) ?? "document";
  }
  const inferred = inferDocumentTypeFromCreateText(t);
  if (inferred) return inferred;
  return null;
}

export function shouldEnterUniversalCreation(userText: string): boolean {
  const t = userText.trim();
  if (!t || EXPLICIT_ROOM_NAV_RE.test(t)) return false;
  if (isEmailAutomationOrInboxHelpRequest(t)) return false;
  if (isProjectCreationIntent(t)) return false;
  if (isGoogleSheetWorthyRequest(t)) return false;
  if (shouldOfferVisualThinkingRecommendation(t) && !isSimpleCreateRequest(t)) {
    return false;
  }
  if (!isSimpleCreateRequest(t) && !detectUniversalDocumentType(t)) return false;
  const docType = detectUniversalDocumentType(t) ?? "document";
  const session = buildInitialSession(t, docType, 0);
  return !isUniversalDiscoveryComplete(session.confidence);
}

function bindSessionToActiveSpine(
  session: UniversalCreationSession,
): UniversalCreationSession {
  if (session.boundConversationId?.trim()) return session;
  const spineId = getActiveSpineConversationId();
  if (!spineId) return session;
  return { ...session, boundConversationId: spineId };
}

function rejectForeignUniversalCreationSession(
  session: UniversalCreationSession | null,
): UniversalCreationSession | null {
  if (!session) return null;
  const spineId = getActiveSpineConversationId();
  const bound = session.boundConversationId?.trim() || "";
  // Explicit foreign spine id → ignore. Legacy sessions without bind still load
  // until next save stamps boundConversationId (reset already clears UC).
  if (bound && spineId && bound !== spineId) {
    reportProjectionConversationIdMismatch({
      projection: "universalCreationSession",
      projectionConversationId: bound,
      spineConversationId: spineId,
    });
    memoryUniversalCreationSession = null;
    const storage =
      typeof window !== "undefined" && window.localStorage
        ? window.localStorage
        : null;
    storage?.removeItem(STORAGE_KEY);
    return null;
  }
  return session;
}

export function saveUniversalCreationSession(
  session: UniversalCreationSession | null,
): void {
  const bound = session ? bindSessionToActiveSpine(session) : null;
  memoryUniversalCreationSession = bound;
  const storage =
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage
      : null;
  if (!storage) return;
  try {
    if (!bound) {
      storage.removeItem(STORAGE_KEY);
      return;
    }
    storage.setItem(STORAGE_KEY, JSON.stringify(bound));
    if (isConversationSessionSpineEnabled()) {
      syncUniversalCreationToSession(bound);
    }
  } catch {
    // Memory session still holds — storage may be unavailable in tests/SSR.
  }
}

export function loadUniversalCreationSession(): UniversalCreationSession | null {
  if (memoryUniversalCreationSession) {
    return rejectForeignUniversalCreationSession(memoryUniversalCreationSession);
  }
  const storage =
    typeof window !== "undefined" && window.localStorage
      ? window.localStorage
      : null;
  if (!storage) return null;
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UniversalCreationSession;
    memoryUniversalCreationSession = parsed;
    return rejectForeignUniversalCreationSession(parsed);
  } catch {
    return null;
  }
}

export function clearUniversalCreationSession(): void {
  memoryUniversalCreationSession = null;
  saveUniversalCreationSession(null);
}

function initialFlags(
  userText: string,
  plugin: UniversalDocumentPlugin,
): Omit<UniversalDiscoveryConfidence, "score"> {
  const flags = { what: true, why: false, who: false, success: false };
  for (const q of plugin.discoveryQuestions) {
    if (q.signalPatterns?.some((re) => re.test(userText))) {
      flags[q.slot] = true;
    }
  }
  return flags;
}

function extractPrefilledAnswers(
  userText: string,
  plugin: UniversalDocumentPlugin,
): Record<string, string> {
  const answers: Record<string, string> = {};
  for (const q of plugin.discoveryQuestions) {
    if (q.signalPatterns?.some((re) => re.test(userText))) {
      answers[q.id] = userText.trim();
    }
  }
  return answers;
}

/**
 * Enough critical facts (who + why/purpose) to write a useful first draft
 * without more interviewing — emails, SOPs, posts, proposals, plans, etc.
 */
export function hasExecutableDraftContext(
  session: UniversalCreationSession,
): boolean {
  return evaluateCreationCriticalGap(session).canDraft;
}

function mergeHarvestedAnswers(
  documentType: UniversalDocumentType,
  userText: string,
  priorAnswers: Record<string, string>,
  contextTexts: readonly string[] = [],
): Record<string, string> {
  const harvested = harvestDiscoveryFromConversation(documentType, [
    ...contextTexts,
    userText,
  ]);
  let answers = { ...priorAnswers, ...harvested };
  if (documentType === "email") {
    answers = applyEmailDiscoveryDefaults(answers, userText, contextTexts);
  }
  return answers;
}

function recomputeSessionFromAnswers(
  session: UniversalCreationSession,
  answers: Record<string, string>,
): UniversalCreationSession {
  const plugin = pluginById(session.documentType)!;
  const flags = {
    what: false,
    why: false,
    who: false,
    success: false,
  };
  for (const q of plugin.discoveryQuestions) {
    if (answers[q.id]) flags[q.slot] = true;
  }
  // Executable who+why: treat optional success as satisfied so we can draft.
  if (
    flags.who &&
    flags.why &&
    (flags.what ||
      answers["email-ask"] ||
      answers["email-purpose"] ||
      session.documentType !== "email")
  ) {
    flags.what = true;
    flags.why = true;
    flags.who = true;
    flags.success = true;
    if (session.documentType === "email") {
      if (!answers["email-ask"] && answers["email-purpose"]) {
        answers = { ...answers, "email-ask": answers["email-purpose"] };
      }
      if (!answers["email-purpose"] && answers["email-ask"]) {
        answers = { ...answers, "email-purpose": answers["email-ask"] };
      }
      if (!answers["email-context"]) {
        answers = {
          ...answers,
          "email-context":
            "They know I've been handling questions as they come.",
        };
      }
      if (!answers["email-success"]) {
        answers = {
          ...answers,
          "email-success":
            "They give me until tomorrow and wait for my reply.",
        };
      }
    }
  }
  let questionIndex = 0;
  while (
    questionIndex < plugin.discoveryQuestions.length &&
    answers[plugin.discoveryQuestions[questionIndex]!.id]
  ) {
    questionIndex += 1;
  }
  return {
    ...session,
    answers,
    questionIndex,
    confidence: computeUniversalDiscoveryConfidence(flags),
  };
}

function draftArtifactTurn(
  session: UniversalCreationSession,
): UniversalCreationTurnResult {
  const filled = recomputeSessionFromAnswers(
    session,
    mergeHarvestedAnswers(
      session.documentType,
      session.originalUserText,
      session.answers,
    ),
  );
  const draftBody = composeDocumentDraft(filled);
  const plugin = pluginById(filled.documentType);
  const label = plugin?.label?.toLowerCase() ?? "draft";
  const readySession: UniversalCreationSession = {
    ...filled,
    phase: "awaiting_action",
    preparationReady: true,
    approvedDraft: true,
    draftContent: draftBody,
    confidence: computeUniversalDiscoveryConfidence({
      what: true,
      why: true,
      who: true,
      success: true,
    }),
  };
  const opener =
    filled.documentType === "email"
      ? "Absolutely. Here's a simple email you can send — edit anything that doesn't sound like you."
      : `Here's a solid first ${label} from what you've shared — edit anything that doesn't sound like you.`;
  return {
    kind: "draft",
    message: opener,
    draftBody,
    session: readySession,
  };
}

function buildInitialSession(
  userText: string,
  documentType: UniversalDocumentType,
  turn: number,
): UniversalCreationSession {
  const plugin = pluginById(documentType)!;
  const memoryPrefill = prefillDiscoveryFromAdaptiveMemory("create_sop");
  const extracted = extractPrefilledAnswers(userText, plugin);
  const harvested = mergeHarvestedAnswers(documentType, userText, {
    ...memoryPrefill,
    ...extracted,
  });
  const base: UniversalCreationSession = {
    documentType,
    phase: "discovery",
    confidence: computeUniversalDiscoveryConfidence({
      what: true,
      why: false,
      who: false,
      success: false,
    }),
    answers: harvested,
    questionIndex: 0,
    originalUserText: userText,
    startedAtTurn: turn,
    preparationReady: false,
    pendingEnhancements: [],
  };
  return recomputeSessionFromAnswers(base, harvested);
}

function nextQuestion(session: UniversalCreationSession) {
  const plugin = pluginById(session.documentType)!;
  for (let i = session.questionIndex; i < plugin.discoveryQuestions.length; i++) {
    const q = plugin.discoveryQuestions[i]!;
    if (!session.answers[q.id]) return { question: q, index: i };
  }
  return null;
}

function applyAnswer(
  session: UniversalCreationSession,
  questionId: string,
  answer: string,
): UniversalCreationSession {
  const plugin = pluginById(session.documentType)!;
  const question = plugin.discoveryQuestions.find((q) => q.id === questionId);
  if (!question) return session;

  recordSignalsFromDiscoveryAnswer(questionId, answer);

  const answers = { ...session.answers, [questionId]: answer.trim() };
  const flags = {
    what: session.confidence.what,
    why: session.confidence.why,
    who: session.confidence.who,
    success: session.confidence.success,
  };
  flags[question.slot] = true;

  return {
    ...session,
    answers,
    questionIndex: session.questionIndex + 1,
    confidence: computeUniversalDiscoveryConfidence(flags),
  };
}

function preparationLine(session: UniversalCreationSession): string {
  const plugin = pluginById(session.documentType)!;
  const combined = Object.values(session.answers).join(" ");
  const parts: string[] = [];

  if (session.documentType === "sop") {
    const audience = session.answers["sop-audience-type"] ?? "";
    const size = session.answers["sop-audience-size"] ?? "";
    const start = session.answers["sop-starting-point"] ?? "";
    if (/client/i.test(audience)) parts.push("set up for client delivery");
    if (/va|team|multiple|staff/i.test(size)) {
      parts.push("include a printable checklist");
      parts.push("leave placeholders for screenshots");
    }
    if (/scratch|fresh/i.test(start)) {
      parts.push("start from a clean template");
    } else if (/already|written|existing/i.test(start)) {
      parts.push("leave room to paste what you already have");
    }
  }

  if (parts.length === 0) {
    parts.push(`I'll open ${plugin.label} with a template and structure ready`);
  } else {
    parts.unshift(`I'll open the ${plugin.label} builder`);
  }

  const adaptive =
    session.documentType === "sop"
      ? adaptivePreparationExtras("create_sop")
      : null;
  const base = `${parts.join(" — ")}.`;
  return adaptive ? `${base} ${adaptive}` : base;
}

function enhancementOffers(session: UniversalCreationSession): string[] {
  const plugin = pluginById(session.documentType)!;
  return plugin.enhancements.slice(0, 3).map((e) => e.description);
}

function readyMessage(session: UniversalCreationSession): string {
  const prep = preparationLine(session);
  const plugin = pluginById(session.documentType)!;
  const create = resolveImmediateCreateAction(
    `${session.originalUserText} ${Object.values(session.answers).join(" ")}`,
  );
  const followUp =
    create?.followUpLine.split("\n\n").pop() ??
    `Let's build your ${plugin.label.toLowerCase()} together.`;
  return [prep, "", followUp].join("\n");
}

export function startUniversalCreationTurn(
  userText: string,
  turn: number,
): UniversalCreationTurnResult | null {
  const docType = detectUniversalDocumentType(userText);
  if (!docType) return null;

  const session = buildInitialSession(userText, docType, turn);
  if (hasExecutableDraftContext(session)) {
    return draftArtifactTurn(session);
  }
  if (isUniversalDiscoveryComplete(session.confidence)) {
    return finalizeDiscovery(session);
  }

  // One blocking question only — skip non-critical slots when a draft is possible after one answer.
  const gap = evaluateCreationCriticalGap(session);
  if (gap.blockingQuestion) {
    const plugin = pluginById(docType)!;
    const idx = plugin.discoveryQuestions.findIndex(
      (q) => q.id === gap.blockingQuestionId,
    );
    return {
      kind: "question",
      intro: plugin.intro,
      question: gap.blockingQuestion,
      session: {
        ...session,
        questionIndex: idx >= 0 ? idx : session.questionIndex,
      },
    };
  }

  const next = nextQuestion(session);
  if (!next) return finalizeDiscovery(session);

  const plugin = pluginById(docType)!;
  return {
    kind: "question",
    intro: plugin.intro,
    question: next.question.prompt,
    session: { ...session, questionIndex: next.index },
  };
}

function finalizeDiscovery(
  session: UniversalCreationSession,
): UniversalCreationTurnResult {
  const prep = preparationLine(session);
  const plugin = pluginById(session.documentType)!;
  const readySession: UniversalCreationSession = {
    ...session,
    phase: "guided_creation",
    preparationReady: true,
    pendingEnhancements: plugin.enhancements.map((e) => e.id),
    confidence: computeUniversalDiscoveryConfidence({
      what: true,
      why: true,
      who: true,
      success: true,
    }),
  };
  return {
    kind: "ready",
    message: readyMessage(readySession),
    session: readySession,
    preparationLine: prep,
    guidedCreationHint: guidedCreationHint(plugin.label),
    enhancementOffers: enhancementOffers(readySession),
  };
}

export function advanceUniversalCreation(
  session: UniversalCreationSession,
  userReply: string,
): UniversalCreationTurnResult | null {
  if (UNCERTAINTY_RE.test(userReply)) {
    const plugin = pluginById(session.documentType)!;
    return {
      kind: "uncertainty",
      message: formatUncertaintyMenu(plugin.uncertaintyPaths),
      session,
    };
  }

  // Merge reply into harvest before asking the next slot — retain recipient/purpose.
  const harvested = recomputeSessionFromAnswers(
    session,
    mergeHarvestedAnswers(
      session.documentType,
      userReply,
      session.answers,
      [session.originalUserText, ...Object.values(session.answers)],
    ),
  );
  if (hasExecutableDraftContext(harvested)) {
    return draftArtifactTurn(harvested);
  }

  const gap = evaluateCreationCriticalGap(harvested);
  if (gap.blockingQuestion && gap.blockingQuestionId) {
    // Apply reply to the blocking slot when it matches; else store on current gap.
    const updated = applyAnswer(
      harvested,
      gap.blockingQuestionId,
      userReply,
    );
    const afterHarvest = recomputeSessionFromAnswers(
      updated,
      mergeHarvestedAnswers(
        updated.documentType,
        userReply,
        updated.answers,
        [updated.originalUserText],
      ),
    );
    if (hasExecutableDraftContext(afterHarvest)) {
      return draftArtifactTurn(afterHarvest);
    }
    const nextGap = evaluateCreationCriticalGap(afterHarvest);
    if (nextGap.canDraft) return draftArtifactTurn(afterHarvest);
    if (nextGap.blockingQuestion) {
      const idx = pluginById(afterHarvest.documentType)!.discoveryQuestions.findIndex(
        (q) => q.id === nextGap.blockingQuestionId,
      );
      return {
        kind: "question",
        question: nextGap.blockingQuestion,
        session: {
          ...afterHarvest,
          questionIndex: idx >= 0 ? idx : afterHarvest.questionIndex,
        },
      };
    }
  }

  const next = nextQuestion(harvested);
  if (!next) {
    if (!isUniversalDiscoveryComplete(harvested.confidence)) {
      return finalizeDiscovery({
        ...harvested,
        confidence: computeUniversalDiscoveryConfidence({
          what: true,
          why: true,
          who: true,
          success: true,
        }),
      });
    }
    return finalizeDiscovery(harvested);
  }

  const updated = applyAnswer(harvested, next.question.id, userReply);
  const afterHarvest = recomputeSessionFromAnswers(
    updated,
    mergeHarvestedAnswers(
      updated.documentType,
      userReply,
      updated.answers,
      [updated.originalUserText],
    ),
  );
  if (hasExecutableDraftContext(afterHarvest)) {
    return draftArtifactTurn(afterHarvest);
  }
  if (isUniversalDiscoveryComplete(afterHarvest.confidence)) {
    return finalizeDiscovery(afterHarvest);
  }

  const followingGap = evaluateCreationCriticalGap(afterHarvest);
  if (followingGap.blockingQuestion) {
    const idx = pluginById(afterHarvest.documentType)!.discoveryQuestions.findIndex(
      (q) => q.id === followingGap.blockingQuestionId,
    );
    return {
      kind: "question",
      question: followingGap.blockingQuestion,
      session: {
        ...afterHarvest,
        questionIndex: idx >= 0 ? idx : afterHarvest.questionIndex,
      },
    };
  }

  const following = nextQuestion(afterHarvest);
  if (!following) return finalizeDiscovery(afterHarvest);

  return {
    kind: "question",
    question: following.question.prompt,
    session: { ...afterHarvest, questionIndex: following.index },
  };
}

export function formatUniversalCreationTurnReply(
  turn: UniversalCreationTurnResult,
): string {
  if (turn.kind === "question") {
    return formatUniversalCreationQuestion(turn);
  }
  if (turn.kind === "draft") {
    const isApprovedEmail =
      turn.session.documentType === "email" &&
      (turn.session.phase === "awaiting_action" ||
        Boolean(turn.session.approvedDraft));
    if (isApprovedEmail) {
      return [
        turn.message,
        "",
        turn.draftBody,
        "",
        "Your email is ready. What would you like to do?",
        "",
        "1. Copy Email",
        "2. Create Gmail Draft",
        "3. Send Email",
        "4. Make Changes",
        "5. Save for Later",
      ].join("\n");
    }
    return `${turn.message}\n\n${turn.draftBody}${formatPostDraftReviewPrompt()}`;
  }
  if (
    turn.kind === "ready" ||
    turn.kind === "uncertainty" ||
    turn.kind === "message"
  ) {
    return turn.message;
  }
  return "";
}

export function formatUniversalCreationQuestion(
  turn: Extract<UniversalCreationTurnResult, { kind: "question" }>,
): string {
  const parts: string[] = [];
  if (turn.intro) parts.push(formatShariCreationIntro(turn.intro), "");
  parts.push(formatShariCreationQuestion(turn.question));
  return parts.join("\n");
}

export function resolveUniversalCreationTurn(
  userText: string,
  currentTurn: number,
  lastAssistantText?: string,
): UniversalCreationTurnResult | null {
  const t = userText.trim();
  if (!t) return null;

  let storedSession = loadUniversalCreationSession();
  // Create Foundation (SOP/newsletter/…) — not UC discovery when no live session.
  if (
    !storedSession &&
    resolveCreateFoundationClassification(t).routeDirectlyToCreateFoundation
  ) {
    return null;
  }
  const createRel = classifyCreateTurnRelationship({
    userText: t,
    session: storedSession,
    lastAssistantText,
  });
  if (createRel.shouldExit) {
    exitCreateWorkflow("exited");
    storedSession = null;
  } else if (createRel.shouldPark) {
    parkCreateWorkflow(createRel.reason, currentTurn);
    return null;
  } else if (createRel.shouldResume) {
    resumeCreateWorkflow(createRel.reason);
    storedSession = loadUniversalCreationSession();
  }
  if (!createHandlerEligible(createRel)) {
    return null;
  }

  const requestedType = detectUniversalDocumentType(t);
  const recoveryType = classifyTurnRecovery(t);

  // Artifact-type correction: switch the create session without discovery restart loops.
  // Never treat revision language ("make the tone warmer") as a new document type.
  if (
    storedSession &&
    requestedType &&
    requestedType !== storedSession.documentType &&
    requestedType !== "document" &&
    !isCreateRevisionInstruction(t) &&
    (isExplicitCreationCommand(t) || isSimpleCreateRequest(t)) &&
    shouldRepairOrResumeTask(recoveryType)
  ) {
    clearUniversalCreationSession();
    return startUniversalCreationTurn(t, currentTurn);
  }

  // Active post-discovery / approved artifact — never restart intake on "write".
  if (
    storedSession &&
    isPostDiscoveryCreationPhase(storedSession.phase) &&
    !EXPLICIT_EMAIL_START_OVER_RE.test(t)
  ) {
    const guided = advanceGuidedCreationFlow(
      storedSession,
      t,
      lastAssistantText,
    );
    if (guided) return guided;

    // Keep session alive: create-intent phrases with an approved draft show it.
    if (
      hasUsableApprovedEmailDraft(storedSession) ||
      (storedSession.approvedDraft && storedSession.draftContent?.trim())
    ) {
      const recovered = advanceGuidedCreationFlow(
        {
          ...storedSession,
          phase: "awaiting_action",
          approvedDraft: true,
        },
        t.match(/\bemail\b/i) ? "show the email" : t,
        lastAssistantText,
      );
      if (recovered) return recovered;
    }

    // Mid-flow create verbs must continue the same session, not restart discovery.
    if (
      isSimpleCreateRequest(t) ||
      detectUniversalDocumentType(t) === storedSession.documentType
    ) {
      const continueGuided = advanceGuidedCreationFlow(
        storedSession.phase === "guided_creation" && storedSession.preparationReady
          ? storedSession
          : storedSession,
        storedSession.phase === "guided_creation" ? "yes" : t,
        lastAssistantText ?? "Want me to start the draft now?",
      );
      if (continueGuided) return continueGuided;
    }
  }

  // Active discovery — always continue the same session (never restart on re-assert).
  if (
    storedSession &&
    storedSession.phase === "discovery" &&
    !EXPLICIT_EMAIL_START_OVER_RE.test(t)
  ) {
    const createContext =
      !lastAssistantText?.trim() ||
      isCreateFlowAssistantContext(lastAssistantText) ||
      isUniversalCreationMessage(lastAssistantText) ||
      isGuidedCreationAssistantContext(lastAssistantText) ||
      isSimpleCreateRequest(t) ||
      detectUniversalDocumentType(t) === storedSession.documentType;
    if (createContext) {
      return advanceUniversalCreation(storedSession, t);
    }
  }

  if (storedSession && isBareGenericAcceptance(t) && lastAssistantText?.trim()) {
    const recentTopic = inferMeaningTopicFromAssistant(lastAssistantText);
    if (
      isCreateFlowAssistantContext(lastAssistantText) ||
      isUniversalCreationMessage(lastAssistantText) ||
      isGuidedCreationAssistantContext(lastAssistantText) ||
      assistantOfferedConsent(lastAssistantText) ||
      recentTopic === "create"
    ) {
      if (isPostDiscoveryCreationPhase(storedSession.phase)) {
        const guided = advanceGuidedCreationFlow(
          storedSession,
          t,
          lastAssistantText,
        );
        if (guided) return guided;
      }
      return advanceUniversalCreation(storedSession, t);
    }
  }

  if (
    lastAssistantText &&
    (isCreateFlowAssistantContext(lastAssistantText) ||
      isUniversalCreationMessage(lastAssistantText) ||
      isGuidedCreationAssistantContext(lastAssistantText))
  ) {
    if (storedSession) {
      if (isPostDiscoveryCreationPhase(storedSession.phase)) {
        const guided = advanceGuidedCreationFlow(
          storedSession,
          t,
          lastAssistantText,
        );
        if (guided) return guided;
      }
      return advanceUniversalCreation(storedSession, t);
    }
  }

  if (!shouldEnterUniversalCreation(t) && !detectUniversalDocumentType(t)) {
    return null;
  }
  if (isProjectCreationIntent(t)) return null;

  // Don't start a second email intake while an approved draft is still live.
  if (
    storedSession &&
    hasUsableApprovedEmailDraft(storedSession) &&
    !EXPLICIT_EMAIL_START_OVER_RE.test(t)
  ) {
    const guided = advanceGuidedCreationFlow(
      { ...storedSession, phase: "awaiting_action", approvedDraft: true },
      t,
      lastAssistantText,
    );
    if (guided) return guided;
  }

  // Live discovery session + create re-assert → continue, never restart intake.
  if (
    storedSession &&
    storedSession.phase === "discovery" &&
    !EXPLICIT_EMAIL_START_OVER_RE.test(t) &&
    (isSimpleCreateRequest(t) ||
      detectUniversalDocumentType(t) === storedSession.documentType)
  ) {
    return advanceUniversalCreation(storedSession, t);
  }

  if (isSimpleCreateRequest(t)) {
    logCreateFastPath({
      turn: currentTurn,
      userText: t,
      documentType: detectUniversalDocumentType(t),
    });
  }

  try {
    return startUniversalCreationTurn(t, currentTurn);
  } catch {
    const docType = detectUniversalDocumentType(t);
    const plugin = docType ? pluginById(docType) : null;
    const session = docType
      ? buildInitialSession(t, docType, currentTurn)
      : null;
    return {
      kind: "question",
      intro: createFastPathRecoveryLine(t),
      question: plugin?.discoveryQuestions[0]?.prompt ?? "What should we build first?",
      session:
        session ??
        buildInitialSession(t, docType ?? "document", currentTurn),
    };
  }
}

export function universalCreationHint(
  session: UniversalCreationSession,
  turn: UniversalCreationTurnResult,
): string {
  const plugin = pluginById(session.documentType)!;
  if (turn.kind === "question" || turn.kind === "uncertainty") {
    return (
      `UNIVERSAL CREATION — Discovery (${plugin.label}): ` +
      `Confidence=${session.confidence.score}% · Ask ONE question · never a form. ` +
      "If member is uncertain → teach, recommend, examples, or research."
    );
  }
  if (turn.kind === "draft") {
    return (
      `UNIVERSAL CREATION — Draft (${plugin.label}): ` +
      "Draft is in chat · ask permission before revisions · member owns approval."
    );
  }
  if (turn.kind === "message") {
    return (
      `UNIVERSAL CREATION — Guided (${plugin.label}): ` +
      "Continue conversationally · one step at a time."
    );
  }
  return (
    `UNIVERSAL CREATION — Ready (${plugin.label}): ` +
    `${turn.guidedCreationHint} Enhancements available: ${turn.enhancementOffers.join("; ")}`
  );
}
