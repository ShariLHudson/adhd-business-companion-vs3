/**
 * Distinct Suggest Next Step helpers (Prompt 137).
 * Prefer Project Brain when available; local guidance when offline / no key.
 * Never fake AI progress — honest fallback copy only.
 */

export type SuggestNextStepHelperId =
  | "suggest"
  | "stuck"
  | "breakdown"
  | "simplify"
  | "matters";

export type SuggestNextStepHelper = {
  id: SuggestNextStepHelperId;
  label: string;
  /** API modifier for /api/project-brain */
  apiModifier?: string;
  /** Local guidance when the brain is unavailable */
  localGuidance: (ctx: {
    name: string;
    goal: string;
    nextAction: string;
  }) => string;
};

export const SUGGEST_NEXT_STEP_HELPERS: SuggestNextStepHelper[] = [
  {
    id: "suggest",
    label: "Suggest Next Step",
    localGuidance: ({ name, goal, nextAction }) =>
      nextAction.trim()
        ? `Start with: ${nextAction.trim()}`
        : goal.trim()
          ? `Take one small step toward: ${goal.trim()}`
          : `Open ${name || "this project"} and write the first concrete step you can finish today.`,
  },
  {
    id: "stuck",
    label: "I'm Stuck",
    apiModifier: "blocked",
    localGuidance: ({ nextAction, goal }) =>
      nextAction.trim()
        ? `Shrink it: open whatever holds “${nextAction.trim()}” and do only the first 2 minutes.`
        : goal.trim()
          ? `You're not behind. Name one tiny move that would make “${goal.trim()}” clearer — even a title is enough.`
          : "Write down what feels stuck in one sentence. That's the next step.",
  },
  {
    id: "breakdown",
    label: "Break It Down",
    apiModifier: "breakdown",
    localGuidance: ({ nextAction, goal }) =>
      nextAction.trim()
        ? `First slice of “${nextAction.trim()}”: list the very first physical action (open, write, send, ask).`
        : goal.trim()
          ? `Break “${goal.trim()}” into three pieces — then do only the first piece.`
          : "Name three pieces of this work. Pick the smallest one.",
  },
  {
    id: "simplify",
    label: "Simplify This",
    apiModifier: "smaller",
    localGuidance: ({ nextAction }) =>
      nextAction.trim()
        ? `Simpler version: spend 5 minutes on “${nextAction.trim()}” — stop when the timer ends.`
        : "Choose a version of this that fits in one short sitting. Quality can grow later.",
  },
  {
    id: "matters",
    label: "What Matters Most?",
    apiModifier: "matters",
    localGuidance: ({ goal, name }) =>
      goal.trim()
        ? `What matters most for “${name || "this"}” is getting closer to: ${goal.trim()}. Ignore the rest for now.`
        : `Ask: if this project disappeared tomorrow, what one outcome would you miss? Start there.`,
  },
];

export function getSuggestNextStepHelper(
  id: SuggestNextStepHelperId,
): SuggestNextStepHelper {
  return (
    SUGGEST_NEXT_STEP_HELPERS.find((h) => h.id === id) ??
    SUGGEST_NEXT_STEP_HELPERS[0]!
  );
}
