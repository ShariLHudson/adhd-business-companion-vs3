/**
 * Strategy-specific "Use This Strategy Now" options — launch-safe mapping.
 * Tone and routing stay in the Companion OS; this only shapes coaching choices.
 */

import { getProjects } from "./companionStore";
import type { AppSection } from "./companionUi";
import { getStrategy, resolveSubcat, type Strategy } from "./strategySystem";

export type StrategyApplyContext = {
  strategyTitle: string;
  strategyId?: string;
  categoryId: string;
  activeProjectName?: string | null;
};

export type StrategyApplyOption = {
  id: string;
  label: string;
  hint: string;
  openLabel: string;
  /** When set, opens a workspace instead of chat. */
  section?: AppSection;
  chatPrompt?: (ctx: StrategyApplyContext) => string;
};

export const COACHING_LIBRARY_CATEGORY_THRESHOLD = 8;

function projectNote(ctx: StrategyApplyContext): string {
  const name = ctx.activeProjectName?.trim();
  if (!name) return "";
  return ` (I'm currently focused on "${name}" — weave that in only if it genuinely fits; don't force project routing.)`;
}

function coachPrompt(
  ctx: StrategyApplyContext,
  focus: string,
): string {
  return (
    `I'm applying the "${ctx.strategyTitle}" strategy. ${focus}${projectNote(ctx)} ` +
    `Coach me through this one step at a time — ask one short question, wait for my answer.`
  );
}

export const STRATEGY_APPLY_FALLBACK: StrategyApplyOption[] = [
  {
    id: "apply-situation",
    label: "Apply this to my current situation",
    hint: "Walk through how this strategy fits what you're facing right now.",
    openLabel: "Talk with Shari",
    chatPrompt: (ctx) =>
      coachPrompt(ctx, "Help me apply this to my real situation right now."),
  },
  {
    id: "choose-where",
    label: "Help me choose where to use it",
    hint: "Pick the part of work or life where this strategy would help most.",
    openLabel: "Talk with Shari",
    chatPrompt: (ctx) =>
      coachPrompt(ctx, "Help me choose where this strategy fits best in my work."),
  },
  {
    id: "one-next-step",
    label: "Turn this into one next step",
    hint: "Shrink the strategy down to one small action you can do today.",
    openLabel: "Talk with Shari",
    chatPrompt: (ctx) =>
      coachPrompt(ctx, "Help me turn this into one small next step I can do today."),
  },
  {
    id: "save-later",
    label: "Save this strategy for later",
    hint: "Bookmark the idea and come back when you're ready.",
    openLabel: "Talk with Shari",
    chatPrompt: (ctx) =>
      `I want to save "${ctx.strategyTitle}" for later. ` +
      `Help me note when I'd reach for it and what would trigger using it.${projectNote(ctx)}`,
  },
];

