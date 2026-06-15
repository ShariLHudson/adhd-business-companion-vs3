/**
 * Loop messages — compassionate purpose and non-labeling companion language.
 */

import type {
  ActivationStateHint,
  CognitiveLoadLevelHint,
  LoopConfidence,
  LoopSeverity,
  LoopType,
} from "./types";

export const LOOP_PURPOSES: Record<LoopType, string> = {
  anxiety_loop: "Trying to create safety.",
  rumination_loop: "Trying to solve something that feels unresolved.",
  perfectionism_loop: "Trying to prevent mistakes or judgment.",
  guilt_loop: "Trying to honor your values and relationships.",
  shame_loop: "Trying to protect yourself from more hurt.",
  comparison_loop: "Trying to find where you stand.",
  impostor_loop: "Trying to stay humble and not disappoint anyone.",
  control_loop: "Trying to keep things from falling apart.",
  connection_loop: "Trying to protect against rejection or disconnection.",
  achievement_loop: "Trying to prove you are enough.",
  rsd_loop: "Trying to protect against rejection or disconnection.",
  certainty_loop: "Trying to reduce uncertainty before acting.",
  potential_loop: "Trying to make sure your gifts are not wasted.",
  research_loop: "Trying to reduce uncertainty before acting.",
  planning_loop: "Trying to feel ready before you begin.",
  optimization_loop: "Trying to do your best work.",
  productivity_loop: "Trying to meet expectations you care about.",
  overwhelm_loop: "Trying to hold everything that matters to you.",
  restart_loop: "Trying to get a clean slate when things feel messy.",
  recovery_loop: "Trying to earn rest when you feel behind.",
};

export const LOOP_DESCRIPTIONS: Record<LoopType, string> = {
  anxiety_loop: "Worry and what-if thoughts keep returning.",
  rumination_loop: "The same thoughts circle without resolution.",
  perfectionism_loop: "The bar keeps moving before you can finish.",
  guilt_loop: "Should-haves and obligations replay often.",
  shame_loop: "Self-criticism takes up mental space.",
  comparison_loop: "Measuring against others keeps surfacing.",
  impostor_loop: "Doubts about belonging or qualification repeat.",
  control_loop: "Needing certainty about outcomes keeps looping.",
  connection_loop: "Concerns about relationships or reactions repeat.",
  achievement_loop: "Never-enough pressure keeps returning.",
  rsd_loop: "Sensitivity to criticism or rejection keeps surfacing.",
  certainty_loop: "Needing to know for sure before acting repeats.",
  potential_loop: "Fear of wasting gifts or potential loops back.",
  research_loop: "Gathering more information delays action.",
  planning_loop: "Planning replaces starting.",
  optimization_loop: "Tweaking replaces shipping.",
  productivity_loop: "Pressure to do more keeps returning.",
  overwhelm_loop: "Too-much feelings keep resurfacing.",
  restart_loop: "Starting over feels like the answer again.",
  recovery_loop: "Difficulty resting without guilt repeats.",
};

