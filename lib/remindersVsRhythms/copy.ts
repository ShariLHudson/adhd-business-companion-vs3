/**
 * Member-facing Reminders vs Rhythms guidance.
 * Core distinction (use everywhere):
 * - Reminder = remember a specific thing (usually one moment/task)
 * - Rhythm = return regularly without rigid schedule (flexible pattern)
 */

export const REMINDER_CORE =
  "A Reminder helps you remember a specific thing — usually one moment or task.";

export const RHYTHM_CORE =
  "A Rhythm helps you return to something regularly, with a flexible window — not a rigid schedule.";

export const DIFFERENCE_CUE_REMINDERS =
  "Reminders remember a specific thing. Rhythms help you return regularly, more gently.";

export const DIFFERENCE_CUE_RHYTHMS =
  "Rhythms help you return regularly with flexibility. Reminders remember a specific thing at a moment.";

export const REMINDERS_ARRIVAL = {
  title: "Reminders",
  explanation: REMINDER_CORE,
  usefulFor: [
    "A call, follow-up, or errand you don’t want to forget",
    "Something due on a date or at a time",
    "A one-time nudge — or a repeating reminder when the moment matters",
  ],
  example: {
    label: "Example",
    text: "Call the accountant Thursday at 2:00.",
  },
  primaryCta: "Add a Reminder",
  secondaryCta: "How Different From Rhythms",
} as const;

export const RHYTHMS_ARRIVAL = {
  title: "Rhythms",
  explanation: RHYTHM_CORE,
  flexibleWindow:
    "A flexible window means “sometime in the morning,” not “exactly 7:03 or you’ve failed.” Life can move; the rhythm still fits.",
  usefulFor: [
    "Weekly review, morning planning, or a habit you want to keep lightly",
    "Something you return to often, without needing an exact clock time",
    "Patterns you can pause, skip, or gently reschedule",
  ],
  example: {
    label: "Example",
    text: "Friday finance review — sometime in the afternoon.",
  },
  primaryCta: "Create a Rhythm",
  secondaryCta: "How Different From Reminders",
} as const;

export const COMPARISON_ROWS: {
  aspect: string;
  reminder: string;
  rhythm: string;
}[] = [
  {
    aspect: "What it is",
    reminder: "Remember a specific thing",
    rhythm: "Return regularly, gently",
  },
  {
    aspect: "Timing",
    reminder: "Usually a date, time, or clear moment",
    rhythm: "A flexible window (morning, afternoon…)",
  },
  {
    aspect: "If you miss it",
    reminder: "Snooze, move, or complete when ready",
    rhythm: "Skip, pause, or resume — never “behind”",
  },
  {
    aspect: "Best when",
    reminder: "You need the thing itself remembered",
    rhythm: "You want an ongoing pattern without pressure",
  },
  {
    aspect: "Sound",
    reminder: "Reminder sound",
    rhythm: "Rhythm sound (softer cue)",
  },
];

export const STILL_NOT_SURE =
  "Still not sure? Answer one question and I’ll recommend Reminder or Rhythm.";

export const HELP_ME_CHOOSE_QUESTION =
  "Is this something for a specific time, or something you want to return to regularly?";

export const HELP_ME_CHOOSE_OPTIONS = [
  {
    id: "specific_time" as const,
    label: "A specific time or date",
    result: "reminder" as const,
  },
  {
    id: "flexible_repeated" as const,
    label: "Something I return to regularly",
    result: "rhythm" as const,
  },
  {
    id: "not_sure" as const,
    label: "I’m not sure yet",
    result: "clarify" as const,
  },
];

export const HELP_ME_CHOOSE_CLARIFY_QUESTION =
  "Which feels closer?";

export const HELP_ME_CHOOSE_CLARIFY_OPTIONS = [
  {
    id: "once" as const,
    label: "Once",
    result: "reminder" as const,
  },
  {
    id: "at_a_time" as const,
    label: "At a time",
    result: "reminder" as const,
  },
  {
    id: "regularly" as const,
    label: "Regularly",
    result: "rhythm" as const,
  },
  {
    id: "still_unsure" as const,
    label: "Still not sure",
    result: "unsure" as const,
  },
];

export const RHYTHMS_ARE_FLEXIBLE = {
  title: "Rhythms Are Flexible",
  body: "A rhythm is a pattern you can live with — not a streak to protect. Missing a day doesn’t mean you’ve failed. You’re never “behind.”",
  actions: [
    { id: "complete", label: "Complete", meaning: "You did this occurrence." },
    { id: "snooze", label: "Snooze", meaning: "Ask again a little later." },
    { id: "skip", label: "Skip", meaning: "Pass on this one; keep the rhythm." },
    { id: "pause", label: "Pause", meaning: "Quiet the rhythm for a while." },
    { id: "resume", label: "Resume", meaning: "Bring a paused rhythm back." },
    {
      id: "reschedule",
      label: "Reschedule",
      meaning: "Adjust when or how often it fits.",
    },
    { id: "stop", label: "Stop", meaning: "Remove it when you no longer need it." },
  ],
} as const;

