import { describe, expect, it, vi } from "vitest";
import {
  micCaptureTextForCommit,
  tryCommitMicCaptureOnEnd,
} from "./voiceMicCommit";

describe("voiceMicCommit", () => {
  it("mic off + text → send", () => {
    const send = vi.fn();
    const sent = tryCommitMicCaptureOnEnd({
      explicitStopRequested: true,
      inputSnapshot: "  hello world  ",
      send,
    });
    expect(sent).toBe(true);
    expect(send).toHaveBeenCalledWith("hello world");
  });

  it("mic off + empty → no send", () => {
    const send = vi.fn();
    const sent = tryCommitMicCaptureOnEnd({
      explicitStopRequested: true,
      inputSnapshot: "   ",
      send,
    });
    expect(sent).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("not explicit stop → no send (partial recognition path)", () => {
    const send = vi.fn();
    const sent = tryCommitMicCaptureOnEnd({
      explicitStopRequested: false,
      inputSnapshot: "partial transcript",
      send,
    });
    expect(sent).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("clears explicit stop flag when consumed", () => {
    let flag = true;
    tryCommitMicCaptureOnEnd({
      explicitStopRequested: flag,
      inputSnapshot: "hi",
      send: vi.fn(),
      onConsumedExplicitStop: () => {
        flag = false;
      },
    });
    expect(flag).toBe(false);
  });

  it("micCaptureTextForCommit returns null for empty", () => {
    expect(micCaptureTextForCommit("")).toBeNull();
    expect(micCaptureTextForCommit("note")).toBe("note");
  });
});
