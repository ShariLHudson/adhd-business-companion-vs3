import { describe, expect, it } from "vitest";

import {
  composeMemoryReplaySession,
  getMemoryTheaterBootstrap,
  MEMORY_THEATER_PRINCIPLE,
} from "./index";

describe("Executive Memory Theater™ engine", () => {
  it("exposes memory theater principle", () => {
    expect(MEMORY_THEATER_PRINCIPLE).toContain("wisdom");
  });

  it("composeMemoryReplaySession returns full replay with story and wisdom", () => {
    const session = composeMemoryReplaySession("Replay workshop before membership decision");
    expect(session).not.toBeNull();
    expect(session!.replay.story.length).toBeGreaterThanOrEqual(10);
    expect(session!.replay.decisionRoom?.originalQuestion).toBeTruthy();
    expect(session!.replay.shariReflection.presentToPast).toBeTruthy();
    expect(session!.replay.wisdomIndex.knowledgeGained).toBeTruthy();
  });

  it("getMemoryTheaterBootstrap includes libraries and entry points", () => {
    const bootstrap = getMemoryTheaterBootstrap();
    expect(bootstrap.entryPoints.length).toBeGreaterThan(5);
    expect(bootstrap.neverAgainLibrary.length).toBeGreaterThan(3);
    expect(bootstrap.doThisAgainLibrary.length).toBeGreaterThan(3);
  });
});
