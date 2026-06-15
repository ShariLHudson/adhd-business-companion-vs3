/**
 * Build adaptive day plans — simple blocks, always with margin.
 */

import type { EmotionalState } from "@/lib/companionEmotions";
import type { DayLevel } from "@/lib/companionStore";
import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import {
  effectiveEnergy,
  gatherDayDesignerContext,
  hasActiveLoop,
  hasCreativeEnergy,
  isOverloaded,
  isStuckOrFrozen,
} from "./daySignals";
import {
  buildReasoningSummary,
  evaluatePlanningRules,
  maxBlocksForContext,
} from "./dayReasoning";
import { pickAdhdSupportTips } from "./dayMessages";
import type {
  DayDesignerAnswers,
  DayDesignerContext,
  DayDesignerInput,
  DayEnvironment,
  DayPlan,
  DayPriority,
  SimpleDayPlanView,
  SuggestedDayBlock,
} from "./types";

function uid(): string {
  return `day-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function block(
  type: SuggestedDayBlock["type"],
  title: string,
  durationMinutes: number,
  reason: string,
  priorityId?: string,
): SuggestedDayBlock {
  return {
    id: uid(),
    type,
    title,
    durationMinutes,
    reason,
    priorityId,
  };
}

function parseMustDoPriorities(text: string | undefined): DayPriority[] {
  if (!text?.trim()) return [];
  return text
    .split(/[,;\n]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4)
    .map((label, i) => ({
      id: `user-${i}`,
      label,
      estimatedMinutes: 25,
      urgency: "medium" as const,
      energyNeeded: "medium" as const,
      importance: "high" as const,
    }));
}

function mergePriorities(
  userItems: DayPriority[],
  projectItems: DayPriority[],
): DayPriority[] {
  const seen = new Set<string>();
  const out: DayPriority[] = [];
  for (const p of [...userItems, ...projectItems]) {
    const key = p.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out.slice(0, 5);
}

function inferBlockType(
  priority: DayPriority,
  context: DayDesignerContext,
): SuggestedDayBlock["type"] {
  const label = priority.label.toLowerCase();
  if (/email|call|message|reply|meeting/.test(label)) return "communication";
  if (/learn|read|course|study/.test(label)) return "learning";
  if (/write|draft|create|design|content/.test(label)) {
    return hasCreativeEnergy(context) ? "creative_work" : "deep_work";
  }
  if (/plan|organize|sort|priority/.test(label)) return "planning";
  if (/invoice|admin|file|tax|form/.test(label)) return "admin";
  if (priority.energyNeeded === "high") return "deep_work";
  return "flex";
}

export function buildSuggestedBlocks(
  context: DayDesignerContext,
  answers: DayDesignerAnswers,
  priorities: DayPriority[],
): SuggestedDayBlock[] {
  const energy = effectiveEnergy(context, answers.energy);
  const maxBlocks = maxBlocksForContext(context, answers);
  const blocks: SuggestedDayBlock[] = [];

  if (isStuckOrFrozen(context)) {
    blocks.push(
      block(
        "flex",
        "10-minute starter — one physical first move",
        10,
        "Tiny start when stuck or frozen",
      ),
    );
  }

  if (hasActiveLoop(context)) {
    blocks.push(
      block(
        "recovery",
        "Ground or close the loop — facts vs. guesses",
        10,
        "Gentle loop-closing before more output",
      ),
    );
  }

  if (energy === "low" && blocks.length === 0) {
    blocks.push(
      block(
        "recovery",
        "Short recovery or reset",
        15,
        "Low energy — stabilize before pushing",
      ),
    );
  }

  const sorted = [...priorities].sort((a, b) => {
    const score = (p: DayPriority) =>
      (p.urgency === "high" ? 3 : p.urgency === "medium" ? 2 : 1) +
      (p.importance === "high" ? 3 : p.importance === "medium" ? 2 : 1);
    return score(b) - score(a);
  });

  for (const priority of sorted) {
    if (blocks.length >= maxBlocks) break;
    const type = inferBlockType(priority, context);
    if (energy === "low" && type === "deep_work") continue;
    if (
      hasCreativeEnergy(context) &&
      type === "creative_work" &&
      context.timeOfDay === "morning" &&
      blocks.length < 2
    ) {
      blocks.unshift(
        block(
          type,
          priority.label,
          priority.estimatedMinutes ?? 30,
          "Creative work earlier when energy is stronger",
          priority.id,
        ),
      );
      continue;
    }
    blocks.push(
      block(
        type,
        priority.label,
        Math.min(priority.estimatedMinutes ?? 30, 45),
        `Fits today's energy and what matters`,
        priority.id,
      ),
    );
  }

  if (blocks.length === 0) {
    blocks.push(
      block(
        "flex",
        "One thing that would make today feel enough",
        20,
        "Minimum viable day",
      ),
    );
  }

  if (blocks.length < maxBlocks + 1) {
    blocks.push(
      block(
        "flex",
        "Open margin — buffer for surprises",
        20,
        "Always leave margin",
      ),
    );
  }

  return blocks.slice(0, maxBlocks + 1);
}

