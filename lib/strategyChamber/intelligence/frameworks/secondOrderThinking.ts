import type { StrategyWorkItem } from "../../types";

/** One or two second-order effects — never a long chain. */
export function suggestSecondOrderEffects(item: StrategyWorkItem): string[] {
  const q = (item.decisionStatement || "").toLowerCase();
  const effects: string[] = [];
  if (/\bprice|pricing|fee\b/.test(q)) {
    effects.push(
      "If the price rises, member expectations about value and support may rise with it.",
    );
  }
  if (/\bhire|hiring|team\b/.test(q)) {
    effects.push(
      "If help arrives, new management and communication needs usually appear.",
    );
  }
  if (/\bgrow|more customers|scale\b/.test(q)) {
    effects.push(
      "If demand rises, delivery capacity may become the next constraint.",
    );
  }
  if (/\bnarrow|niche|focus\b/.test(q)) {
    effects.push(
      "If the audience narrows, messaging may get easier while some opportunities feel farther away.",
    );
  }
  if (effects.length === 0 && item.chosenDirection?.trim()) {
    effects.push(
      "If this direction works, a new constraint may appear — capacity, messaging, or follow-through.",
    );
  }
  return effects.slice(0, 2);
}
