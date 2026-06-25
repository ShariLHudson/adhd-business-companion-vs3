import { describe, expect, it } from "vitest";
import {
  clearMyMindShowsCompanionPanel,
  clearMyMindShowsVisualAnalysis,
  initialClearMyMindStage,
  stageOnAcknowledgmentContinue,
  stageOnCaptureBegin,
  stageOnReleaseComplete,
} from "./clearMyMindStages";
import {
  shariReceiveAcknowledgment,
  shariUnderstandingOpener,
} from "./clearMyMindCompanionVoice";

describe("clearMyMindStages", () => {
  it("starts in permission", () => {
    expect(initialClearMyMindStage()).toBe("permission");
  });

  it("moves permission to release on capture", () => {
    expect(stageOnCaptureBegin("permission")).toBe("release");
  });

  it("keeps companion panel visible throughout the journey", () => {
    expect(clearMyMindShowsCompanionPanel("permission")).toBe(true);
    expect(clearMyMindShowsCompanionPanel("release")).toBe(true);
    expect(clearMyMindShowsCompanionPanel("received")).toBe(true);
  });

  it("hides visual analysis until understanding", () => {
    expect(clearMyMindShowsVisualAnalysis("received")).toBe(false);
    expect(clearMyMindShowsVisualAnalysis("understanding")).toBe(true);
  });

  it("flows release to received to understanding", () => {
    expect(stageOnReleaseComplete("release")).toBe("received");
    expect(stageOnAcknowledgmentContinue("received")).toBe("understanding");
  });
});

describe("clearMyMindCompanionVoice", () => {
  it("acknowledges before organizing", () => {
    const ack = shariReceiveAcknowledgment([
      { id: "1", text: "overwhelmed", createdAt: "", sorted: false },
    ] as never);
    expect(ack).toMatch(/glad|carry|got it/i);
    expect(ack).not.toMatch(/analysis/i);
  });

  it("uses human language for understanding", () => {
    const line = shariUnderstandingOpener(
      [{ id: "a", label: "Work", icon: "💼", count: 2, thoughts: [] }],
      2,
    );
    expect(line).toMatch(/beginning to see/i);
  });
});
