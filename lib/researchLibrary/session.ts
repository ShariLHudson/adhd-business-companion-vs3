import { getLiveResearchProviderStatus } from "@/lib/universalRequestOutcome";
import type { ResearchMode, ResearchSession } from "./types";

function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function inferResearchMode(input: {
  text: string;
  intendedOutcome: string | null;
  hasSelectedContext?: boolean;
}): ResearchMode {
  const t = input.text.toLowerCase();
  if (input.hasSelectedContext) return "selected_context_research";
  if (input.intendedOutcome) return "research_with_outcome";
  if (/\bcompare|versus|vs\.?\b/.test(t)) return "comparison";
  if (/\bcurrent|latest|today|202[4-9]|this year\b/.test(t)) {
    return "current_information";
  }
  if (/\b(what|how|why|when|where)\b/.test(t) && t.length < 120) {
    return "focused_question";
  }
  return "open_exploration";
}

export function extractIntendedOutcome(text: string): string | null {
  const t = text.trim();
  const patterns = [
    /\band\s+(create|build|make|draft|write|turn(?:\s+this)?\s+into|show)\s+(.+)$/i,
    /\bthen\s+(create|build|make|draft)\s+(.+)$/i,
    /\band\s+(create|build)\s+a\s+(.+)$/i,
  ];
  for (const p of patterns) {
    const m = t.match(p);
    if (m) {
      const verb = (m[1] || "create").toLowerCase();
      const rest = (m[2] || "").trim();
      if (rest.length > 2) return `${verb} ${rest}`.slice(0, 200);
    }
  }
  if (
    /\b(create|build|make|draft)\s+(a\s+)?(plan|guide|list|document|form|project|strategy|map|checklist)/i.test(
      t,
    )
  ) {
    const m = t.match(
      /\b((?:create|build|make|draft)\s+(?:a\s+)?(?:\w[\w\s-]{2,80}))/i,
    );
    if (m) return m[1].trim();
  }
  return null;
}

export function extractPrimaryTopic(text: string): string {
  let t = text.trim();
  t = t.replace(
    /^(please\s+)?(research|help me (understand|research|learn about)|tell me about|i want to (understand|learn about)|i'?d like to (understand|learn about))\s+/i,
    "",
  );
  t = t.replace(
    /\s+and\s+(create|build|make|draft|write|turn|show).+$/i,
    "",
  );
  t = t.replace(/[.?!]+$/, "").trim();
  return t.slice(0, 120) || "Research";
}

export function createResearchSession(input: {
  text: string;
  sourceExperience?: string | null;
  sourceEntityId?: string | null;
  sourceSelectionIds?: string[];
  knownUserContext?: string | null;
  relevantEstateContext?: string | null;
}): ResearchSession {
  const now = new Date().toISOString();
  const intendedOutcome = extractIntendedOutcome(input.text);
  const primaryTopic = extractPrimaryTopic(input.text);
  const live = getLiveResearchProviderStatus();
  const mode = inferResearchMode({
    text: input.text,
    intendedOutcome,
    hasSelectedContext: Boolean(input.sourceSelectionIds?.length),
  });

  return {
    id: newId("rs"),
    title: primaryTopic,
    primaryTopic,
    currentQuestion: input.text.trim(),
    purpose: intendedOutcome
      ? `Research ${primaryTopic} to ${intendedOutcome}`
      : `Understand ${primaryTopic}`,
    intendedOutcome,
    sourceExperience: input.sourceExperience ?? null,
    sourceEntityId: input.sourceEntityId ?? null,
    sourceSelectionIds: input.sourceSelectionIds ?? [],
    conversationId: newId("rcnv"),
    conversationTurns: [],
    currentResearchCollectionId: null,
    researchMode: mode,
    currentStatus: "conversing",
    currentInformationRequired:
      mode === "current_information" ||
      /\bcurrent|latest|today\b/i.test(input.text),
    liveResearchAvailable: live.liveResearchAvailable,
    currentResearchStatus: live.liveResearchAvailable
      ? "current_research_in_progress"
      : "stable_knowledge_used",
    knownUserContext: input.knownUserContext ?? null,
    relevantEstateContext: input.relevantEstateContext ?? null,
    activeQuestionIds: [],
    resolvedQuestionIds: [],
    unresolvedQuestionIds: [],
    lastUsefulSummary: null,
    nextSuggestedInquiry: null,
    createdAt: now,
    updatedAt: now,
    lastOpenedAt: now,
  };
}

