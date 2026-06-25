/**
 * Orientation™ — where you are before what you do.
 * @see constitution.ts — buildOrientation
 */

import type {
  AssembledContext,
  MomentumAction,
  OrientationResult,
  PermissionDecision,
} from "./types";

const CATCH_UP = /\b(catch up|make up for|yesterday's incomplete)\b/i;
const PUSH_THROUGH = /\b(push through|power through)\b/i;
const NEXT_PHASE = /\b(next step|next phase|strike while)\b/i;
const GENERIC_HYPE = /\b(you've got this|crush it)\b/i;

function assertCleanCopy(text: string): void {
  if (CATCH_UP.test(text) || PUSH_THROUGH.test(text) || NEXT_PHASE.test(text)) {
    throw new Error(`Orientation copy failed constitutional audit: ${text}`);
  }
}

export function buildOrientation(
  ctx: AssembledContext,
  momentum: MomentumAction,
  permission: PermissionDecision,
): OrientationResult {
  if (ctx.cycleState === "protected") {
    const p = [
      "You're in deep work right now. I won't replan your day in the middle of that.",
      "When you're ready to come up for air, I'll help you shape the rest of today.",
    ];
    p.forEach(assertCleanCopy);
    return {
      type: "minimal",
      paragraphs: p,
      invitation: null,
      journeyLine: null,
    };
  }

  const paragraphs: string[] = [];

  switch (ctx.dayMode) {
    case "celebration":
      paragraphs.push(
        "What you accomplished matters on its own — not as a stepping stone to the next thing.",
        "I'm not adding a task list today. The win gets to be the whole story.",
      );
      break;
    case "recovery":
      paragraphs.push(
        "Yesterday didn't go how you hoped. That happens.",
        "Nothing from yesterday is on today's board unless you put it there.",
        "I don't have a task list waiting — I have space.",
      );
      break;
    case "survival":
      paragraphs.push(
        "Low energy today. I'm not going to hand you a normal day's plan.",
        "Today can be small. That's honest, not failure.",
      );
      break;
    case "health":
      paragraphs.push(
        `Health leads today${ctx.capacity.healthNote ? ` — ${ctx.capacity.healthNote}` : ""}.`,
        "Business can wait. Your body can't.",
      );
      break;
    case "family":
      paragraphs.push(
        "Family changes the day — completely, and without apology.",
        "One small professional courtesy if needed, then you're done with work.",
      );
      break;
    case "creative":
      paragraphs.push(
        "Creative mornings are valuable — and risky if every spark becomes a commitment.",
        "I'd protect time to explore and sort ideas — not build them all today.",
      );
      break;
    default:
      if (ctx.capacity.motivation === "overwhelmed") {
        paragraphs.push(
          "A lot is competing for attention. I won't list it all — that would make this worse.",
          "Before any tasks: what's the one thing your brain keeps circling?",
        );
      } else if (
        ctx.capacity.energy === "high" &&
        ctx.capacity.motivation === "scattered"
      ) {
        paragraphs.push(
          "High energy is real — and it isn't unlimited capacity.",
          "A tight plan beats a long one on days like this.",
        );
      } else {
        paragraphs.push(
          `${ctx.dayMode === "normal" ? "Here's today" : "Today"} — ${ctx.capacity.energy} energy, ${ctx.capacity.motivation} motivation.`,
        );
        if (ctx.focusAreas?.length) {
          paragraphs.push(
            `This week you're moving on: ${ctx.focusAreas.slice(0, 2).join(", ")}.`,
          );
        }
      }
      break;
  }

  if (momentum.label && momentum.kind !== "none") {
    paragraphs.push(
      `If I had to pick the one move that makes everything else easier: ${momentum.label}.`,
    );
  }

  if (permission.summaryCount > 0 && ctx.permissionDisplay !== "none") {
    paragraphs.push(
      `I intentionally left ${permission.summaryCount} thing${permission.summaryCount === 1 ? "" : "s"} off today — not because they don't matter, because they don't fit today.`,
    );
  }

  paragraphs.forEach(assertCleanCopy);

  const invitation =
    ctx.orientationOnly || ctx.capacity.motivation === "overwhelmed"
      ? "One thing — or we pause here. Both are fine."
      : ctx.dayMode === "celebration"
        ? null
        : "Does this shape feel right for today?";

  if (invitation) assertCleanCopy(invitation);

  return {
    type: ctx.orientationType,
    paragraphs,
    invitation,
    journeyLine: ctx.focusAreas?.[0]
      ? `Connected to: ${ctx.focusAreas[0]}`
      : null,
  };
}
