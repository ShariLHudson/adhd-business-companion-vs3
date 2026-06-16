/** Guided focus session — setup steps and debrief options. */

export type FocusSessionSetup = {
  focusItem: string;
  doneEnough: string;
  prepNote: string;
  minutes: number;
};

export type FocusDebriefOutcome =
  | "done"
  | "progress"
  | "another-round"
  | "stuck";

export const FOCUS_SETUP_STEPS = [
  {
    id: "focus" as const,
    question: "What do you want to focus on?",
    placeholder: "One clear task — e.g. draft the intro email",
  },
  {
    id: "done-enough" as const,
    question: "What would be enough for this session?",
    placeholder: "Done enough looks like…",
  },
  {
    id: "prep" as const,
    question: "Do you need anything before you start?",
    placeholder: "Water, close tabs, open the file — or “I'm good”",
  },
  {
    id: "duration" as const,
    question: "How long do you want?",
    placeholder: "",
  },
];

export const FOCUS_DEBRIEF_OPTIONS: {
  id: FocusDebriefOutcome;
  label: string;
  emoji: string;
}[] = [
  { id: "done", label: "Done", emoji: "✅" },
  { id: "progress", label: "Made progress", emoji: "📈" },
  { id: "another-round", label: "Need another round", emoji: "🔁" },
  { id: "stuck", label: "Got stuck", emoji: "🧱" },
];

export function focusDebriefMessage(outcome: FocusDebriefOutcome): string {
  switch (outcome) {
    case "done":
      return "Nice — you closed the loop on that session.";
    case "progress":
      return "Progress counts. You moved the needle.";
    case "another-round":
      return "Want another round? Set up a fresh block when you're ready.";
    case "stuck":
      return "Getting stuck happens. Want to talk it through with Shari?";
  }
}
