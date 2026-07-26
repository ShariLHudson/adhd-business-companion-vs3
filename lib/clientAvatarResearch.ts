/**
 * Client Avatar research context — builds the scoped system prompt and the
 * automatic first research request from what the workspace already knows
 * (active question, current answer, relevant prior answers, avatar identity),
 * and appends a chosen research response into an answer without losing text.
 *
 * Pure + testable; the panel and builder stay thin.
 */

export type AvatarResearchContext = {
  questionLabel: string;
  /** The current answer for this question, if any. */
  currentAnswer?: string;
  /** Relevant prior answers already captured, e.g. { "Who they help": "…" }. */
  priorAnswers?: Array<{ label: string; value: string }>;
  /** Avatar name / draft identity, if available. */
  avatarName?: string;
};

/** Scoped system prompt — the assistant helps think through ONE question. */
export function buildAvatarResearchSystemPrompt(ctx: AvatarResearchContext): string {
  const priors = (ctx.priorAnswers ?? [])
    .filter((p) => p.value.trim())
    .map((p) => `- ${p.label}: ${p.value.trim()}`);
  return [
    "You are Shari, helping an ADHD founder think through ONE question about",
    "their ideal client so they can write their own answer, in their own words.",
    "",
    `The question: "${ctx.questionLabel}"`,
    ctx.avatarName?.trim() ? `Client name/label: ${ctx.avatarName.trim()}` : "",
    priors.length ? "What they've already said about this client:" : "",
    ...priors,
    ctx.currentAnswer?.trim()
      ? `Their current draft answer: "${ctx.currentAnswer.trim()}"`
      : "Their current draft answer: (empty so far)",
    "",
    "Help them explore and think it through: offer a few concrete angles,",
    "examples, and possible wording they could adapt. Keep replies short, warm,",
    "and concrete. Do NOT write the whole answer for them or call it final — they",
    "decide what to keep. Never mention menus, tools, the Chamber, or the Board.",
    "Stay entirely on this one question.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

/** The automatic first request, sent for the member so they need not type it. */
export function buildAvatarResearchAutoPrompt(ctx: AvatarResearchContext): string {
  const answer = ctx.currentAnswer?.trim();
  return answer
    ? `Help me think through this question. Here's my draft so far: "${answer}". Give me a few angles, examples, and possible wording I could adapt.`
    : `Help me think through this question. Give me a few concrete angles, examples, and possible wording I could adapt to write my own answer.`;
}

/**
 * Append a research response to an existing answer without ever overwriting.
 * Preserves prior text and separates additions with a clean blank line.
 */
export function appendResearchToAnswer(existing: string, addition: string): string {
  const add = addition.trim();
  if (!add) return existing;
  const base = existing ?? "";
  if (!base.trim()) return add;
  return `${base.replace(/\s+$/, "")}\n\n${add}`;
}
