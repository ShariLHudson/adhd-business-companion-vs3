/**
 * Phase menus — review, revision, approval, completion.
 */

import type {
  UniversalApprovalChoice,
  UniversalCompletionAction,
  UniversalDocumentPlugin,
  UniversalReviewChoice,
} from "./types";
import { formatSparkEstateOutputMenu } from "./sparkEstateCompletionSystem";
import { inferCreationArchetype } from "./sparkEstateCreationJourney";

export const REVIEW_MENU_INTRO =
  "I have a draft ready.\n\nHow would you like to review it?";

export function formatReviewMenu(): string {
  return [
    REVIEW_MENU_INTRO,
    "",
    "1. Show the complete document",
    "2. Review section by section",
    "3. Make changes",
    "4. Summarize first",
  ].join("\n");
}

export function parseReviewChoice(reply: string): UniversalReviewChoice | null {
  const t = reply.trim().toLowerCase();
  if (/^1$|complete|full document|show all/i.test(t)) return "show_complete";
  if (/^2$|section|part by part/i.test(t)) return "section_by_section";
  if (/^3$|change|edit|revise/i.test(t)) return "make_changes";
  if (/^4$|summar/i.test(t)) return "summarize_first";
  return null;
}

export const APPROVAL_PROMPT = "Does this feel ready?";

export function formatApprovalMenu(): string {
  return [
    APPROVAL_PROMPT,
    "",
    "1. Yes — it's ready",
    "2. One more change",
    "3. Continue working later",
  ].join("\n");
}

export function parseApprovalChoice(
  reply: string,
): UniversalApprovalChoice | null {
  const t = reply.trim().toLowerCase();
  if (/^1$|yes|ready|looks good|good to go/i.test(t)) return "yes_ready";
  if (/^2$|one more|another change|tweak/i.test(t)) return "one_more_change";
  if (/^3$|later|save for|come back/i.test(t)) return "continue_later";
  return null;
}

export function formatCompletionMenu(
  plugin: UniversalDocumentPlugin,
  adaptiveHints: string[] = [],
): string {
  const menu = formatSparkEstateOutputMenu({
    archetype: inferCreationArchetype({ documentType: plugin.id }),
    pluginActions: plugin.completionActions,
  });
  if (adaptiveHints.length === 0) return menu;
  return `${menu}\n\n${adaptiveHints.join("\n")}`;
}

export function formatUncertaintyMenu(paths: readonly string[]): string {
  const options: string[] = [];
  if (paths.includes("recommend")) options.push("I can recommend a direction");
  if (paths.includes("teach")) options.push("I can explain how this usually works");
  if (paths.includes("examples")) options.push("I can show a few examples");
  if (paths.includes("research")) {
    options.push("I can research current best practices");
  }
  const numbered = options.map((o, i) => `${i + 1}. ${o}`);
  return [
    "That's okay — we don't have to know everything upfront.",
    "",
    ...numbered,
    "",
    "Which would help most?",
  ].join("\n");
}

export function guidedCreationHint(pluginLabel: string): string {
  return (
    `UNIVERSAL CREATION — Guided Creation (${pluginLabel}): ` +
    "Conversation IS the interface. Ask intelligent questions, write while listening, " +
    "organize automatically, research when needed, suggest improvements naturally. " +
    "Never form-like. Member collaborates — not filling software."
  );
}