const CATEGORY_APPLY_OPTIONS: Record<string, StrategyApplyOption[]> = {
  pricing: [
    {
      id: "who-raise",
      label: "Decide who to raise rates for",
      hint: "Pick one client or offer to test a higher rate with.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me decide who to raise rates for first."),
    },
    {
      id: "rate-message",
      label: "Write the rate increase message",
      hint: "Draft the words — warm, clear, and confident.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me write a short rate increase message."),
    },
    {
      id: "explain-value",
      label: "Explain the new value",
      hint: "Articulate what they're getting for the higher price.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me explain the new value behind the higher rate."),
    },
    {
      id: "handle-objections",
      label: "Handle client objections",
      hint: "Prepare calm responses if they push back.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me handle possible client objections to a rate increase."),
    },
  ],
  content: [
    {
      id: "choose-topic",
      label: "Choose a topic",
      hint: "Land on one idea worth sharing — not ten.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me choose one content topic to focus on."),
    },
    {
      id: "write-hook",
      label: "Write the hook",
      hint: "Craft the opening line that stops the scroll.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me write a strong hook for this piece of content."),
    },
    {
      id: "explain-idea",
      label: "Explain the idea",
      hint: "Clarify the core point before you publish.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me explain the core idea clearly."),
    },
    {
      id: "turn-into-post",
      label: "Turn it into a post",
      hint: "Shape the idea into something ready to share.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(
          ctx,
          "Help me turn this idea into a post — brainstorm in chat first; only draft when I ask.",
        ),
    },
  ],
  "decision-making": [
    {
      id: "compare-options",
      label: "Compare two options",
      hint: "Put your top two choices side by side.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me compare my top two options."),
    },
    {
      id: "what-matters",
      label: "Choose what matters most",
      hint: "Name the criteria that actually decide this.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me identify what matters most in this decision."),
    },
    {
      id: "reduce-choices",
      label: "Reduce the choices",
      hint: "Cut the list down to what deserves your attention.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me reduce my options to a short list."),
    },
    {
      id: "pick-next-step",
      label: "Pick the next step",
      hint: "Choose one move you can make before the decision is final.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me pick the next small step on this decision."),
    },
  ],
  "business-decisions": [
    {
      id: "compare-options",
      label: "Compare two options",
      hint: "Weigh the business paths in front of you.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me compare two business directions."),
    },
    {
      id: "what-matters",
      label: "Choose what matters most",
      hint: "Separate nice-to-have from must-have.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me choose what matters most for the business."),
    },
    {
      id: "reduce-choices",
      label: "Reduce the choices",
      hint: "Stop researching and narrow the field.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me reduce my business choices to a manageable set."),
    },
    {
      id: "pick-next-step",
      label: "Pick the next step",
      hint: "One test or action before committing big.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me pick one next step to test this decision."),
    },
  ],
  marketing: [
    {
      id: "pick-channel",
      label: "Pick one channel to focus on",
      hint: "Stop spreading thin — choose where you'll show up.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me pick one marketing channel to focus on."),
    },
    {
      id: "clarify-message",
      label: "Clarify the message",
      hint: "Say who it's for and what changes for them.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me clarify my core marketing message."),
    },
    {
      id: "one-audience",
      label: "Name one audience",
      hint: "Get specific about who you're trying to reach.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me name one audience to focus on."),
    },
    {
      id: "smallest-test",
      label: "Design the smallest test",
      hint: "One low-risk way to see if the approach works.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me design the smallest marketing test."),
    },
  ],
  sales: [
    {
      id: "who-to-contact",
      label: "Decide who to contact",
      hint: "Pick one person or segment to reach out to.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me decide who to contact next."),
    },
    {
      id: "write-outreach",
      label: "Write the outreach message",
      hint: "Draft words that feel human, not salesy.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me write a short outreach message."),
    },
    {
      id: "handle-follow-up",
      label: "Plan the follow-up",
      hint: "Decide when and how you'll check back in.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me plan a simple follow-up."),
    },
    {
      id: "one-conversation",
      label: "Prepare for one conversation",
      hint: "Get ready for a single call or reply.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me prepare for one sales conversation."),
    },
  ],
  overwhelm: [
    {
      id: "name-the-load",
      label: "Name what's overwhelming",
      hint: "Get it out of your head and onto paper.",
      openLabel: "Open Clear My Mind",
      section: "brain-dump",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me name what's overwhelming right now."),
    },
    {
      id: "shrink-one-thing",
      label: "Shrink one thing",
      hint: "Make one piece smaller than it feels.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me shrink one overwhelming thing."),
    },
    {
      id: "pick-one-door",
      label: "Pick one door",
      hint: "Choose a single focus and park the rest.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me pick one door to walk through today."),
    },
    {
      id: "regulate-first",
      label: "Regulate first, then plan",
      hint: "Calm the nervous system before strategizing.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me regulate first before making a plan."),
    },
  ],
  procrastination: [
    {
      id: "smallest-start",
      label: "Find the smallest start",
      hint: "A step so small it feels silly not to do it.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me find the smallest possible start."),
    },
    {
      id: "remove-friction",
      label: "Remove one friction point",
      hint: "Clear one obstacle between you and beginning.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me remove one friction point so I can start."),
    },
    {
      id: "two-minute-version",
      label: "Try the two-minute version",
      hint: "What could you do in under two minutes?",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me define a two-minute version of this task."),
    },
    {
      id: "body-double",
      label: "Set up accountability",
      hint: "Plan how you'll show up with someone or a timer.",
      openLabel: "Open Focus Session",
      section: "focus-timer",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me set up a simple accountability move to start."),
    },
  ],
  focus: [
    {
      id: "one-thing",
      label: "Name the one thing",
      hint: "What deserves your attention for the next block?",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me name the one thing to focus on."),
    },
    {
      id: "block-distractions",
      label: "Block distractions",
      hint: "Decide what to close, mute, or park.",
      openLabel: "Talk with Shari",
      chatPrompt: (ctx) =>
        coachPrompt(ctx, "Help me decide what to block or mute."),
    },
    {
      id: "focus-session",
      label: "Start a focus session",
      hint: "Set a timer and work on one thing.",
      openLabel: "Open Focus Session",
      section: "focus-timer",
    },
    {
      id: "close-loops",
      label: "Close open loops",
      hint: "Capture what's pulling your attention so you can return.",
      openLabel: "Open Clear My Mind",
      section: "brain-dump",
    },
  ],
};