const COMPANION_RESPONSES: Record<LoopType, string[]> = {
  anxiety_loop: [
    "I notice we keep coming back to this worry. Would it help to look at what your mind may be trying to protect?",
    "This seems like it may be taking up a lot of mental space. Would it help to separate what we know from what we're guessing?",
  ],
  rumination_loop: [
    "I notice we keep circling this thought. Would it help to look at what your brain may be trying to solve?",
    "This seems like it may be taking up a lot of mental space. Would it help to close this loop for now?",
  ],
  perfectionism_loop: [
    "I notice we keep coming back to making this better. Would it help to name what good-enough looks like for today?",
    "This seems like it may be taking up a lot of mental space. Would it help to set a small finish line?",
  ],
  guilt_loop: [
    "I notice guilt keeps surfacing here. Would it help to look at what you were trying to honor?",
    "This seems heavy. Would it help to separate what happened from what you're carrying now?",
  ],
  shame_loop: [
    "I notice some harsh self-talk keeps returning. Would it help to look at what you may be trying to protect?",
    "This seems like it may be taking up a lot of mental space. Would it help a gentler lens for a moment?",
  ],
  comparison_loop: [
    "I notice comparison keeps coming up. Would it help to look at your own path, not someone else's highlight reel?",
    "This seems like it may be taking up a lot of mental space. Would it help to name one thing that's actually yours?",
  ],
  impostor_loop: [
    "I notice doubt about belonging keeps returning. Would it help to look at what's real evidence vs. fear?",
    "This seems like it may be taking up a lot of mental space. Would it help to separate facts from the story fear tells?",
  ],
  control_loop: [
    "I notice the need for control keeps surfacing. Would it help to look at what's actually in your hands today?",
    "This seems like it may be taking up a lot of mental space. Would it help to loosen one thing that's not yours to hold?",
  ],
  connection_loop: [
    "I notice we keep coming back to this concern about connection. Would it help to look at what your heart may be trying to protect?",
    "This seems like it may be taking up a lot of mental space. Would it help to separate what we know from what we're guessing?",
  ],
  achievement_loop: [
    "I notice never-enough feelings keep returning. Would it help to name what you've already done?",
    "This seems like it may be taking up a lot of mental space. Would it help to close this loop for now?",
  ],
  rsd_loop: [
    "I notice we keep coming back to this concern. Would it help to look at what your brain may be trying to protect?",
    "This seems like it may be taking up a lot of mental space. Would it help to separate what we know from what we're guessing?",
  ],
  certainty_loop: [
    "I notice needing certainty keeps looping. Would it help to find one small step that doesn't require full clarity?",
    "This seems like it may be taking up a lot of mental space. Would it help to act with partial information?",
  ],
  potential_loop: [
    "I notice worry about potential keeps returning. Would it help to look at one gift you could use today, not all of them?",
    "This seems like it may be taking up a lot of mental space. Would it help to close this loop for now?",
  ],
  research_loop: [
    "I notice more research keeps feeling necessary. Would it help to name what's good enough to act on?",
    "This seems like it may be taking up a lot of mental space. Would it help a 'good enough to act' threshold?",
  ],
  planning_loop: [
    "I notice planning keeps replacing starting. Would it help to pick the first 5-minute step?",
    "This seems like it may be taking up a lot of mental space. Would it help to close the plan and try one move?",
  ],
  optimization_loop: [
    "I notice tweaking keeps pulling you back. Would it help to ship a small version and improve later?",
    "This seems like it may be taking up a lot of mental space. Would it help to set a finish line?",
  ],
  productivity_loop: [
    "I notice productivity pressure keeps returning. Would it help to name one enough-for-today task?",
    "This seems like it may be taking up a lot of mental space. Would it help to release the 'should be doing more' loop?",
  ],
  overwhelm_loop: [
    "I notice overwhelm keeps surfacing. Would it help to sort what matters today, what can wait, and what can park?",
    "This seems like it may be taking up a lot of mental space. Would it help to carry less right now?",
  ],
  restart_loop: [
    "I notice starting over keeps feeling like the answer. Would it help to salvage one piece instead of scrapping all?",
    "This seems like it may be taking up a lot of mental space. Would it help to close this loop for now?",
  ],
  recovery_loop: [
    "I notice guilt about resting keeps returning. Would it help to treat recovery as part of the work?",
    "This seems like it may be taking up a lot of mental space. Would it help to name one small rest step?",
  ],
};

