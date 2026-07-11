import type { ScenePage } from "@/lib/companionBackgrounds";
import { detectEmotionalState } from "@/lib/companionEmotions";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
import { isGrowthPanelSection } from "@/lib/growthNavigation";
import type { SceneWorkspaceId } from "@/lib/sceneRenderContract";
import {
  resolveCompanionRenderContext,
  type CompanionRenderContext,
} from "./pipeline";

export type CompanionPageRenderInput = {
  activeSection: AppSection;
  workspacePanel: AppSection | null;
  workspaceBesideChat: boolean;
  displayEmotion: EmotionalState;
  firstUserMessage?: string;
  messageCount: number;
  arrivalActive?: boolean;
  focusCategoryId?: string;
};

export type CompanionPageGlobalBackground = {
  scenePage: ScenePage;
  sceneSeed: string;
  clearMyMind: boolean;
  /** When true, constitutional SceneRenderer owns the photo — hide legacy page wallpaper. */
  suppress: boolean;
};

const HOMESTEAD_SCENE_SECTIONS = new Set<AppSection>([
  "brain-dump",
  "plan-my-day",
  "visual-focus",
  "focus",
  "focus-audio",
]);

export type CompanionPageRenderContext = CompanionRenderContext & {
  globalBackground: CompanionPageGlobalBackground;
};

/** Scene family for global CompanionBackground — preserved legacy mapping. */
export function sceneForContext(
  emotion: EmotionalState,
  section: AppSection,
): ScenePage {
  if (
    section === "focus-timer" ||
    section === "focus-audio" ||
    section === "breathe"
  ) {
    return "focus";
  }
  if (section === "playbook" || section === "projects") {
    return "business";
  }
  switch (emotion) {
    case "emotional":
    case "overwhelmed":
      return "recovery";
    case "focused":
      return "focus";
    case "building":
      return "business";
    case "stuck":
      return "recovery";
    default:
      return "today";
  }
}

export function sectionToSceneWorkspaceId(
  section: AppSection,
  workspacePanel: AppSection | null = null,
): SceneWorkspaceId | undefined {
  const effective = workspacePanel ?? section;
  const map: Partial<Record<AppSection, SceneWorkspaceId>> = {
    "brain-dump": "clear-my-mind",
    "plan-my-day": "plan-my-day",
    "visual-focus": "visual-focus",
    focus: "focus-hub",
    breathe: "breathe",
    "focus-audio": "focus-audio",
  };
  return map[effective];
}

function resolveGlobalBackgroundIntent(
  input: CompanionPageRenderInput,
): CompanionPageGlobalBackground {
  const growthRoom =
    isGrowthPanelSection(input.activeSection) ||
    isGrowthPanelSection(input.workspacePanel ?? undefined);

  if (growthRoom) {
    return {
      scenePage: "progress",
      sceneSeed: "growth",
      clearMyMind: false,
      suppress: true,
    };
  }

  const homesteadPanel =
    input.workspacePanel != null &&
    HOMESTEAD_SCENE_SECTIONS.has(input.workspacePanel);
  const homesteadSection = HOMESTEAD_SCENE_SECTIONS.has(input.activeSection);
  const constitutionalScene = homesteadPanel || homesteadSection;

  if (constitutionalScene) {
    const isClearMyMind =
      input.activeSection === "brain-dump" ||
      input.workspacePanel === "brain-dump";
    const isPeacefulPlaces =
      input.activeSection === "focus-audio" ||
      input.workspacePanel === "focus-audio";
    const scenePage: ScenePage = isClearMyMind
      ? "recovery"
      : isPeacefulPlaces
        ? "recovery"
        : input.activeSection === "plan-my-day" ||
            input.workspacePanel === "plan-my-day"
          ? "today"
          : "focus";
    const sceneSeed = isClearMyMind
      ? "brain-dump"
      : isPeacefulPlaces
        ? "peaceful-places-directory"
        : (input.workspacePanel ?? input.activeSection);
    return {
      scenePage,
      sceneSeed,
      clearMyMind: isClearMyMind,
      suppress: true,
    };
  }

  if (input.activeSection === "home") {
    const convoEmotion = input.firstUserMessage
      ? detectEmotionalState(input.firstUserMessage)
      : "unclear";
    return {
      scenePage: sceneForContext(convoEmotion, "home"),
      sceneSeed: input.firstUserMessage ?? "home",
      clearMyMind: false,
      suppress: false,
    };
  }
  return {
    scenePage: sceneForContext(input.displayEmotion, input.activeSection),
    sceneSeed: input.activeSection,
    clearMyMind: false,
    suppress: false,
  };
}

/**
 * Required entry point for live app workspace render decisions.
 * CompanionPageClient passes shell state; conductor returns environment + presence.
 */
export function buildCompanionPageRenderContext(
  input: CompanionPageRenderInput,
): CompanionPageRenderContext {
  const globalBackground = resolveGlobalBackgroundIntent(input);
  const workspaceId = sectionToSceneWorkspaceId(
    input.activeSection,
    input.workspacePanel,
  );

  const context = resolveCompanionRenderContext({
    conversation: {
      activeSection: input.activeSection,
      workspacePanel: input.workspacePanel ?? undefined,
      workspaceBesideChat: input.workspaceBesideChat,
      messageCount: input.messageCount,
      userText: input.firstUserMessage ?? null,
      arrivalActive: input.arrivalActive,
    },
    orchestration: {
      emotionalState: input.displayEmotion,
      overwhelmed: input.displayEmotion === "overwhelmed",
      activeSection: input.activeSection,
      userText: input.firstUserMessage ?? null,
      workspaceId,
    },
    environment: {
      workspaceId,
      focusCategoryId: input.focusCategoryId,
      section: input.activeSection,
      scenePage: globalBackground.scenePage,
      seed: globalBackground.sceneSeed,
    },
  });

  return { ...context, globalBackground };
}

/** Guardrail — lower layers must not invent place outside Environment Intelligence. */
export function assertConstitutionalPlaceAuthority(
  context: CompanionRenderContext,
  attemptedPlaceId: string,
): void {
  if (attemptedPlaceId !== context.environment.placeId) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[Companion Constitution] Lower layer attempted place "${attemptedPlaceId}"; authority is "${context.environment.placeId}".`,
      );
    }
  }
}
