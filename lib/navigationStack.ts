/**
 * P0.46 — Navigation history snapshots and path helpers.
 * Back walks the stack LIFO; never jumps to main menu when history exists.
 */

import type { AppSection, SidebarNavId } from "./companionUi";
import type { FocusFeelingId } from "./focusHub";
import type { WorkspacePanelDetail } from "./workspaceAwareness";

export type NavigationStrategyOpenView =
  | "home"
  | "adhd"
  | "business"
  | "saved"
  | "recommended";

/** Serializable screen state restored on Back. */
export type NavigationScreenSnapshot = {
  activeSection: AppSection;
  activeNav: SidebarNavId;
  workspacePanel: AppSection | null;
  companionStandaloneSection: AppSection | null;
  workspaceDetail: WorkspacePanelDetail | null;
  focusHubFeeling: FocusFeelingId | null;
  focusAudioCategory: string | null;
  focusAudioBackLabel: string;
  strategyOpenView?: NavigationStrategyOpenView;
};

export function emptyNavigationSnapshot(
  overrides?: Partial<NavigationScreenSnapshot>,
): NavigationScreenSnapshot {
  return {
    activeSection: "home",
    activeNav: "chat",
    workspacePanel: null,
    companionStandaloneSection: null,
    workspaceDetail: null,
    focusHubFeeling: null,
    focusAudioCategory: null,
    focusAudioBackLabel: "Back",
    ...overrides,
  };
}

/** Focus hub is open beside chat (split layout). */
export function isFocusOpenBesideChat(input: {
  activeSection: AppSection;
  workspacePanel: AppSection | null;
  companionStandaloneSection: AppSection | null;
}): boolean {
  if (input.activeSection !== "home") return false;
  return (
    input.workspacePanel === "focus" ||
    input.companionStandaloneSection === "focus"
  );
}

/** Route focus-audio beside chat instead of full-page section switch. */
export function shouldOpenFocusAudioBesideChat(input: {
  activeSection: AppSection;
  workspacePanel: AppSection | null;
  companionStandaloneSection: AppSection | null;
}): boolean {
  return isFocusOpenBesideChat(input);
}

export function focusAudioBackLabelForContext(input: {
  focusHubFeeling: FocusFeelingId | null;
  fromFocusBeside: boolean;
}): string {
  if (input.focusHubFeeling === "need-break") return "I Need A Break";
  if (input.fromFocusBeside) return "Focus";
  return "Back";
}

/** QA matrix — each path must unwind via Back without jumping to main menu. */
export const NAVIGATION_TEST_MATRIX: {
  id: string;
  steps: string[];
  backExpectations: string[];
}[] = [
  {
    id: "focus-need-break-calm-audio",
    steps: ["Focus", "I Need A Break", "Audio", "Calm Audio"],
    backExpectations: [
      "I Need A Break",
      "Focus feelings hub",
      "previous workspace",
    ],
  },
  {
    id: "focus-need-break-audio-variants",
    steps: [
      "Focus → I Need A Break → Audio → Calm",
      "Focus → I Need A Break → Audio → Focus",
      "Focus → I Need A Break → Audio → Nature",
      "Focus → I Need A Break → Audio → Sleep",
    ],
    backExpectations: ["Each opens the selected audio player, not Focus hub"],
  },
  {
    id: "projects-drill-down",
    steps: ["Projects", "Project detail", "Assets section"],
    backExpectations: ["Project detail", "Projects list", "previous workspace"],
  },
  {
    id: "my-work-projects",
    steps: ["Other", "My Work", "Projects", "Project detail"],
    backExpectations: ["Projects list", "My Work hub", "Other"],
  },
  {
    id: "templates-library-drill",
    steps: ["Templates", "Template detail", "Edit draft"],
    backExpectations: ["Templates list", "previous workspace"],
  },
  {
    id: "snippets-library-drill",
    steps: ["Snippets", "Snippet detail", "Edit draft"],
    backExpectations: ["Snippets list", "previous workspace"],
  },
  {
    id: "saved-work-drill",
    steps: ["Saved Items", "Item detail"],
    backExpectations: ["Saved Items list", "previous workspace"],
  },
  {
    id: "create-workspace-drill",
    steps: ["Create hub", "Type picker", "Draft editor"],
    backExpectations: ["Create hub", "previous workspace"],
  },
  {
    id: "outcome-goals-tabs",
    steps: ["Outcome Goals", "Progress tab", "Reports tab"],
    backExpectations: ["Goals tab", "Growth Center or previous"],
  },
  {
    id: "clear-my-mind-landscape",
    steps: ["Clear My Mind capture", "Mental landscape"],
    backExpectations: ["Capture view", "previous workspace"],
  },
  {
    id: "decision-compass-wizard",
    steps: ["Decision Compass", "Step 2", "Step 3", "Result"],
    backExpectations: ["Previous step each Back", "exit workspace at root"],
  },
  {
    id: "visual-thinking-map",
    steps: ["Visual Thinking hub", "Map workspace"],
    backExpectations: ["Visual Thinking hub", "previous workspace"],
  },
];
