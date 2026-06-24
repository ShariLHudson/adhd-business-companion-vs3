/**
 * P0.23 — ADHD Emotional Friction Intelligence™
 * Distinguish emotional-friction turns from task-first turns.
 */

export type AdhdEmotionalFrictionCategory =
  | "activation"
  | "overwhelm"
  | "motivation"
  | "distraction";

const EMOTIONAL_FRICTION_RE =
  /\b(?:discouraged|feel(?:ing)? stuck|i'?m stuck|i am stuck|overwhelm(?:ed)?|shut(?:ting)? down|can'?t focus|can'?t stay focused|cannot stay focused|trouble staying focused|can'?t get started|can'?t make myself|no motivation|not motivated|lose motivation|losing motivation|lose interest|losing interest|keep procrastinat\w*|spinning my wheels|keep starting over|starting over again|know what to do but (?:can'?t|won'?t)|distracted|getting distracted|keep getting distracted|losing momentum|can'?t stay consistent|not consistent|avoid(?:ing)?|refus(?:e|ing) to stay on)\b/i;

const TASK_ORIENTED_OPENER_RE =
  /\b(?:i need to|i want to|i have to|i need help|help me)\s+(?:work on|finish(?:ing)?|complete(?:ing)?|writ(?:e|ing)|build(?:ing)?|draft(?:ing)?|focus on|make progress on|with)\b/i;

const CRISIS_DISTRESS_RE =
  /\b(?:can'?t catch (?:my )?breath|breathless|panicking|panic attack|having a panic|need to calm down|calm me down|help me calm)\b/i;

const ACKNOWLEDGMENT =
  "That can be really frustrating. Many ADHD brains don't struggle because they don't care — they struggle because attention, motivation, and activation don't always show up when needed.";

const CATEGORY_QUESTIONS: Record<AdhdEmotionalFrictionCategory, string> = {
  activation:
    "Does this usually happen because getting started is hard, or because staying focused is hard?",
  overwhelm:
    "Does the task feel too big, or is it hard to decide where to begin?",
  motivation:
    "Do you lose interest quickly, or is it difficult to start in the first place?",
  distraction:
    "Are you getting pulled away by other things, or is your brain simply refusing to stay on the task?",
};

/** Situation A — user named a concrete task; move into planning/focus/help. */
export function isTaskFirstTurn(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return TASK_ORIENTED_OPENER_RE.test(t);
}

export function classifyAdhdEmotionalFrictionCategory(
  text: string,
): AdhdEmotionalFrictionCategory {
  const t = text.trim();
  if (
    /\b(?:overwhelm(?:ed)?|shut(?:ting)? down|too (?:big|much)|can'?t handle)\b/i.test(
      t,
    )
  ) {
    return "overwhelm";
  }
  if (
    /\b(?:motivation|discouraged|lose interest|losing interest|not motivated|no motivation)\b/i.test(
      t,
    )
  ) {
    return "motivation";
  }
  if (
    /\b(?:distract\w*|stay focused|stay on task|spinning my wheels|momentum|can'?t focus|can'?t stay focused|refus(?:e|ing) to stay on)\b/i.test(
      t,
    )
  ) {
    return "distraction";
  }
  return "activation";
}

/** Situation B — emotional friction before task selection. */
export function isAdhdEmotionalFrictionTurn(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (CRISIS_DISTRESS_RE.test(t)) return false;
  if (isTaskFirstTurn(t)) return false;
  return EMOTIONAL_FRICTION_RE.test(t);
}

export function buildAdhdEmotionalFrictionReply(text: string): string {
  const category = classifyAdhdEmotionalFrictionCategory(text);
  return [ACKNOWLEDGMENT, "", CATEGORY_QUESTIONS[category]].join("\n");
}

export function adhdEmotionalFrictionHintForChat(text: string): string {
  const category = classifyAdhdEmotionalFrictionCategory(text);
  return [
    "ADHD EMOTIONAL FRICTION (P0.23):",
    "Acknowledge the struggle briefly first. Ask ONE clarifying question. Wait for the answer.",
    `Friction category: ${category}.`,
    "FORBIDDEN on first turn: What needs attention right now?, What project are you working on?, What task are you trying to finish?, Visual Thinking, Decision Compass, Create, Strategies, Focus Audio.",
    "No therapy language. No long reflection. No generic encouragement.",
  ].join("\n");
}
