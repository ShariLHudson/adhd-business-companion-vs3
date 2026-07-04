import {
  detectFocusSituation,
  detectFrictionDomain,
  isFrictionFirstTurn,
} from "./struggleSignals";
import type { FrictionFirstDecision } from "./types";

export function evaluateFrictionFirst(userText: string): FrictionFirstDecision {
  const text = userText.trim();
  if (!isFrictionFirstTurn(text)) {
    return {
      active: false,
      domain: "general",
      focusSituation: "unknown",
      reason: "no struggle signal",
    };
  }

  return {
    active: true,
    domain: detectFrictionDomain(text),
    focusSituation: detectFocusSituation(text),
    reason: "member expressed difficulty — diagnose friction first",
  };
}
