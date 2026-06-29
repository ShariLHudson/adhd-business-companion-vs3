/**
 * Cognitive load score — reduce before asking the user to think harder.
 */

import { levelForScore } from "@/lib/cognitive-load/loadScoring";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";

import type { EFCognitiveLoadScore, ExecutiveFunctionState } from "./types";

export function scoreCognitiveLoad(input: {
  state: ExecutiveFunctionState;
  message: string;
  openLoopCount?: number;
  externalLevel?: CognitiveLoadLevel | null;
}): EFCognitiveLoadScore {
  const drivers: string[] = [];
  let value = 20;

  const bump = (points: number, reason: string) => {
    value += points;
    drivers.push(reason);
  };

  switch (input.state.primary) {
    case "overwhelm":
      bump(35, "Feeling overwhelmed");
      break;
    case "task_paralysis":
      bump(28, "Hard to start");
      break;
    case "decision_fatigue":
      bump(25, "Too many decisions");
      break;
    case "avoidance":
      bump(22, "Avoidance pattern");
      break;
    case "low_energy":
      bump(30, "Low energy");
      break;
    case "uncertainty":
      bump(18, "Uncertainty");
      break;
    default:
      break;
  }

  for (const s of input.state.secondary) {
    if (s === "decision_fatigue") bump(10, "Decision load");
    if (s === "overwhelm") bump(8, "Additional overwhelm");
  }

  const loops = input.openLoopCount ?? 0;
  if (loops >= 5) bump(15, "Many open loops");
  else if (loops >= 2) bump(8, "Open loops present");

  if (/\b(and also|plus|another thing|three things|five things)\b/i.test(input.message)) {
    bump(10, "Multiple asks in one message");
  }

  if (input.externalLevel) {
    const externalMap: Record<CognitiveLoadLevel, number> = {
      light: 15,
      moderate: 35,
      heavy: 60,
      overloaded: 85,
    };
    value = Math.max(value, externalMap[input.externalLevel]);
    drivers.push(`Ecosystem load: ${input.externalLevel}`);
  }

  value = Math.min(100, Math.max(0, value));
  const level = levelForScore(value);

  return {
    value,
    level,
    drivers,
    reduceBeforeAsking: value >= 50 || input.state.needsSimplification,
  };
}
