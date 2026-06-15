/**
 * Day designer messages — short questions, gentle tips, no pressure.
 */

import type { DayLevel } from "@/lib/companionStore";
import { evaluateEnvironment } from "@/lib/environment-intelligence/environmentEngine";
import { environmentTipForPlan } from "@/lib/environment-intelligence/environmentInsights";
import {
  effectiveEnergy,
  hasActiveLoop,
  isOverloaded,
  isStuckOrFrozen,
} from "./daySignals";
import type {
  DayDesignerAnswers,
  DayDesignerContext,
  DayDesignerSession,
  DayDesignerStep,
  SuggestedDayBlock,
} from "./types";

export const DAY_DESIGNER_TRIGGER_RE =
  /\b(help me plan my day|plan my day|design my day|map out today|what should today look like)\b/i;

export const DAY_DESIGNER_QUESTIONS: Record<
  Exclude<DayDesignerStep, "idle" | "complete">,
  string
> = {
  time: "How much time do you realistically have today?",
  energy: "How's your energy right now — low, medium, or high?",
  environment: "What environment are you in? (quiet home, noisy home, office, coffee shop, on the go)",
  priorities: "What has to get done today? (A short list is fine)",
};

const ADHD_TIP_POOL = [
  "Use a 10-minute starter timer.",
  "Put the phone in another room.",
  "Keep only one tab open.",
  "Start with bullet points, not a finished draft.",
  "Park new ideas instead of chasing them.",
  "Body-double for the first block if you can.",
  "Set a visible finish line — one pass, then pause.",
  "Open only the files you need for the first step.",
];

export function shouldStartDayDesigner(text: string): boolean {
  return DAY_DESIGNER_TRIGGER_RE.test(text.trim());
}

export function startDayDesignerSession(now = new Date()): DayDesignerSession {
  return {
    step: "time",
    answers: {},
    startedAt: now.toISOString(),
  };
}

export function questionForStep(
  step: Exclude<DayDesignerStep, "idle" | "complete">,
): string {
  return DAY_DESIGNER_QUESTIONS[step];
}

export function advanceDayDesignerSession(
  session: DayDesignerSession,
  answerText: string,
): DayDesignerSession {
  const text = answerText.trim();
  const answers = { ...session.answers };

  if (session.step === "time") {
    const minutes = parseMinutes(text);
    if (minutes) answers.availableMinutes = minutes;
    return { ...session, step: "energy", answers };
  }
  if (session.step === "energy") {
    const energy = parseEnergy(text);
    if (energy) answers.energy = energy;
    return { ...session, step: "environment", answers };
  }
  if (session.step === "environment") {
    const env = parseEnvironment(text);
    if (env) answers.environment = env;
    return { ...session, step: "priorities", answers };
  }
  if (session.step === "priorities") {
    if (text) answers.mustDoToday = text;
    return { ...session, step: "complete", answers };
  }
  return session;
}

function parseMinutes(text: string): number | undefined {
  const hours = text.match(/(\d+)\s*h/i);
  if (hours) return Math.min(480, parseInt(hours[1]!, 10) * 60);
  const mins = text.match(/(\d+)\s*m/i);
  if (mins) return Math.min(480, parseInt(mins[1]!, 10));
  const num = text.match(/\b(\d+)\b/);
  if (!num) return undefined;
  const n = parseInt(num[1]!, 10);
  return n <= 12 ? n * 60 : n;
}

function parseEnergy(text: string): DayLevel | undefined {
  const t = text.toLowerCase();
  if (/\b(low|tired|exhausted|drained)\b/.test(t)) return "low";
  if (/\b(high|great|good|energized)\b/.test(t)) return "high";
  if (/\b(medium|ok|okay|fine)\b/.test(t)) return "medium";
  return undefined;
}

function parseEnvironment(
  text: string,
): DayDesignerAnswers["environment"] | undefined {
  const t = text.toLowerCase();
  if (/quiet|alone/.test(t)) return "home_quiet";
  if (/noisy|kids/.test(t)) return "home_noisy";
  if (/office/.test(t)) return "office";
  if (/coffee|cafe/.test(t)) return "coffee_shop";
  if (/car|travel|mobile|go/.test(t)) return "mobile";
  return undefined;
}

export function pickAdhdSupportTips(
  context: DayDesignerContext,
  answers: DayDesignerAnswers,
  blocks: SuggestedDayBlock[],
): string[] {
  const tips = new Set<string>();
  const energy = effectiveEnergy(context, answers.energy);

  if (isStuckOrFrozen(context) || blocks.some((b) => b.durationMinutes <= 10)) {
    tips.add("Use a 10-minute starter timer.");
  }
  if (isOverloaded(context)) {
    tips.add("Park new ideas instead of chasing them.");
  }
  if (hasActiveLoop(context)) {
    tips.add("Start with bullet points, not a finished draft.");
  }
  if (energy === "low") {
    tips.add("Set a visible finish line — one pass, then pause.");
  }
  if (
    blocks.some(
      (b) => b.type === "creative_work" || b.type === "deep_work",
    )
  ) {
    tips.add("Keep only one tab open.");
    tips.add("Put the phone in another room.");
  }

  const envSnapshot = evaluateEnvironment({
    dayEnvironment: answers.environment ?? null,
    cognitiveLoadLevel: context.cognitiveLoadLevel,
  });
  const envTip = environmentTipForPlan(envSnapshot);
  if (envTip) tips.add(envTip);

  for (const tip of ADHD_TIP_POOL) {
    if (tips.size >= 4) break;
    tips.add(tip);
  }
  return [...tips].slice(0, 4);
}

export function companionIntroForDayDesigner(): string {
  return "I can help you shape today — gently, no packed schedule. One question at a time.";
}
