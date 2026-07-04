import {
  detectMentalLoadSignals,
  isHighMentalLoadTurn,
} from "./mentalLoadSignals";
import type { MakeItLighterDecision } from "./types";

export function evaluateMakeItLighter(input: {
  userText: string;
  overwhelmed?: boolean;
}): MakeItLighterDecision {
  const signals = detectMentalLoadSignals(input.userText);
  const active = isHighMentalLoadTurn(input.userText, input.overwhelmed);

  return {
    active,
    signals,
    reason: active
      ? signals.length > 0
        ? `mental load: ${signals.join(", ")}`
        : "overwhelmed context"
      : "no elevated load signal",
  };
}