export const REMINDER_ACTIONS = {
  title: "What you can do with a Reminder",
  actions: [
    { id: "complete", label: "Complete", meaning: "You’re done with it." },
    { id: "snooze", label: "Snooze", meaning: "Quiet it for a short while." },
    { id: "edit", label: "Edit", meaning: "Change what or when." },
    { id: "move", label: "Move date", meaning: "Pick a new day." },
    {
      id: "end_recurrence",
      label: "End recurrence",
      meaning: "Stop a repeating reminder from continuing.",
    },
    { id: "delete", label: "Delete", meaning: "Remove it entirely." },
  ],
} as const;

export const HOW_TO_USE_REMINDERS = {
  title: "How to Use",
  parts: [
    {
      title: "Add what you don’t want to forget",
      body: "Name the thing. A date and time are optional — add them when the moment matters.",
    },
    {
      title: "Glance at your lists",
      body: "Upcoming for one-time items, Recurring for repeats, Completed when you’re done.",
    },
    {
      title: "When it chimes",
      body: "Complete, snooze, or move it. Your Reminder sound is separate from Rhythm sounds.",
    },
  ],
  advancedTitle: "Advanced",
  advancedBody:
    "Custom repeats, notification settings, and desktop banners live below when you need them. You don’t need those to start.",
} as const;

export const HOW_TO_USE_RHYTHMS = {
  title: "How to Use",
  parts: [
    {
      title: "Name the pattern",
      body: "Give it a short name and how often you want to return — daily, weekly, or another gentle cadence.",
    },
    {
      title: "Choose a flexible window",
      body: "Morning, afternoon, evening, or an optional time. Exact clocks are optional.",
    },
    {
      title: "Live with it lightly",
      body: "Complete, skip, pause, or resume. No streaks. No shame for a quiet week.",
    },
  ],
  advancedTitle: "Advanced",
  advancedBody:
    "Custom cadences, quiet hours, and sound choices are available when you want finer control.",
} as const;

export const REMINDER_START_EXAMPLES = [
  {
    id: "call-thursday",
    title: "Call the accountant",
    hint: "Thursday afternoon",
    form: {
      title: "Call the accountant",
      dateOffsetDays: 3,
      time: "14:00",
      repeat: "none" as const,
      notes: "",
      customRepeatNote: "",
    },
  },
  {
    id: "follow-up-tomorrow",
    title: "Follow up with Susan",
    hint: "Tomorrow morning",
    form: {
      title: "Follow up with Susan",
      dateOffsetDays: 1,
      time: "10:00",
      repeat: "none" as const,
      notes: "",
      customRepeatNote: "",
    },
  },
  {
    id: "weekly-invoice",
    title: "Send weekly invoice check",
    hint: "Every Monday",
    form: {
      title: "Send weekly invoice check",
      dateOffsetDays: 0,
      time: "09:00",
      repeat: "weekly" as const,
      notes: "",
      customRepeatNote: "",
    },
  },
] as const;

export const RHYTHM_START_EXAMPLES = [
  {
    id: "morning-planning",
    title: "Morning planning",
    hint: "Daily · morning window",
    form: {
      title: "Morning planning",
      description: "A quiet start to the day",
      cadence: "daily" as const,
      window: "morning" as const,
      time: "",
    },
  },
  {
    id: "friday-finance",
    title: "Friday finance review",
    hint: "Weekly · afternoon",
    form: {
      title: "Friday finance review",
      description: "Look over money calmly",
      cadence: "weekly" as const,
      window: "afternoon" as const,
      time: "",
      weekdays: ["friday" as const],
    },
  },
  {
    id: "weekly-clear",
    title: "Weekly clear-out",
    hint: "Weekly · evening",
    form: {
      title: "Weekly clear-out",
      description: "Clear the mental clutter",
      cadence: "weekly" as const,
      window: "evening" as const,
      time: "",
      weekdays: ["sunday" as const],
    },
  },
] as const;

export const CONFIRM_REMINDER_PREFIX =
  "That sounds like a Reminder — something specific to remember.";

export const CONFIRM_RHYTHM_PREFIX =
  "That sounds like a Rhythm — something to return to regularly, with room to flex.";

export const UNSURE_FALLBACK =
  "Either can work. If there’s a clear moment, start with a Reminder. If it’s an ongoing pattern, start with a Rhythm. You can always change later.";
