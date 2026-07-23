/**
 * Chamber Understanding-First Gate™
 *
 * Before any Chamber member answers, they silently:
 *   1. Hear the whole turn (not the first keyword)
 *   2. Understand situation, goal, and friction
 *   3. Choose the kind of help that fits
 *   4. Pass the coffee test — would a trusted human say this?
 *
 * Philosophy: Before Shari chooses an answer, she chooses to understand.
 * CIE / Topic Anchor / HCV support this gate — they do not replace it.
 */

export type ChamberHelpMode =
  | "listen_question"
  | "answer"
  | "explain"
  | "reassure"
  | "brainstorm"
  | "challenge"
  | "teach"
  | "research";

export type ChamberUnderstanding = {
  /** Plain-language read of what is happening. */
  situation: string;
  /** What they seem to be trying to accomplish. */
  goal: string;
  /** What appears to make this difficult (or null if unclear). */
  friction: string | null;
  /** 0–1 confidence we understood enough to advise. */
  understandingConfidence: number;
  /** Natural help mode for this turn. */
  helpMode: ChamberHelpMode;
  /** One-line silent coach note (never shown to member). */
  silentNote: string;
};

export type CoffeeTestResult = {
  passed: boolean;
  reason: string | null;
};

const KEYWORD_JUMP_RE =
  /\b(?:conflict|boundary|funnel|seo|branding|positioning|pricing|retention|churn|crm|kpi|roi)\b/i;

