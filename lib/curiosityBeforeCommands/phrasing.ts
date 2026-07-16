import { getCuriosityBeforeCommandsPreference } from "./prefs";
import type {
  CuriosityBeforeCommandsMode,
  CuriosityPromptContext,
} from "./types";

const BANNED_CLAIM_RE =
  /dopamine|guaranteed|will make you feel|always creates|neurochemical/i;

const PRESSURE_RE =
  /\b(?:you need to|you should|you must|it'?s time to|get this done|don'?t put this off)\b/i;

const DIRECT_REQUEST_RE =
  /\b(?:be direct|just tell me|skip (?:the )?questions?|no questions?|just the next step)\b/i;

function seedNumber(seed?: number | string): number {
  if (typeof seed === "number" && Number.isFinite(seed)) {
    return Math.abs(Math.floor(seed));
  }
  if (typeof seed === "string" && seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) {
      h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    }
    return h;
  }
  return Date.now() % 97;
}

function pick<T>(items: readonly T[], seed: number): T {
  return items[seed % items.length]!;
}

/**
 * Whether Curiosity Before Commands should shape this optional prompt.
 * Urgent, fixed-time, direct preference, and fatigue contexts stay direct.
 */
export function shouldUseCuriosityBeforeCommands(input: {
  mode?: CuriosityBeforeCommandsMode;
  forceDirect?: boolean;
  avoidExtraQuestion?: boolean;
  memberAskedForDirect?: boolean;
  /** For mix mode — true on some turns. */
  mixUseCuriosity?: boolean;
}): boolean {
  if (input.forceDirect || input.avoidExtraQuestion || input.memberAskedForDirect) {
    return false;
  }
  const mode =
    input.mode ?? getCuriosityBeforeCommandsPreference().mode;
  if (mode === "direct") return false;
  if (mode === "curiosity-usually") return true;
  if (mode === "mix") {
    return input.mixUseCuriosity ?? seedNumber() % 2 === 0;
  }
  // situational + unsure — default to curiosity for optional non-urgent invites
  return true;
}

export function memberTextRequestsDirect(text: string): boolean {
  return DIRECT_REQUEST_RE.test(text.trim());
}

/**
 * Build optional invitation wording. Never invents emotional benefits.
 * Returns a direct invitation when curiosity should not apply.
 */
export function buildCuriosityBeforeCommandsPrompt(
  context: CuriosityPromptContext,
  options?: {
    mode?: CuriosityBeforeCommandsMode;
    memberMessage?: string;
  },
): string {
  const action = context.actionLabel.trim() || "this";
  const mode =
    options?.mode ?? getCuriosityBeforeCommandsPreference().mode;
  const memberAskedForDirect = options?.memberMessage
    ? memberTextRequestsDirect(options.memberMessage)
    : false;

  const useCuriosity = shouldUseCuriosityBeforeCommands({
    mode,
    forceDirect: context.forceDirect,
    avoidExtraQuestion: context.avoidExtraQuestion,
    memberAskedForDirect,
    mixUseCuriosity: seedNumber(context.variationSeed) % 2 === 0,
  });

  if (!useCuriosity) {
    return buildDirectInvitation(action, context.preferSmallStep !== false);
  }

  const seed = seedNumber(context.variationSeed ?? action);
  const benefit = context.knownBenefit?.trim();
  const small = context.preferSmallStep !== false;

  if (benefit) {
    const withBenefit = [
      `Would ${small ? "one small step on " : ""}${action} help you feel ${benefit}?`,
      `How would you feel if ${action} moved forward enough to ${benefit}?`,
      `What might become easier if you spent a few minutes on ${action} — especially toward ${benefit}?`,
      `Would a short pass on ${action} give you ${benefit}?`,
      `How might tomorrow feel if ${action} were a little further along for ${benefit}?`,
    ] as const;
    return pick(withBenefit, seed);
  }

  // No known benefit — invite curiosity without inventing emotional payoffs.
  const open = [
    `How would you feel if one small part of ${action} were clearer today?`,
    `What might become easier if you took one small step on ${action}?`,
    `What benefit would matter most if you touched ${action} briefly today?`,
    `Would one small step on ${action} be worth trying right now?`,
    `How might tomorrow feel if ${action} were just a little further along?`,
  ] as const;
  return pick(open, seed);
}

function buildDirectInvitation(action: string, small: boolean): string {
  if (small) {
    return `When you’re ready, we can take one small step on ${action}.`;
  }
  return `When you’re ready, we can work on ${action}.`;
}

/** Guard for tests and copy review — never ship dopamine guarantees or pressure commands. */
export function curiosityCopyIsSafe(text: string): boolean {
  if (!text.trim()) return false;
  if (BANNED_CLAIM_RE.test(text)) return false;
  if (PRESSURE_RE.test(text)) return false;
  return true;
}

export function buildCuriosityBeforeCommandsPromptHint(
  mode?: CuriosityBeforeCommandsMode,
): string | null {
  const resolved = mode ?? getCuriosityBeforeCommandsPreference().mode;
  if (resolved === "direct") {
    return [
      "Curiosity Before Commands: member prefers direct prompts.",
      "For optional actions, invite clearly without feeling-based questions.",
      "Still allow decline. Never pressure. Urgent and fixed-time notices stay concise.",
    ].join("\n");
  }

  const intensity =
    resolved === "curiosity-usually"
      ? "often"
      : resolved === "mix"
        ? "sometimes (vary with direct invitations)"
        : "when it fits the situation";

  return [
    "Curiosity Before Commands (optional communication strategy — not a universal rule):",
    `When encouraging a non-urgent action, ${intensity} connect the action to a personally meaningful feeling, benefit, or outcome the member already stated — using a question, not a command.`,
    "Patterns to vary (do not repeat the same phrase mechanically): How would you feel if…? · Would this help you feel…? · What might become easier if…? · Would one small step give you…? · How might tomorrow feel if…? · What benefit would matter most here?",
    "Prefer one small action over the full task. Allow decline without pressure.",
    "Do NOT invent emotional benefits. Do NOT claim dopamine or guaranteed feelings.",
    "Do NOT use for: urgent safety, fixed calendar-start notices, when they asked to be direct, or when another question would add decision fatigue.",
    "Applies especially to: Plan My Day, optional reminders/rhythms, project restart, goal-connected actions, task initiation, Clear My Mind follow-through, Return Plan support.",
  ].join("\n");
}
