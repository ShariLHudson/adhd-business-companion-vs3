import type { CoachingMode } from "./companionPrompt";

export type Situation =
  | "daily_task"
  | "focus_execution"
  | "create_content"
  | "track_progress"
  | "overwhelmed"
  | "general";

export function detectSituation(text: string): Situation {
  const t = text.toLowerCase();

  if (
    /\b(overwhelm|overwhelmed|too much|so much|can't focus|stuck|anxious|stressed|frazzled|drowning|paralyzed|everything at once|don't know where to start|brain is full|spinning|burned out|burnt out)\b/.test(
      t,
    )
  ) {
    return "overwhelmed";
  }
  if (
    /\b(email|e-mail|write|draft|newsletter|marketing|content|strategy|playbook|proposal|blog|copy|print|document|letter|pitch|social post|caption|script)\b/.test(
      t,
    )
  ) {
    return "create_content";
  }
  if (
    /\b(pomodoro|timer|focus block|time block|concentrate|get started|start working|deep work|distraction)\b/.test(
      t,
    )
  ) {
    return "focus_execution";
  }
  if (
    /\b(progress|done|finished|completed|track|follow.?up|reflect|what did i|log|accomplish|check off|status update)\b/.test(
      t,
    )
  ) {
    return "track_progress";
  }
  if (
    /\b(today|remind|schedule|call|meeting|todo|task|errand|need to|have to|pick up|send|reply)\b/.test(
      t,
    )
  ) {
    return "daily_task";
  }

  return "general";
}

/** Maps detected situation → best-fit system mode. */
export function routeToMode(
  text: string,
  situation: Situation = detectSituation(text),
): CoachingMode {
  const t = text.toLowerCase();
  if (
    /\b(how do i|how to|how can i|step by step|walk me through|show me how)\b/.test(
      t,
    )
  ) {
    return "how-do-i";
  }

  switch (situation) {
    case "create_content":
      return "playbook";
    case "focus_execution":
      return "focus";
    case "track_progress":
      return "progress";
    case "overwhelmed":
    case "daily_task":
    case "general":
    default:
      return "today";
  }
}

export function suggestSystemMode(
  situation: Situation,
  inputText: string,
  isIdle: boolean,
): CoachingMode | null {
  const t = inputText.trim();
  if (t) return routeToMode(t, detectSituation(t));
  if (isIdle) return "today";
  if (situation !== "general") return routeToMode("", situation);
  return null;
}

const SITUATION_ACTIONS: Record<
  Situation,
  Record<CoachingMode, string[]>
> = {
  create_content: {
    playbook: [
      "Draft this for me",
      "Format it for printing",
      "Write a clean simple version",
    ],
    today: [
      "Add this to today",
      "What's the one next step?",
      "Set a reminder to finish",
    ],
    focus: [
      "Do this in a 25-min block",
      "Start a focus session",
      "Name what I'm creating",
    ],
    progress: [
      "Log this when it's done",
      "What's the follow-up?",
      "Track completion",
    ],
    "how-do-i": [
      "Walk me through step by step",
      "What's the first step?",
      "Show me how to do this",
    ],
  },
  daily_task: {
    today: [
      "Add to today's list",
      "What's most urgent?",
      "Break into one step",
    ],
    focus: [
      "Do this in the next 10 minutes",
      "Start a focus block",
      "Help me begin now",
    ],
    playbook: [
      "Turn this into a template",
      "Structure this properly",
      "Write it out for me",
    ],
    progress: [
      "Mark this done when finished",
      "What's left after this?",
      "Set a follow-up",
    ],
    "how-do-i": [
      "Break this into steps",
      "What's step one?",
      "Walk me through it",
    ],
  },
  focus_execution: {
    focus: [
      "Start a 25-min Pomodoro",
      "Block distractions now",
      "Name my focus goal",
    ],
    today: [
      "Add to today's priorities",
      "When should I do this?",
      "One thing before I start",
    ],
    playbook: [
      "Outline what I'm working on",
      "Structure this session",
      "Draft the output first",
    ],
    progress: [
      "Log this session after",
      "What counts as done?",
      "Track my focus time",
    ],
    "how-do-i": [
      "How do I start this?",
      "Give me the steps",
      "What's the process?",
    ],
  },
  track_progress: {
    progress: [
      "What did I complete?",
      "What's the next follow-up?",
      "Log a win",
    ],
    today: [
      "Move this to today",
      "What's still open?",
      "Pick one to finish",
    ],
    focus: [
      "Do the next piece now",
      "Start a short focus block",
      "Begin the follow-up",
    ],
    playbook: [
      "Write a status update",
      "Summarize what I've done",
      "Draft the next deliverable",
    ],
    "how-do-i": [
      "How do I follow up?",
      "What are the next steps?",
      "Walk me through closing this",
    ],
  },
  overwhelmed: {
    today: [
      "One small step",
      "Help me reset",
      "Talk it through",
    ],
    focus: [
      "Just 10 minutes",
      "Name one thing only",
      "Start tiny focus block",
    ],
    playbook: [
      "Organize what's in my head",
      "Sort into a simple list",
      "Capture without pressure",
    ],
    progress: [
      "What did I already finish?",
      "Name one win",
      "What's actually done?",
    ],
    "how-do-i": [
      "What's the smallest first step?",
      "Walk me through one thing",
      "Help me pick where to start",
    ],
  },
  general: {
    today: [
      "What needs attention today?",
      "Pick my top priority",
      "Add to today's list",
    ],
    focus: [
      "Help me start now",
      "Start a focus session",
      "Do this in 10 minutes",
    ],
    playbook: [
      "Help me create this",
      "Structure it for me",
      "Draft a first version",
    ],
    progress: [
      "What's my next step?",
      "Review what I've done",
      "Set a follow-up",
    ],
    "how-do-i": [
      "How do I approach this?",
      "Give me clear steps",
      "Walk me through it",
    ],
  },
};

