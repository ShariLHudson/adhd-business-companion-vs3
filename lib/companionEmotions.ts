export type EmotionalState =
  | "stuck"
  | "overwhelmed"
  | "unclear"
  | "focused"
  | "building"
  | "emotional";

export type UserIntent = "do" | "think" | "create" | "organize" | "reset";

export const EMOTION_LABELS: Record<EmotionalState, string> = {
  stuck: "STUCK — can't start, frozen, or procrastinating",
  overwhelmed: "OVERWHELMED — too much, mental clutter, emotional load",
  unclear: "UNCLEAR — vague input, no clear direction yet",
  focused: "FOCUSED — wants execution, time blocking, doing now",
  building: "BUILDING — creating, writing, planning something",
  emotional:
    "EMOTIONAL DISTRESS — sad, anxious, frustrated, tired, needs grounding",
};

export const STATE_HEADERS: Record<EmotionalState, string> = {
  stuck: "You seem stuck — let's loosen things up first",
  overwhelmed: "You seem overwhelmed — let's slow this down",
  unclear: "Let's get clear on what you need",
  focused: "You're in focus mode — want to start a timer?",
  building: "You're building something — let's open the right space",
  emotional: "I hear you — let's ground first, then one small step",
};

/** v4 presence header — one warm emotion line only */
export const PRESENCE_LINES: Record<EmotionalState, string> = {
  overwhelmed: "Let's slow this down",
  stuck: "We can sort this together",
  unclear: "I'm here — tell me what's going on",
  focused: "You seem focused today",
  building: "Let's bring your idea to life",
  emotional: "You're not alone in this",
};

export const STATE_PLACEHOLDERS: Record<EmotionalState, string> = {
  stuck: "What's feeling hard to start?",
  overwhelmed: "What feels heavy right now?",
  unclear: "What's on your mind?",
  focused: "What are you working on?",
  building: "What are you creating?",
  emotional: "What's weighing on you?",
};

export const INTENT_LABELS: Record<UserIntent, string> = {
  do: "INTENT: DO — execute, start, finish a task",
  think: "INTENT: THINK — process, reflect, sort thoughts",
  create: "INTENT: CREATE — write, draft, build content",
  organize: "INTENT: ORGANIZE — structure, plan, break down",
  reset: "INTENT: RESET — fresh start, clear head, begin again",
};

export function detectEmotionalState(
  text: string,
  context: { lastTask?: string | null } = {},
): EmotionalState {
  const t = text.trim().toLowerCase();
  const source = t || (context.lastTask?.toLowerCase() ?? "");

  if (!source) return "unclear";

  if (
    /\b(sad|anxious|anxiety|frustrated|frustrating|tired|exhausted|lonely|scared|worried|upset|cry|crying|hopeless|drained|low energy|can't cope emotionally)\b/.test(
      source,
    )
  ) {
    return "emotional";
  }

  if (
    /\b(overwhelm|overwhelmed|too much|so much|mental clutter|brain is full|drowning|stressed out|frazzled|everything at once|spinning|burned out|burnt out)\b/.test(
      source,
    )
  ) {
    return "overwhelmed";
  }

  if (
    /\b(stuck|can't start|cannot start|procrastinat|frozen|freeze|where to begin|don't know where to start|paralyzed|avoiding|putting off|haven't started|can't get started)\b/.test(
      source,
    )
  ) {
    return "stuck";
  }

  if (
    /\b(pomodoro|focus block|time block|deep work|concentrate|get started|start working|do this now|execute|25 min|timer|distraction|need to focus|focused)\b/.test(
      source,
    )
  ) {
    return "focused";
  }

  if (
    /\b(write|draft|email|create|build|plan|playbook|proposal|newsletter|marketing|content|strategy|document|letter|blog|copy|structure)\b/.test(
      source,
    )
  ) {
    return "building";
  }

  if (
    t.length < 18 ||
    /^(hi|hey|hello|help|idk|not sure|unsure|umm+|hmm+)\b/.test(t) ||
    /\b(not sure|don't know|unclear|confused|what should i|where do i)\b/.test(t)
  ) {
    return "unclear";
  }

  return "unclear";
}

export function detectUserIntent(
  text: string,
  state: EmotionalState,
): UserIntent {
  const t = text.trim().toLowerCase();

  if (
    /\b(reset|fresh start|start over|clear (my )?head|begin again|new day)\b/.test(
      t,
    ) ||
    state === "overwhelmed"
  ) {
    return "reset";
  }
  if (
    /\b(write|draft|email|create|build|content|playbook|proposal|blog)\b/.test(
      t,
    ) ||
    state === "building"
  ) {
    return "create";
  }
  if (
    /\b(organize|sort|structure|plan|break down|list|prioritize|steps)\b/.test(t)
  ) {
    return "organize";
  }
  if (
    /\b(do|start|finish|complete|get done|execute|work on|focus on)\b/.test(t) ||
    state === "focused"
  ) {
    return "do";
  }
  if (
    /\b(think|feel|process|reflect|figure out|unsure|confused)\b/.test(t) ||
    state === "unclear" ||
    state === "emotional"
  ) {
    return "think";
  }

  return "think";
}

export const CLARIFYING_QUESTIONS = [
  "What's weighing on you most — getting started, too much at once, or creating something?",
  "Are you trying to do a task, clear your head, or build something?",
  "What's the one thing you wish felt easier right now?",
];

export function pickClarifyingQuestion(text: string): string {
  const idx = text.length % CLARIFYING_QUESTIONS.length;
  return CLARIFYING_QUESTIONS[idx];
}

export function getTimeTone(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export function isReturningUser(updatedAt: string | null): boolean {
  if (!updatedAt) return false;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 7 * 24 * 60 * 60 * 1000;
}
