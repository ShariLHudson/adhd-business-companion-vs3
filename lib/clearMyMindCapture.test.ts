import { describe, expect, it } from "vitest";
import { splitCaptureInput, capturePrompt } from "./clearMyMindCapture";

describe("clearMyMindCapture", () => {
  it("keeps a single thought as one item", () => {
    expect(splitCaptureInput("Need to schedule my ultrasound")).toEqual([
      "Need to schedule my ultrasound",
    ]);
  });

  it("splits newlines into separate items", () => {
    expect(
      splitCaptureInput(
        "Work on ADHD app\nCreate automation\nRevise marketing plan",
      ),
    ).toEqual(["Work on ADHD app", "Create automation", "Revise marketing plan"]);
  });

  it("splits bullet lines", () => {
    expect(splitCaptureInput("- first\n- second")).toEqual(["first", "second"]);
  });

  it("asks for the first thing initially", () => {
    expect(capturePrompt("first", 0)).toContain("first thing on your mind");
  });
});
