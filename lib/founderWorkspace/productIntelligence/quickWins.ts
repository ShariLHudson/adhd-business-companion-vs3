import type { AggregatedSignal, QuickWin } from "./types";

const QUICK_WIN_HINTS: { re: RegExp; title: string; rationale: string }[] = [
  {
    re: /\b(label|rename|button)\b/i,
    title: "Rename or clarify button label",
    rationale: "Wording mismatch is driving repeated confusion.",
  },
  {
    re: /\b(helper text|tooltip|hint|instruction)\b/i,
    title: "Add helper text at point of confusion",
    rationale: "Users need inline guidance, not a workflow change.",
  },
  {
    re: /\b(where did|where is|find my)\b/i,
    title: "Add confirmation after save",
    rationale: "Users cannot tell where content went — a success message helps.",
  },
  {
    re: /\b(confus|unclear)\b/i,
    title: "Improve workflow wording",
    rationale: "Clarify the next step in copy, not architecture.",
  },
  {
    re: /\b(google doc|export)\b/i,
    title: "Clarify Google Docs export path",
    rationale: "Short copy explaining what happens after export.",
  },
];

export function identifyQuickWins(
  frustrations: AggregatedSignal[],
): QuickWin[] {
  const wins: QuickWin[] = [];

  for (const signal of frustrations) {
    if (signal.count < 1) continue;
    const hint = QUICK_WIN_HINTS.find((h) => h.re.test(signal.text));
    if (!hint) continue;

    wins.push({
      id: `qw-${signal.key}`,
      title: hint.title,
      rationale: `${hint.rationale} (“${signal.text.slice(0, 80)}” ×${signal.count})`,
      category: signal.category,
      relatedSignalKey: signal.key,
      estimatedEffort: "low",
    });
  }

  const seen = new Set<string>();
  return wins
    .filter((w) => {
      if (seen.has(w.title)) return false;
      seen.add(w.title);
      return true;
    })
    .slice(0, 6);
}