const SHORT_RESPONSES: Record<LoopType, string> = {
  anxiety_loop: "This worry keeps circling. Want to park it for now and pick one small thing?",
  rumination_loop: "This thought keeps returning. Want to close the loop for today?",
  perfectionism_loop: "The bar keeps moving. Want to name good-enough for today?",
  guilt_loop: "Guilt is loud. Want one gentle next step?",
  shame_loop: "This feels heavy. Want a softer lens for a moment?",
  comparison_loop: "Comparison keeps surfacing. Want to focus on your path only?",
  impostor_loop: "Doubt keeps returning. Want to separate facts from fear?",
  control_loop: "A lot feels out of reach. Want to name what's actually yours today?",
  connection_loop: "This concern keeps returning. Want to separate what we know from what we're guessing?",
  achievement_loop: "Never-enough is loud. Want to name what's already enough?",
  rsd_loop: "This concern keeps returning. Want to look at what you may be protecting?",
  certainty_loop: "Certainty keeps feeling necessary. Want one step without full clarity?",
  potential_loop: "Potential worry loops back. Want one gift to use today?",
  research_loop: "More research keeps calling. Want a good-enough-to-act threshold?",
  planning_loop: "Planning keeps replacing doing. Want the first 5-minute step?",
  optimization_loop: "Tweaking keeps pulling you back. Want a small finish line?",
  productivity_loop: "Productivity pressure returns. Want one enough-for-today task?",
  overwhelm_loop: "Overwhelm keeps surfacing. Want to sort what matters vs. what can wait?",
  restart_loop: "Starting over feels tempting again. Want to salvage one piece?",
  recovery_loop: "Rest feels hard to allow. Want to treat recovery as part of the work?",
};

const TINY_STEP_RESPONSES: Record<LoopType, string> = {
  anxiety_loop: "Want one tiny step — just naming what we know for sure?",
  rumination_loop: "Want one tiny step — write the thought down and set it aside?",
  perfectionism_loop: "Want one tiny step — define good-enough in one sentence?",
  guilt_loop: "Want one tiny step — name what you were trying to honor?",
  shame_loop: "Want one tiny step — one kind sentence to yourself?",
  comparison_loop: "Want one tiny step — name one thing that's yours today?",
  impostor_loop: "Want one tiny step — one piece of real evidence?",
  control_loop: "Want one tiny step — one thing actually in your hands?",
  connection_loop: "Want one tiny step — separate fact from guess?",
  achievement_loop: "Want one tiny step — name one thing already done?",
  rsd_loop: "Want one tiny step — a private draft no one sees yet?",
  certainty_loop: "Want one tiny step without needing full clarity?",
  potential_loop: "Want one tiny step using one gift today?",
  research_loop: "Want one tiny step — act on what you already know?",
  planning_loop: "Want one tiny step — the first physical move?",
  optimization_loop: "Want one tiny step — ship a rough version?",
  productivity_loop: "Want one tiny step — 5 minutes, then stop?",
  overwhelm_loop: "Want one tiny step — pick one priority only?",
  restart_loop: "Want one tiny step — keep one piece, release the rest?",
  recovery_loop: "Want one tiny step — 10 minutes of real rest?",
};

export function severityForFrequency(frequency: number): LoopSeverity {
  if (frequency >= 5) return "heavy";
  if (frequency >= 3) return "moderate";
  return "light";
}

export function confidenceFromSignals(
  frequency: number,
  distinctSignals: number,
  distinctDays: number,
): LoopConfidence {
  if (frequency >= 4 && distinctSignals >= 2 && distinctDays >= 2) return "high";
  if (frequency >= 3 || (distinctSignals >= 2 && distinctDays >= 2)) {
    return "medium";
  }
  return "low";
}

export function buildCompanionResponse(
  loopType: LoopType,
  cognitiveLoadLevel: CognitiveLoadLevelHint | null | undefined,
  activationState: ActivationStateHint | null | undefined,
  rotationKey: string,
): string {
  const heavyLoad =
    cognitiveLoadLevel === "heavy" || cognitiveLoadLevel === "overloaded";
  const stuckFrozen =
    activationState === "stuck" || activationState === "frozen";

  if (heavyLoad) {
    return SHORT_RESPONSES[loopType];
  }
  if (stuckFrozen) {
    return TINY_STEP_RESPONSES[loopType];
  }

  const variants = COMPANION_RESPONSES[loopType];
  const idx =
    Math.abs(hashString(rotationKey)) % (variants.length || 1);
  return variants[idx] ?? variants[0] ?? "";
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
