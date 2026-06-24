/**
 * P0.15 — Menu Continuation Intelligence™
 * Numbered teaching/knowledge menus must continue on 1–4 picks, not re-route as new turns.
 */

import { extractKnowledgeTopic } from "./knowledgeIntelligence";
import type { IntentRoutingDecision } from "./intentRoutingIntelligence";
import {
  isLearningPathMenuOffer,
  LEARNING_PATH_MENU_OPTIONS,
  learningPathHintForSelection,
  mapMenuLineLabelToKey,
  type LearningPathOptionKey,
} from "./learningPathMenu";
import { parseOptionSelection } from "./workspaceSop";
import {
  extractTeachingTopic,
  teachingModeHintForChat,
} from "./teachingMode";

export type MenuOptionKey = LearningPathOptionKey;

export type PendingMenuSelection = {
  type: "knowledge_menu";
  topic: string;
  options: Record<string, MenuOptionKey>;
  offeredAtTurn?: number;
};

/** @deprecated Use LEARNING_PATH_MENU_OPTIONS */
export const STANDARD_KNOWLEDGE_MENU_OPTIONS = LEARNING_PATH_MENU_OPTIONS;

const PENDING_MENU_KEY = "companion-pending-menu-selection-v1";

const MENU_PATH_LINE_RE =
  /^\s*\d+\.\s*(.+)$/gm;

const RELATIONSHIP_OPENER_FORBIDDEN =
  "FORBIDDEN on this turn: I've noticed…, It sounds like…, You seem to…, You're looking to…, This pattern indicates…, relationship observations, ADHD pattern analysis, or user-history reflection.";

export function detectStructuredTeachingMenu(
  assistantText: string,
): PendingMenuSelection | null {
  const t = assistantText.trim();
  if (!t || !isLearningPathMenuOffer(t)) return null;

  const lines = [...t.matchAll(MENU_PATH_LINE_RE)].map((m) => m[1]!.trim());
  if (lines.length < 3) return null;

  const options: Record<string, MenuOptionKey> = {};
  for (let i = 0; i < Math.min(4, lines.length); i++) {
    const key =
      mapMenuLineLabelToKey(lines[i]!) ??
      LEARNING_PATH_MENU_OPTIONS[String(i + 1)];
    if (key) options[String(i + 1)] = key;
  }
  if (Object.keys(options).length < 3) return null;

  return {
    type: "knowledge_menu",
    topic: "",
    options,
  };
}

export function loadPendingMenuSelection(): PendingMenuSelection | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_MENU_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingMenuSelection;
    if (parsed?.type !== "knowledge_menu" || !parsed.options) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePendingMenuSelection(pending: PendingMenuSelection): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_MENU_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function clearPendingMenuSelection(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_MENU_KEY);
  } catch {
    /* ignore */
  }
}

export function logMenuContinuation(
  event: string,
  detail: Record<string, string | number | boolean | undefined>,
): void {
  if (process.env.NODE_ENV === "production") return;
  // eslint-disable-next-line no-console
  console.info("[menu-continuation]", event, detail);
}

function parseMenuSelectionIndex(
  userText: string,
  optionCount: number,
): number | null {
  const fromSop = parseOptionSelection(userText, optionCount);
  if (fromSop !== null) return fromSop;

  const t = userText.trim().toLowerCase();
  const wordMap: Record<string, number> = {
    one: 0,
    two: 1,
    three: 2,
    four: 3,
    fourth: 3,
  };
  for (const [word, idx] of Object.entries(wordMap)) {
    if (idx >= optionCount) continue;
    if (new RegExp(`\\b${word}\\b`).test(t)) return idx;
  }
  if (/\bdeep dive\b/.test(t) && optionCount >= 4) return 3;
  return null;
}

export function isMenuSelectionInput(
  userText: string,
  lastAssistantText: string,
): boolean {
  const menu = detectStructuredTeachingMenu(lastAssistantText);
  if (!menu) return false;
  const optionCount = Object.keys(menu.options).length;
  return parseMenuSelectionIndex(userText, optionCount) !== null;
}