const CLEAR_DECISION_QUESTION_RE =
  /\b(?:should i|do i|can i|would you|what(?:'s| is) better|which|launch everything|all at once|or release|compare|trade-?off)\b/i;

/**
 * Member already named what they want — acknowledge and advance; do not
 * force exploratory questions that make them restate the objective.
 */
const CLEAR_OBJECTIVE_RE =
  /\b(?:i (?:want|need|have) to|i(?:'m| am) trying to|i(?:'d| would) like to|my goal is|help me|i need help|can you help(?: me)?|how (?:do|can|should) i|what should i|please (?:help|advise|recommend)|looking to|trying to (?:decide|figure|choose|launch|write|build|fix|grow|sell|price|hire)|i(?:'m| am) (?:deciding|choosing) (?:between|whether))\b/i;

const SITUATION_SHARE_RE =
  /\b(?:i have|i(?:'m| am)|my client|she|he|they|won'?t|doesn'?t|keeps|always|never|stuck|frustrated|trying to)\b/i;

/** True when the member already stated a clear objective or decision ask. */
export function hasClearObjective(text: string): boolean {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (CLEAR_DECISION_QUESTION_RE.test(t)) return true;
  if (CLEAR_OBJECTIVE_RE.test(t)) return true;
  // Imperative asks with enough substance: "Write a launch plan for…"
  if (
    /^(?:please\s+)?(?:help|write|draft|build|fix|plan|choose|decide|compare|launch|price|hire)\b/i.test(
      t,
    ) &&
    t.split(/\s+/).length >= 6
  ) {
    return true;
  }
  return false;
}

const PREMATURE_ADVICE_RE =
  /\b(?:you (?:should|need to)|here(?:'s| are) (?:a |the )?(?:plan|framework|steps|options)|the (?:solution|answer) is|first,? (?:you|we) (?:should|need))\b/i;

const AI_SHELL_RE =
  /\b(?:as an ai|great question|let(?:'s| us) (?:dive|unpack|explore)|i hear you|here(?:'s| is) a breakdown)\b/i;

function lastUserTurns(
  messages: readonly { role: string; content: string }[],
  userText: string,
  limit = 4,
): string[] {
  const users = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())
    .filter(Boolean);
  if (!users.length || users[users.length - 1] !== userText.trim()) {
    users.push(userText.trim());
  }
  return users.slice(-limit);
}

function inferGoal(text: string): string {
  const t = text.trim();
  if (CLEAR_DECISION_QUESTION_RE.test(t)) {
    return "choose between options or decide a next move";
  }
  if (hasClearObjective(t)) {
    return "move forward on the objective they already stated";
  }
  if (/\bwon'?t follow through|doesn'?t follow through|not following through\b/i.test(t)) {
    return "figure out whether and how to keep helping this client";
  }
  if (/\bhow (?:do|can|should) i\b/i.test(t)) {
    return "learn a practical way forward in this specialty";
  }
  if (/\bwhy\b/i.test(t)) {
    return "understand what is going on";
  }
  if (SITUATION_SHARE_RE.test(t) && !/\?/.test(t)) {
    return "be heard and get oriented before deciding anything";
  }
  return "get useful help on what they just shared";
}

function inferFriction(text: string): string | null {
  if (/\bwon'?t follow through|doesn'?t follow through\b/i.test(text)) {
    return "the other person is not doing what they agreed to";
  }
  if (/\bstuck|overwhelm|too many|can'?t decide|torn\b/i.test(text)) {
    return "too many options or not enough clarity to move";
  }
  if (/\bclient|customer\b/i.test(text) && /\bfrustrat|angry|upset|tired\b/i.test(text)) {
    return "emotional strain in a client relationship";
  }
  if (/\blaunch|feature|release\b/i.test(text)) {
    return "uncertainty about pacing and focus";
  }
  return null;
}

function inferSituation(text: string, priorUsers: string[]): string {
  const whole = [...priorUsers.slice(0, -1), text].join(" ").trim();
  if (/\bclient\b/i.test(whole) && /\bfollow through\b/i.test(whole)) {
    return "a client relationship where follow-through has broken down";
  }
  if (/\blaunch|feature|release\b/i.test(whole)) {
    return "a launch or release pacing decision";
  }
  if (whole.length > 160) {
    return "a multi-part situation they have been describing across turns";
  }
  return "what they just brought into this conversation";
}

/**
 * Silent understanding pass — never shown to the member.
 * Listens to the whole recent thread, not the first keyword.
 */
export function understandChamberTurn(input: {
  userText: string;
  messages?: readonly { role: string; content: string }[];
  specialistId?: string | null;
}): ChamberUnderstanding {
  const userText = input.userText.trim();
  const priorUsers = lastUserTurns(input.messages ?? [], userText);
  const wholeUserContext = priorUsers.join("\n");
  const situation = inferSituation(userText, priorUsers);
  const goal = inferGoal(wholeUserContext);
  const friction = inferFriction(wholeUserContext);

  const clearObjective =
    hasClearObjective(userText) || hasClearObjective(wholeUserContext);
  const clearQuestion =
    CLEAR_DECISION_QUESTION_RE.test(userText) ||
    /\?/.test(userText) ||
    clearObjective;
  const situationShare =
    SITUATION_SHARE_RE.test(userText) &&
    !CLEAR_DECISION_QUESTION_RE.test(userText) &&
    !clearObjective;
  const thinContext =
    userText.split(/\s+/).length < 12 && situationShare && !clearObjective;
  const threadThin = priorUsers.length <= 1 && situationShare && !clearObjective;

  let understandingConfidence = 0.45;
  if (clearObjective) understandingConfidence = 0.84;
  if (clearQuestion && userText.split(/\s+/).length >= 10) understandingConfidence = 0.82;
  if (clearObjective && userText.split(/\s+/).length >= 8) understandingConfidence = 0.88;
  if (priorUsers.length >= 3 && clearQuestion) understandingConfidence = 0.9;
  if (thinContext || threadThin) understandingConfidence = 0.28;
  if (friction && clearQuestion) understandingConfidence = Math.max(understandingConfidence, 0.75);

  let helpMode: ChamberHelpMode = "answer";
  // Clear objective wins: acknowledge + advance — never force restating.
  if (clearObjective) {
    if (/\bhow (?:do|can|should) i\b/i.test(userText)) {
      helpMode = "teach";
    } else if (/\bwhy\b/i.test(userText) && /\?/.test(userText)) {
      helpMode = "explain";
    } else if (/\bidea|brainstorm|options\b/i.test(userText)) {
      helpMode = "brainstorm";
    } else {
      helpMode = "answer";
    }
  } else if (
    understandingConfidence < 0.55 ||
    thinContext ||
    (situationShare && !clearQuestion)
  ) {
    helpMode = "listen_question";
  } else if (/\bwhy\b/i.test(userText) && clearQuestion) {
    helpMode = "explain";
  } else if (/\bhow (?:do|can|should) i\b/i.test(userText)) {
    helpMode = "teach";
  } else if (/\bidea|brainstorm|options\b/i.test(userText)) {
    helpMode = "brainstorm";
  } else if (/\bfrustrat|tired|upset|hard\b/i.test(userText) && !clearQuestion) {
    helpMode = "reassure";
  } else if (CLEAR_DECISION_QUESTION_RE.test(userText)) {
    helpMode = "answer";
  }

  const silentNote = [
    `situation=${situation}`,
    `goal=${goal}`,
    `friction=${friction ?? "unclear"}`,
    `help=${helpMode}`,
    `confidence=${understandingConfidence.toFixed(2)}`,
    `specialist=${input.specialistId ?? "chamber"}`,
  ].join("; ");

  return {
    situation,
    goal,
    friction,
    understandingConfidence,
    helpMode,
    silentNote,
  };
}

/**
 * Coffee test: would a trusted human say this over coffee?
 * Technical correctness is not enough — it must sound human.
 */
export function coffeeTestChamberReply(input: {
  userText: string;
  responseText: string;
  understanding: ChamberUnderstanding;
}): CoffeeTestResult {
  const text = input.responseText.trim();
  if (!text) {
    return { passed: false, reason: "empty_reply" };
  }
  if (AI_SHELL_RE.test(text)) {
    return { passed: false, reason: "ai_shell" };
  }
  // Keyword jump: user shared a situation; reply leapt to a label/framework
  if (
    input.understanding.helpMode === "listen_question" &&
    PREMATURE_ADVICE_RE.test(text)
  ) {
    return { passed: false, reason: "premature_advice" };
  }
  if (
    input.understanding.helpMode === "listen_question" &&
    KEYWORD_JUMP_RE.test(text) &&
    !/\?/.test(text) &&
    text.split(/\s+/).length > 40
  ) {
    return { passed: false, reason: "keyword_jump" };
  }
  // Stacked interrogation feels like a form, not coffee
  if ((text.match(/\?/g) ?? []).length >= 2) {
    return { passed: false, reason: "stacked_questions" };
  }
  // Pure framework dump with no human acknowledgement on a situation share
  // (skip when they already stated a clear objective — answer may be structured)
  if (
    SITUATION_SHARE_RE.test(input.userText) &&
    !hasClearObjective(input.userText) &&
    !CLEAR_DECISION_QUESTION_RE.test(input.userText) &&
    /\b(?:step 1|framework|here are \d+|first,|second,|third,)\b/i.test(text) &&
    !/\?/.test(text)
  ) {
    return { passed: false, reason: "framework_dump" };
  }
  return { passed: true, reason: null };
}

/**
 * Natural listen/question reply when understanding is incomplete.
 * Specialty-aware, not reflective coaching therapy-speak.
 */
export function buildChamberUnderstandingReply(input: {
  userText: string;
  understanding: ChamberUnderstanding;
  specialistLabel?: string | null;
}): string {
  const t = input.userText.trim();
  const who = input.specialistLabel?.trim() || "this";

  if (/\bwon'?t follow through|doesn'?t follow through|not following through\b/i.test(t)) {
    return (
      "That sounds frustrating. " +
      "Before we decide what to do next — are you trying to get her back on track, " +
      "or figuring out whether you can keep helping her at all?"
    );
  }

  if (
    /\bclient\b/i.test(t) &&
    /\b(?:frustrat|stuck|hard|difficult|won'?t|doesn'?t)\b/i.test(t)
  ) {
    return (
      "Tell me a little more about what's going on with them. " +
      "What were you hoping would happen that isn't?"
    );
  }

  if (input.understanding.helpMode === "reassure") {
    return (
      "That makes sense this feels heavy. " +
      "What part of it do you most want help with right now?"
    );
  }

  if (input.understanding.friction) {
    return (
      `I want to make sure I understand before I advise from ${who}'s lens. ` +
      `What's the part that feels most stuck — ${input.understanding.friction}?`
    );
  }

  return (
    "I want to understand the whole picture before I jump in. " +
    "What are you most trying to get clear on?"
  );
}

/** Prompt block injected so the model hears understanding-first discipline. */
export function chamberUnderstandingPromptBlock(
  understanding: ChamberUnderstanding,
): string {
  return [
    "UNDERSTANDING-FIRST GATE (BINDING — silent, then respond):",
    "Before you say anything, silently:",
    `1. Hear the whole situation: ${understanding.situation}`,
    `2. Goal: ${understanding.goal}`,
    `3. Friction: ${understanding.friction ?? "not yet clear — do not invent it"}`,
    `4. Help that fits this turn: ${understanding.helpMode}`,
    `5. Understanding confidence: ${understanding.understandingConfidence.toFixed(2)}`,
    "",
    "Rules:",
    "- Do NOT stop at the first keyword or first emotion.",
    "- Do NOT decide the topic too quickly.",
    "- Never invent hidden psychological meaning.",
    understanding.helpMode === "listen_question"
      ? "- This turn needs understanding first: one natural acknowledgement + one thoughtful specialty question. Do not dump frameworks yet."
      : "- You understand enough to help: briefly acknowledge their objective, then answer from your specialty and move the work forward. Do not ask them to restate what they already said.",
    "- Coffee test: if a trusted human would not say this over coffee, rewrite before sending.",
  ].join("\n");
}

/**
 * Apply understanding gate to a drafted Chamber reply.
 * May replace a keyword-jump draft with a natural listen/question response.
 */
export function applyChamberUnderstandingGate(input: {
  userText: string;
  draftText: string;
  messages?: readonly { role: string; content: string }[];
  specialistId?: string | null;
  specialistLabel?: string | null;
}): {
  text: string;
  understanding: ChamberUnderstanding;
  coffee: CoffeeTestResult;
  regenerated: boolean;
} {
  const understanding = understandChamberTurn({
    userText: input.userText,
    messages: input.messages,
    specialistId: input.specialistId,
  });

  let text = input.draftText.trim();
  let regenerated = false;
  const objectiveClear = hasClearObjective(input.userText);

  if (understanding.helpMode === "listen_question" && !objectiveClear) {
    const coffee = coffeeTestChamberReply({
      userText: input.userText,
      responseText: text,
      understanding,
    });
    if (!coffee.passed || PREMATURE_ADVICE_RE.test(text) || !/\?/.test(text)) {
      text = buildChamberUnderstandingReply({
        userText: input.userText,
        understanding,
        specialistLabel: input.specialistLabel,
      });
      regenerated = true;
    }
  }

  const coffee = coffeeTestChamberReply({
    userText: input.userText,
    responseText: text,
    understanding,
  });

  // Never replace a clear-objective turn with "tell me more / what are you trying…"
  if (!coffee.passed && !objectiveClear && understanding.helpMode === "listen_question") {
    text = buildChamberUnderstandingReply({
      userText: input.userText,
      understanding,
      specialistLabel: input.specialistLabel,
    });
    regenerated = true;
  }

  return {
    text,
    understanding,
    coffee: coffeeTestChamberReply({
      userText: input.userText,
      responseText: text,
      understanding,
    }),
    regenerated,
  };
}
