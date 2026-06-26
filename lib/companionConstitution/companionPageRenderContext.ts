import type { ScenePage } from "@/lib/companionBackgrounds";
import { detectEmotionalState } from "@/lib/companionEmotions";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { AppSection } from "@/lib/companionUi";
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
};

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
    focus: "focus-hub",
    breathe: "breathe",
    "focus-audio": "focus-audio",
  };
  return map[effective];
}

function resolveGlobalBackgroundIntent(
  input: CompanionPageRenderInput,
): CompanionPageGlobalBackground {
  if (input.activeSection === "brain-dump") {
    return {
      scenePage: "recovery",
      sceneSeed: "brain-dump",
      clearMyMind: true,
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
    };
  }
  return {
    scenePage: sceneForContext(input.displayEmotion, input.activeSection),
    sceneSeed: input.activeSection,
    clearMyMind: false,
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
