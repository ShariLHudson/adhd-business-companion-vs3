import { describe, expect, it } from "vitest";
import { sectionToSceneWorkspaceId } from "@/lib/companionConstitution/companionPageRenderContext";
import { roomRegistryEntry } from "@/lib/companionConstitution/environmentIntelligence/roomRegistry";
import { placeForWorkspace } from "@/lib/roomCompositionRule";
import { shouldBlockWorkspaceOpenForPhase1 } from "@/lib/phase1Onboarding";
import {
  createSceneState,
  layoutScene,
  resolveScene,
  resolveSceneCopy,
} from "@/lib/sceneRenderContract";
import { CLEAR_MY_MIND_SECTION } from "@/lib/clearMyMindRouting";
import { CLEAR_MY_MIND_CONSERVATORY_BG } from "@/lib/clearMyMind/conservatory";

/**
 * Clear My Mind opening pipeline — registry + scene contract + phase-1 gate.
 * UI wiring: TopBar → openClearMyMindCore → activeSection brain-dump
 * → BrainDumpPanel → CompanionWorkspaceShell → SceneRenderer.
 */
describe("clearMyMindOpeningPipeline", () => {
  it("registers workspace, scene, and room ids consistently", () => {
    expect(CLEAR_MY_MIND_SECTION).toBe("brain-dump");
    expect(sectionToSceneWorkspaceId("brain-dump")).toBe("clear-my-mind");
    expect(sectionToSceneWorkspaceId("home", "brain-dump")).toBe("clear-my-mind");
    expect(placeForWorkspace("clear-my-mind")).toBe("greenhouse");

    const room = roomRegistryEntry("greenhouse");
    expect(room.supportedWorkspaces).toContain("clear-my-mind");
    expect(room.hasComposition).toBe(true);
  });

  it("runs Scene Render Contract for clear-my-mind conservatory", () => {
    const copy = resolveSceneCopy("clear-my-mind");
    expect(copy.title).toBe("Clear My Mind");
    expect(copy.title).not.toMatch(/^Today is /);

    const scene = createSceneState({ workspaceId: "clear-my-mind" });
    const resolved = resolveScene(scene);
    expect(resolved.workspaceId).toBe("clear-my-mind");
    expect(resolved.environment.placeId).toBe("greenhouse");
    expect(resolved.environment.background.imageUrl).toBe(
      CLEAR_MY_MIND_CONSERVATORY_BG,
    );
    expect(resolved.motion.room).toBe("clear-my-mind");
    expect(resolved.motion.enabled).toBe(false);

    const layout = layoutScene(resolved);
    expect(layout.rootClassName).toContain("companion-scene-root--clear-my-mind");
    expect(layout.rootClassName).toContain("companion-scene-root--motion-none");
    expect(layout.dataAttributes["data-scene-workspace"]).toBe("clear-my-mind");
  });

  it("allows explicit user-initiated opens during Phase 1", () => {
    expect(shouldBlockWorkspaceOpenForPhase1()).toBe(true);
    expect(shouldBlockWorkspaceOpenForPhase1({ userInitiated: true })).toBe(
      false,
    );
  });
});
