export const STORAGE_KEYS = {
  todayFocus: "adhd-companion.todayFocus",
  tomorrowStart: "adhd-companion.tomorrowStart",
};

export const START_STYLE_OPTIONS = [
  {
    id: "gentle-restart",
    emoji: "🌱",
    label: "Gentle Restart",
    description: "Ease into the day.",
  },
  {
    id: "focus-session",
    emoji: "⚡",
    label: "Focus Session",
    description: "Jump into focused work.",
  },
  {
    id: "ceo-strategy",
    emoji: "🎯",
    label: "CEO Strategy",
    description: "Plan priorities before executing.",
  },
  {
    id: "brain-dump",
    emoji: "🧠",
    label: "Brain Dump",
    description: "Clear your mind first.",
  },
  {
    id: "recovery-mode",
    emoji: "🛟",
    label: "Recovery Mode",
    description: "A lighter day with support.",
  },
  {
    id: "continue-where-left-off",
    emoji: "🔄",
    label: "Continue Where I Left Off",
    description: "Resume today's work and momentum.",
  },
  {
    id: "my-own-plan",
    emoji: "✏️",
    label: "My Own Plan",
    description: "Leave a note for tomorrow.",
    requiresNote: true,
  },
  {
    id: "decide-tomorrow",
    emoji: "🤔",
    label: "Decide Tomorrow",
    description: "Skip planning tomorrow's start.",
  },
];

export const MY_OWN_PLAN_PROMPT = "What would you like to remember for tomorrow?";

export const MY_OWN_PLAN_EXAMPLES = [
  "Finish sales page.",
  "Call prospects.",
  "Review onboarding notes.",
];

export function findStartStyle(id) {
  return START_STYLE_OPTIONS.find((option) => option.id === id) ?? null;
}

export function normalizePlanNote(note) {
  return typeof note === "string" ? note.trim() : "";
}

export function validateTomorrowStartSelection(selection) {
  const option = findStartStyle(selection?.id);

  if (!option) {
    return "Choose how you would like to begin tomorrow.";
  }

  if (option.requiresNote && normalizePlanNote(selection.note).length === 0) {
    return "Add a note for tomorrow or choose another start style.";
  }

  return "";
}

export function createTomorrowStartSelection({ id, note = "", todayFocus = "" }) {
  const option = findStartStyle(id);

  if (!option) {
    throw new Error(`Unknown tomorrow start style: ${id}`);
  }

  const selection = {
    id: option.id,
    label: option.label,
    selectedAt: new Date().toISOString(),
  };

  if (option.requiresNote) {
    selection.note = normalizePlanNote(note);
  }

  if (option.id === "continue-where-left-off") {
    selection.todayFocus = normalizePlanNote(todayFocus);
  }

  return selection;
}

export function buildNextMorningReminder(selection) {
  const option = findStartStyle(selection?.id);

  if (!option) {
    return "";
  }

  if (option.id === "continue-where-left-off") {
    const focus = normalizePlanNote(selection.todayFocus);
    return focus
      ? `Continue where you left off: ${focus}`
      : "Continue where you left off and pick up today's momentum.";
  }

  if (option.id === "my-own-plan") {
    return `Your plan for this morning: ${normalizePlanNote(selection.note)}`;
  }

  if (option.id === "decide-tomorrow") {
    return "You chose to decide how to begin when tomorrow arrives.";
  }

  return `${option.label}: ${option.description}`;
}
