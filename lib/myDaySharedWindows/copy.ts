/**
 * Shared My Day windows — member-facing copy (103–105).
 */

export const PLAN_ADAPT_WINDOW_TITLE = "Plan My Day / Adapt My Day";
export const REMINDERS_RHYTHMS_WINDOW_TITLE = "Reminders / Rhythms";

export const PLAN_MY_DAY_ITEM = {
  id: "plan" as const,
  label: "Plan My Day",
  description:
    "Build a realistic plan for your day from where you are starting now.",
  supports: [
    "reviewing commitments",
    "choosing priorities",
    "estimating available time",
    "deciding what realistically fits",
    "placing tasks into the day",
    "creating a starting plan",
  ] as const,
  openLabel: "Open Plan My Day",
};

export const ADAPT_MY_DAY_ITEM = {
  id: "adapt" as const,
  label: "Adapt My Day",
  description:
    "Adjust the plan you already have when your energy, motivation, time, or priorities change.",
  supports: [
    "low energy",
    "low motivation",
    "interruptions",
    "changing priorities",
    "falling behind",
    "reduced time",
    "reshaping the current day without starting over",
  ] as const,
  openLabel: "Open Adapt My Day",
};

export const REMINDER_ITEM = {
  id: "reminders" as const,
  label: "Reminders",
  description:
    "Use a reminder for one specific thing you need to remember at a certain time or on a certain day.",
  examples: [
    "Call Sarah tomorrow at 10:00",
    "Send the proposal Friday",
    "Take medication at 8:00 tonight",
    "Follow up with a client next Tuesday",
  ],
};

export const RHYTHM_ITEM = {
  id: "rhythms" as const,
  label: "Rhythms",
  description:
    "Use a rhythm for something you want gentle, recurring support with over time.",
  examples: [
    "Weekly business review",
    "Morning planning",
    "Friday client follow-up",
    "Monthly finances",
    "A regular movement or hydration check-in",
  ],
};

/** Visible without opening How Do I… */
export const REMINDER_VS_RHYTHM_DIFFERENCE =
  "A reminder helps you remember one specific action. A rhythm helps you return to something repeatedly over time.";

export const REMINDER_VS_RHYTHM_BULLETS = [
  "Reminder = specific event or task",
  "Rhythm = recurring pattern or practice",
  "Reminder asks: “What do I need to remember?”",
  "Rhythm asks: “What do I want support returning to?”",
] as const;

export const PLAN_ADAPT_HOW_DO_I = [
  "Use Plan My Day when you are beginning or intentionally organizing the day — review commitments, choose priorities, estimate time, and place what fits.",
  "Use Adapt My Day when a plan already exists but energy, motivation, interruptions, or priorities changed. Energy and motivation stay separate inputs.",
  "Switch anytime with the two choices at the top of this window. Your current plan stays available while you adapt.",
].join("\n\n");

export const REMINDERS_RHYTHMS_HOW_DO_I = [
  "Use a reminder for one specific thing to remember (often with a date or time). Complete, snooze, skip, or reschedule when you need to.",
  "Use a rhythm for something you want to return to over time — flexible cadence, not a rigid schedule. Pause, resume, skip, or adjust without treating the whole rhythm as failed.",
  "If you miss a recurring item, you are not behind — skip or gently resume when you are ready.",
].join("\n\n");
