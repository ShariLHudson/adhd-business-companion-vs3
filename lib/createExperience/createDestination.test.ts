/**
 * Repair 6 — Create ROOM availability is separate from ARTIFACT availability.
 * The room is always navigable; only the requested artifact workspace may be
 * unavailable (surfaced inside Create, never as the room-level placeholder).
 */
import { describe, expect, it } from "vitest";

import {
  isCreateRoomNavigable,
  buildCreateRoomEntry,
  resolveArtifactExecutionOutcome,
} from "./createDestination";
import { resolveCreationTurnEnvelope } from "@/lib/createIntent/creationTurnEnvelope";

const env = (t: string) => resolveCreationTurnEnvelope(t, "turn-1");

describe("room availability is unconditional", () => {
  it("the Create room is always navigable (never blocked_unavailable)", () => {
    expect(isCreateRoomNavigable()).toBe(true);
  });
});

describe("navigation prompts open Create (room-level)", () => {
  it.each(["go to create", "open create", "go to creaste"])(
    "'%s' → explicit Create navigation, room navigable",
    (t) => {
      const e = env(t);
      expect(e.explicitCreateNavigation).toBe(true);
      expect(e.createEligible).toBe(true);
      expect(isCreateRoomNavigable()).toBe(true);
    },
  );
});

describe("artifact requests open Create and preserve the intended artifact", () => {
  it("'create a marketing plan' → eligible + Marketing Plan preserved", () => {
    const e = env("create a marketing plan");
    const entry = buildCreateRoomEntry(e, "create a marketing plan");
    expect(entry.createEligible).toBe(true);
    expect(entry.intendedArtifact).toBe("Marketing Plan");
    expect(entry.originalUserText).toBe("create a marketing plan");
    expect(entry.turnId).toBe("turn-1");
  });

  it("'i want to create a marketing plan' preserves the same artifact", () => {
    const entry = buildCreateRoomEntry(
      env("i want to create a marketing plan"),
      "i want to create a marketing plan",
    );
    expect(entry.createEligible).toBe(true);
    expect(entry.intendedArtifact).toBe("Marketing Plan");
  });

  it("explicit navigation + artifact preserves both", () => {
    const e = env("go to create i want to create a marketing plan");
    const entry = buildCreateRoomEntry(
      e,
      "go to create i want to create a marketing plan",
    );
    expect(entry.explicitNavigation).toBe(true);
    expect(entry.createEligible).toBe(true);
    // The room is navigable regardless of artifact availability.
    expect(isCreateRoomNavigable()).toBe(true);
  });

  it("no 'Creative Studio' label leaks into the room-entry context", () => {
    const entry = buildCreateRoomEntry(env("create a marketing plan"), "create a marketing plan");
    expect(JSON.stringify(entry)).not.toMatch(/Creative Studio/i);
  });
});

describe("artifact execution availability is a separate concern", () => {
  it("a blocked artifact resolves to artifact_unavailable (not room-level blocked)", () => {
    expect(
      resolveArtifactExecutionOutcome({
        userText: "create a marketing plan",
        itemType: "Marketing Plan",
      }),
    ).toBe("artifact_unavailable");
  });

  it("a functioning artifact (room already open → allow) resolves to workspace_opened", () => {
    expect(
      resolveArtifactExecutionOutcome({
        userText: "create a marketing plan",
        itemType: "Marketing Plan",
        alreadyOpen: true,
      }),
    ).toBe("workspace_opened");
  });

  it("room navigability is independent of artifact availability", () => {
    // Even when the artifact is unavailable, the room is still navigable.
    const outcome = resolveArtifactExecutionOutcome({
      userText: "i want to create a social media post",
    });
    expect(outcome).toBe("artifact_unavailable");
    expect(isCreateRoomNavigable()).toBe(true);
  });
});

describe("exploratory creation still does not navigate", () => {
  it("'what kind of things can i create' is not createEligible / not explicit nav", () => {
    const e = env("what kind of things can i create");
    expect(e.createEligible).toBe(false);
    expect(e.explicitCreateNavigation).toBe(false);
    expect(e.exploratoryCreation).toBe(true);
  });
});