export function buildDayPlan(input: DayDesignerInput = {}): DayPlan {
  const context = gatherDayDesignerContext(input);
  const answers = input.answers ?? {};
  const userPriorities = parseMustDoPriorities(answers.mustDoToday);
  const poolPriorities = mergePriorities(
    mergePriorities(
      context.timeBankPriorities,
      context.projectTaskPriorities,
    ),
    isOverloaded(context)
      ? context.projectPriorities.slice(0, 2)
      : context.projectPriorities,
  );
  const priorities = mergePriorities(userPriorities, poolPriorities);
  const rules = evaluatePlanningRules(context, answers);
  const suggestedBlocks = buildSuggestedBlocks(context, answers, priorities);
  const energy = effectiveEnergy(context, answers.energy);
  const availableMinutes = answers.availableMinutes ?? 240;

  return {
    id: uid(),
    date: context.now.toISOString().slice(0, 10),
    userEnergy: energy,
    emotionalState: context.emotionalState,
    cognitiveLoadLevel: context.cognitiveLoadLevel ?? "unknown",
    activationState: context.activationState ?? "unknown",
    availableTimeBlocks: Math.max(1, Math.ceil(availableMinutes / 60)),
    environment: answers.environment ?? "unknown",
    priorities,
    suggestedBlocks,
    reasoningSummary: buildReasoningSummary(rules, context),
    adhdSupportTips: pickAdhdSupportTips(context, answers, suggestedBlocks),
    createdAt: context.now.toISOString(),
  };
}

export function buildSimpleDayPlanView(plan: DayPlan): SimpleDayPlanView {
  const workBlocks = plan.suggestedBlocks.filter(
    (b) => b.type !== "recovery" && !b.title.includes("margin"),
  );
  const marginBlock = plan.suggestedBlocks.find((b) =>
    b.title.includes("margin"),
  );
  const focus =
    workBlocks.find((b) => b.type === "creative_work" || b.type === "deep_work")
      ?.title ??
    workBlocks[0]?.title ??
    "One enough-for-today focus";
  const first =
    workBlocks[0]?.title ?? "One small physical first step";
  const wait = plan.priorities
    .slice(2)
    .map((p) => p.label)
    .slice(0, 3);

  return {
    todaysFocus: focus,
    firstStep: first,
    canWait: wait.length ? wait : ["Everything else can wait until tomorrow"],
    recoveryMargin:
      marginBlock?.title ??
      plan.suggestedBlocks.find((b) => b.type === "recovery")?.title ??
      "Open margin — no pressure to fill every hour",
    reasoningSummary: plan.reasoningSummary,
    adhdSupportTips: plan.adhdSupportTips.slice(0, 3),
  };
}

export function mapEnergyAnswer(text: string): DayLevel | null {
  const t = text.toLowerCase();
  if (/\b(low|tired|exhausted|drained|wiped)\b/.test(t)) return "low";
  if (/\b(high|great|good|energized|ready)\b/.test(t)) return "high";
  if (/\b(medium|ok|okay|fine|so-so)\b/.test(t)) return "medium";
  return null;
}

export function mapEnvironmentAnswer(text: string): DayEnvironment | null {
  const t = text.toLowerCase();
  if (/quiet|home office|alone/.test(t)) return "home_quiet";
  if (/noisy|kids|distraction/.test(t)) return "home_noisy";
  if (/office|workplace/.test(t)) return "office";
  if (/coffee|cafe/.test(t)) return "coffee_shop";
  if (/car|travel|mobile|out/.test(t)) return "mobile";
  return null;
}

export function mapMinutesAnswer(text: string): number | null {
  const hours = text.match(/(\d+)\s*h/i);
  if (hours) return Math.min(480, parseInt(hours[1]!, 10) * 60);
  const mins = text.match(/(\d+)\s*m/i);
  if (mins) return Math.min(480, parseInt(mins[1]!, 10));
  const num = text.match(/\b(\d+)\b/);
  if (num) {
    const n = parseInt(num[1]!, 10);
    return n <= 12 ? n * 60 : n;
  }
  return null;
}