export function extractMenuTopicFromContext(
  lastAssistantText: string,
  priorUserText?: string,
): string {
  if (priorUserText?.trim()) {
    const knowledge = extractKnowledgeTopic(priorUserText);
    if (knowledge) return knowledge;
    const teaching = extractTeachingTopic(priorUserText);
    if (teaching) return teaching;
  }
  const intro = lastAssistantText.split(/\n\nWould you like/i)[0]?.trim();
  if (intro && intro.length <= 120) {
    const whatIs = intro.match(/\bwhat(?:'s| is| are)\s+(?:a |an |the )?(.+?)[.?!\n]/i);
    if (whatIs?.[1]) return whatIs[1].trim();
  }
  return "this topic";
}

export function registerPendingMenuFromAssistant(
  assistantText: string,
  priorUserText?: string,
  offeredAtTurn?: number,
): PendingMenuSelection | null {
  const detected = detectStructuredTeachingMenu(assistantText);
  if (!detected) return null;
  const pending: PendingMenuSelection = {
    ...detected,
    topic: extractMenuTopicFromContext(assistantText, priorUserText),
    offeredAtTurn,
  };
  savePendingMenuSelection(pending);
  logMenuContinuation("registered", {
    topic: pending.topic,
    optionCount: Object.keys(pending.options).length,
  });
  return pending;
}

export type MenuContinuationResolution = {
  active: boolean;
  pending: PendingMenuSelection | null;
  selectedIndex: number | null;
  selectedOption: MenuOptionKey | null;
  selectedLabel: string | null;
};

export function resolveMenuContinuation(input: {
  userText: string;
  lastAssistantText: string;
  priorUserText?: string;
  pending?: PendingMenuSelection | null;
}): MenuContinuationResolution {
  const none: MenuContinuationResolution = {
    active: false,
    pending: null,
    selectedIndex: null,
    selectedOption: null,
    selectedLabel: null,
  };

  const menuFromAssistant = detectStructuredTeachingMenu(input.lastAssistantText);
  const pending =
    menuFromAssistant
      ? {
          ...menuFromAssistant,
          topic: extractMenuTopicFromContext(
            input.lastAssistantText,
            input.priorUserText,
          ),
          offeredAtTurn: input.pending?.offeredAtTurn,
        }
      : input.pending ?? loadPendingMenuSelection();

  if (!pending) return none;

  const optionCount = Object.keys(pending.options).length;
  const selectedIndex = parseMenuSelectionIndex(input.userText, optionCount);
  if (selectedIndex === null) return none;

  const selectedKey = String(selectedIndex + 1);
  const selectedOption = pending.options[selectedKey] ?? null;
  if (!selectedOption) return none;

  const labels = [...input.lastAssistantText.matchAll(MENU_PATH_LINE_RE)].map(
    (m) => m[1]!.trim(),
  );
  const selectedLabel = labels[selectedIndex] ?? selectedOption;

  logMenuContinuation("selection", {
    topic: pending.topic,
    selectedIndex,
    selectedOption,
    userText: input.userText,
  });

  return {
    active: true,
    pending,
    selectedIndex,
    selectedOption,
    selectedLabel,
  };
}

export function applyMenuContinuationRoutingOverrides(
  decision: IntentRoutingDecision,
): IntentRoutingDecision {
  return {
    ...decision,
    category: decision.category === "learn" ? "learn" : decision.category,
    suppressRelationshipIntelligence: true,
    suppressRelationshipLead: true,
    suppressReflectionFirst: true,
    suppressConversationSummary: true,
    suppressWisdomIntelligence: true,
    suppressTransformationIntelligence: true,
    suppressObservationEngine: true,
    learnFastPath: false,
  };
}

export function menuContinuationHintForChat(
  resolution: MenuContinuationResolution,
  userText: string,
  lastAssistantText: string,
): string {
  const topic = resolution.pending?.topic ?? "this topic";
  const pathLabel = resolution.selectedLabel ?? resolution.selectedOption ?? "chosen path";
  const pathHint = resolution.selectedOption
    ? learningPathHintForSelection(resolution.selectedOption, topic)
    : teachingModeHintForChat(userText, lastAssistantText);

  return [
    "MENU CONTINUATION INTELLIGENCE™ (P0.15 — mandatory):",
    `User is selecting menu option for **${topic}** — NOT a new topic.`,
    `Selected path: ${pathLabel}.`,
    "Continue the menu workflow only. Do NOT reinterpret this as a new conversation turn.",
    RELATIONSHIP_OPENER_FORBIDDEN,
    "Do NOT re-offer the 1–4 menu unless they ask to switch paths.",
    pathHint,
  ].join("\n");
}

export function shouldSuppressIntelligenceForMenuContinuation(
  resolution: MenuContinuationResolution,
): boolean {
  return resolution.active;
}
