/**
 * Member-facing "My Thinking So Far" — only meaningful sections, plain language.
 */

import type { StrategyWorkItem } from "./types";

export type ThinkingSummarySection = {
  id: string;
  label: string;
  body: string | string[];
};

function sameText(a?: string | null, b?: string | null): boolean {
  return Boolean(a?.trim() && b?.trim() && a.trim() === b.trim());
}

export function buildThinkingSummary(
  item: StrategyWorkItem,
): ThinkingSummarySection[] {
  const sections: ThinkingSummarySection[] = [];
  const question = item.decisionStatement?.trim();
  if (question) {
    sections.push({
      id: "thinking_through",
      label: "What we are thinking through",
      body: question,
    });
  }

  const reality = item.currentReality?.trim();
  if (reality && !sameText(reality, question)) {
    sections.push({
      id: "happening",
      label: "What seems to be happening",
      body: reality,
    });
  }

  const told = (item.memberStatements ?? []).filter(
    (s) => s.trim() && !sameText(s, question) && !sameText(s, reality),
  );
  if (told.length) {
    sections.push({
      id: "told_me",
      label: "What you have told me",
      body: told,
    });
  }

  const known = [
    ...(item.knownFacts ?? []),
    ...(item.observations ?? []),
  ].filter((s) => s.trim() && !sameText(s, question) && !sameText(s, reality));
  if (known.length) {
    sections.push({
      id: "known",
      label: "What is known",
      body: known,
    });
  }

  if (item.assumptions?.length) {
    sections.push({
      id: "assumptions",
      label: "What may be an assumption",
      body: item.assumptions,
    });
  }

  if (item.optionsConsidered?.length) {
    sections.push({
      id: "options",
      label: "Options beginning to emerge",
      body: item.optionsConsidered.map((o) => o.title),
    });
  }

  const open: string[] = [];
  if (!reality || sameText(reality, question)) {
    open.push("What is happening in the current situation");
  }
  if (!item.optionsConsidered?.length && (item.memberStatements?.length ?? 0) >= 1) {
    open.push("Which directions are worth exploring");
  }
  if (item.optionsConsidered?.length && !item.chosenDirection?.trim()) {
    open.push("Whether one direction feels strong enough to choose");
  }
  if (open.length) {
    sections.push({
      id: "open",
      label: "Questions still open",
      body: open,
    });
  }

  const next =
    item.activeQuestion?.trim() ||
    (item.chosenDirection?.trim()
      ? "Confirm the summary, then choose one helpful next step"
      : "Answer the next question when you are ready");
  sections.push({
    id: "next",
    label: "What may help next",
    body: next,
  });

  return sections;
}
