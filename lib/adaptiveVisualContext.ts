import type { AppSection } from "@/lib/companionUi";

export type AdaptiveVisualContext =
  | "support"
  | "recovery"
  | "focus"
  | "celebration"
  | "planning";

export function resolveAdaptiveVisualContext(input: {
  activeSection: AppSection;
  workspacePanel: AppSection | null;
  companionStandaloneSection: AppSection | null;
  focusMode?: boolean;
  recoveryMode?: boolean;
}): AdaptiveVisualContext {
  if (input.recoveryMode) return "recovery";
  if (
    input.focusMode ||
    input.companionStandaloneSection === "focus-timer" ||
    input.companionStandaloneSection === "focus" ||
    input.companionStandaloneSection === "focus-audio" ||
    input.companionStandaloneSection === "breathe" ||
    input.workspacePanel === "focus-timer" ||
    input.workspacePanel === "focus" ||
    input.workspacePanel === "focus-audio"
  ) {
    return "focus";
  }

  const section =
    input.companionStandaloneSection ??
    input.workspacePanel ??
    input.activeSection;

  if (
    section === "plan-my-day" ||
    section === "time-block" ||
    section === "today" ||
    section === "energy"
  ) {
    return "planning";
  }
  if (section === "progress" || section === "wins-this-week") {
    return "celebration";
  }
  if (
    section === "breathe" ||
    section === "playbook" ||
    section === "spin-wheel"
  ) {
    return "recovery";
  }
  return "support";
}
