/**
 * Universal Creation orchestrator — Discover → Prepare → Create → …
 */

import { isRegistryArtifactExecution } from "@/lib/artifactRegistry";
import { resolveImmediateCreateAction } from "@/lib/createExperience/createExperienceRouting";
import { isProjectCreationIntent } from "@/lib/createExperience/createExperienceRouting";
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

const STORAGE_KEY = "universal-creation-session-v1";

let memoryUniversalCreationSession: UniversalCreationSession | null = null;

const EXPLICIT_ROOM_NAV_RE =
  /\b(?:take me to|bring me to|go to|open|show me|step into)\b/i;

const UNCERTAINTY_RE =
  /\b(?:i don'?t know|not sure|no idea|you decide|whatever works|haven'?t figured|unsure)\b/i;

const CREATION_MARKER_RE =
  /let me understand what you'?re trying|what would success look like|who is this for|main reason you'?re creating|who is the workshop for|transformation do you want|how long will the workshop|a couple of quick questions first|one question at a time|(?:map|bottom of) (?:a |this )?funnel|offer sits at the bottom/i;

export function detectUniversalDocumentType(
  userText: string,
): UniversalDocumentType | null {
  const t = userText.trim();
  if (!t) return null;
  for (const plugin of UNIVERSAL_DOCUMENT_PLUGINS) {
    if (plugin.id === "document") continue;
    if (plugin.detectPatterns.some((re) => re.test(t))) return plugin.id;
  }
  if (isRegistryArtifactExecution(t)) return "document";
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

export function isUniversalCreationMessage(text: string): boolean {
  return CREATION_MARKER_RE.test(text);
}

export function saveUniversalCreationSession(
  session: UniversalCreationSession | null,
): void {
  memoryUniversalCreationSession = session;
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  if (isConversationSessionSpineEnabled()) {
    syncUniversalCreationToSession(session);
  }
}

export function loadUniversalCreationSession(): UniversalCreationSession | null {
  if (memoryUniversalCreationSession) return memoryUniversalCreationSession;
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UniversalCreationSession;
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

function buildInitialSession(
  userText: string,
  documentType: UniversalDocumentType,
  turn: number,
): UniversalCreationSession {
  const plugin = pluginById(documentType)!;
  const memoryPrefill = prefillDiscoveryFromAdaptiveMemory("create_sop");
  const extracted = extractPrefilledAnswers(userText, plugin);
  const answers = { ...memoryPrefill, ...extracted };
  const flags = initialFlags(userText, plugin);
  for (const q of plugin.discoveryQuestions) {
    if (answers[q.id]) flags[q.slot] = true;
  }
  let questionIndex = 0;
  while (
    questionIndex < plugin.discoveryQuestions.length &&
    answers[plugin.discoveryQuestions[questionIndex]!.id]
  ) {
    questionIndex += 1;
  }
  return {
    documentType,
    phase: "discovery",
    confidence: computeUniversalDiscoveryConfidence(flags),
    answers,
    questionIndex,
    originalUserText: userText,
    startedAtTurn: turn,
    preparationReady: false,
    pendingEnhancements: [],
  };
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
  if (isUniversalDiscoveryComplete(session.confidence)) {
    return finalizeDiscovery(session);
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

  const next = nextQuestion(session);
  if (!next) {
    if (!isUniversalDiscoveryComplete(session.confidence)) {
      session = {
        ...session,
        confidence: computeUniversalDiscoveryConfidence({
          what: true,
          why: true,
          who: true,
          success: true,
        }),
      };
    }
    return finalizeDiscovery(session);
  }

  const updated = applyAnswer(session, next.question.id, userReply);
  if (isUniversalDiscoveryComplete(updated.confidence)) {
    return finalizeDiscovery(updated);
  }

  const following = nextQuestion(updated);
  if (!following) return finalizeDiscovery(updated);

  return {
    kind: "question",
    question: following.question.prompt,
    session: { ...updated, questionIndex: following.index },
  };
}

export function formatUniversalCreationTurnReply(
  turn: UniversalCreationTurnResult,
): string {
  if (turn.kind === "question") {
    return formatUniversalCreationQuestion(turn);
  }
  if (turn.kind === "draft") {
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

  const storedSession = loadUniversalCreationSession();
  if (storedSession && isBareGenericAcceptance(t) && lastAssistantText?.trim()) {
    const recentTopic = inferMeaningTopicFromAssistant(lastAssistantText);
    if (
      isUniversalCreationMessage(lastAssistantText) ||
      assistantOfferedConsent(lastAssistantText) ||
      recentTopic === "create"
    ) {
      return advanceUniversalCreation(storedSession, t);
    }
  }

  if (lastAssistantText && isUniversalCreationMessage(lastAssistantText)) {
    if (storedSession) return advanceUniversalCreation(storedSession, t);
  }

  if (!shouldEnterUniversalCreation(t) && !detectUniversalDocumentType(t)) {
    return null;
  }
  if (isProjectCreationIntent(t)) return null;

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