const MODE_FALLBACK: Record<CoachingMode, string[]> = {
  today: [
    "What needs attention right now?",
    "Add to today",
    "Name the one priority",
  ],
  focus: [
    "Start a focus block",
    "Help me begin now",
    "Block out 25 minutes",
  ],
  "how-do-i": [
    "Walk me through step by step",
    "What's the first step?",
    "Show me how",
  ],
  playbook: [
    "Draft this for me",
    "Structure this properly",
    "Write a clean version",
  ],
  progress: [
    "What's the next follow-up?",
    "Log what I've done",
    "Review my progress",
  ],
};

function normalizeForCompare(s: string) {
  return s.toLowerCase().replace(/[^\w\s]/g, "").trim();
}

/** Mode-specific action chips tied to the user's situation — not generic coaching. */
export function buildModeActions(
  mode: CoachingMode,
  situation: Situation,
  recentSuggestions: string[],
): string[] {
  const recent = new Set(recentSuggestions.map(normalizeForCompare));

  const primary = SITUATION_ACTIONS[situation][mode];
  const combined = [...primary, ...MODE_FALLBACK[mode]];

  const unique: string[] = [];
  for (const item of combined) {
    const key = normalizeForCompare(item);
    if (recent.has(key) || unique.some((u) => normalizeForCompare(u) === key)) {
      continue;
    }
    unique.push(item);
    if (unique.length >= 2) break;
  }

  return unique;
}

export const SITUATION_LABELS: Record<Situation, string> = {
  daily_task:
    "DAILY TASK — simple task, reminder, or what needs attention today",
  focus_execution:
    "FOCUS EXECUTION — needs a time block, Pomodoro, or to start working now",
  create_content:
    "CREATE CONTENT — writing, email, marketing, business communication, structured output",
  track_progress:
    "TRACK PROGRESS — reflection, completion, follow-up, or what's next",
  overwhelmed:
    "OVERWHELMED — too much at once; calm, one step, reset, or talk it through",
  general: "GENERAL — respond to their exact words and route to best mode",
};

export const MODE_ROUTE_LABELS: Record<CoachingMode, string> = {
  today: "TODAY — daily tasks and what needs attention now",
  focus: "FOCUS — real-time execution and time blocks",
  "how-do-i": "HOW DO I — step-by-step practical guidance",
  playbook: "BUSINESS PLAYBOOK — create, write, structure business content",
  progress: "PROGRESS — tracking, reflection, follow-up",
};

/** @deprecated Use detectSituation */
export function detectIntent(text: string) {
  const s = detectSituation(text);
  const map = {
    daily_task: "initiation" as const,
    focus_execution: "focus" as const,
    create_content: "learning" as const,
    track_progress: "general" as const,
    overwhelmed: "general" as const,
    general: "general" as const,
  };
  return map[s];
}

/** @deprecated Use buildModeActions */
export const buildDecisionFlows = buildModeActions;

/** @deprecated Use suggestSystemMode */
export const suggestCoachingMode = (
  situation: Situation,
  inputText: string,
  isIdle: boolean,
) => suggestSystemMode(situation, inputText, isIdle);

/** @deprecated Use SITUATION_LABELS */
export const INTENT_LABELS = SITUATION_LABELS;
