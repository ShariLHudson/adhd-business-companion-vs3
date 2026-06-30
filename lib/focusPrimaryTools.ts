import type { AppSection } from "./companionUi";
import type { FocusHubAction } from "./focusHub";

export type FocusPrimaryTool = {
  id: string;
  label: string;
  description: string;
  action: FocusHubAction;
};

/** Focus™ primary tools — purpose obvious within five seconds. */
export const FOCUS_PRIMARY_TOOLS: FocusPrimaryTool[] = [
  {
    id: "clear-my-mind",
    label: "Clear My Mind",
    description: "Capture what is circling so you can breathe again.",
    action: { kind: "section", section: "brain-dump", toolId: "clear-my-mind" },
  },
  {
    id: "adapt-my-day",
    label: "Adapt My Day",
    description: "Honest check-in when the day needs a gentler shape.",
    action: { kind: "section", section: "energy", toolId: "adapt-my-day" },
  },
  {
    id: "focus-audio",
    label: "Focus Audio",
    description: "Peaceful places and calming sound when you need stillness.",
    action: { kind: "audio", categoryId: "soundscapes", toolId: "focus-audio" },
  },
  {
    id: "focus-timer",
    label: "Focus Session",
    description: "A gentle timer when you are ready to re-enter the work.",
    action: { kind: "tool", tool: "focus-timer", toolId: "focus-timer" },
  },
  {
    id: "brain-break-lounge",
    label: "Brain Break Lounge",
    description: "Light guided exercises when your mind needs a softer pace.",
    action: {
      kind: "section",
      section: "guided-exercises" as AppSection,
      toolId: "brain-break-lounge",
    },
  },
  {
    id: "quick-recharge",
    label: "Quick Recharge",
    description: "Simple resets for when your brain needs a break.",
    action: {
      kind: "section",
      section: "quick-recharge",
      toolId: "quick-recharge",
    },
  },
];