/** Per-strategy overrides when category defaults aren't specific enough. */
const STRATEGY_APPLY_OVERRIDES: Record<string, StrategyApplyOption[]> = {
  "raise-one-client": CATEGORY_APPLY_OPTIONS.pricing!,
  "value-first-pricing": CATEGORY_APPLY_OPTIONS.pricing!,
  "content-from-convos": CATEGORY_APPLY_OPTIONS.content!,
  "repurpose-one": CATEGORY_APPLY_OPTIONS.content!,
  "one-channel": CATEGORY_APPLY_OPTIONS.marketing!,
  "pick-then-learn": CATEGORY_APPLY_OPTIONS["decision-making"]!,
  "decision-matrix": CATEGORY_APPLY_OPTIONS["decision-making"]!,
  "reversible-or-permanent": CATEGORY_APPLY_OPTIONS["decision-making"]!,
  "good-enough-direction": CATEGORY_APPLY_OPTIONS["business-decisions"]!,
  "test-before-scale": CATEGORY_APPLY_OPTIONS["business-decisions"]!,
};

export function pickActiveProjectName(): string | null {
  const projects = getProjects();
  const focus = projects.find((p) => p.status === "active-focus");
  if (focus?.name?.trim()) return focus.name.trim();
  const now = projects.find(
    (p) =>
      p.horizon === "now" &&
      p.status !== "completed",
  );
  if (now?.name?.trim()) return now.name.trim();
  const inProgress = projects.find((p) => p.status === "in-progress");
  return inProgress?.name?.trim() ?? null;
}

export function resolveStrategyCategoryId(
  strategyId?: string,
  categoryId?: string,
): string {
  if (strategyId) {
    const s = getStrategy(strategyId);
    if (s) return resolveSubcat(s);
  }
  return categoryId ?? "";
}

export function getStrategyApplyOptions(
  strategyId: string | undefined,
  categoryId: string | undefined,
  partialCtx?: Partial<StrategyApplyContext>,
): StrategyApplyOption[] {
  const resolvedCategory = resolveStrategyCategoryId(strategyId, categoryId);
  const strategy = strategyId ? getStrategy(strategyId) : undefined;
  const ctx: StrategyApplyContext = {
    strategyTitle: partialCtx?.strategyTitle ?? strategy?.title ?? "this strategy",
    strategyId,
    categoryId: resolvedCategory,
    activeProjectName:
      partialCtx?.activeProjectName !== undefined
        ? partialCtx.activeProjectName
        : pickActiveProjectName(),
  };

  if (strategyId && STRATEGY_APPLY_OVERRIDES[strategyId]) {
    return STRATEGY_APPLY_OVERRIDES[strategyId]!;
  }
  if (resolvedCategory && CATEGORY_APPLY_OPTIONS[resolvedCategory]) {
    return CATEGORY_APPLY_OPTIONS[resolvedCategory]!;
  }
  return STRATEGY_APPLY_FALLBACK;
}

export function suggestedApplyOptionId(
  options: StrategyApplyOption[],
  ctx: StrategyApplyContext,
): string | null {
  if (options.length === 0) return null;
  if (ctx.activeProjectName && options.some((o) => o.id === "apply-situation")) {
    return "apply-situation";
  }
  return options[0]!.id;
}

export function buildStrategyApplyChatPrompt(
  option: StrategyApplyOption,
  ctx: StrategyApplyContext,
): string | null {
  return option.chatPrompt?.(ctx) ?? null;
}

export function applyPromptForStrategy(s: Strategy): string {
  const questions =
    s.coach && s.coach.length
      ? s.coach
      : s.steps.map((step) => `Help me with this part: ${step}`);
  const project = pickActiveProjectName();
  const projectLine = project
    ? `\n\nContext: I'm focused on "${project}" — reference it only if it naturally fits; don't force project routing.`
    : "";
  return [
    `I want to actually apply the "${s.title}" strategy to my real situation right now — please coach me through it, don't just explain it again.${projectLine}`,
    `Ask me these one at a time, waiting for my answer before moving to the next. Keep each question short and warm:`,
    questions.map((q, i) => `${i + 1}. ${q}`).join("\n"),
    `After the last one, give me a short encouraging close and offer to start a Focus Session or Time Block. Begin now with just the first question — nothing else.`,
  ].join("\n\n");
}
