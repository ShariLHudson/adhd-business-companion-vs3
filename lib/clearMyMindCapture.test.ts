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

  it("splits semicolon lists when three or more short clauses", () => {
    expect(
      splitCaptureInput("call mom; email team; fix homepage"),
    ).toEqual(["call mom", "email team", "fix homepage"]);
  });

  it("splits the P0 four-line sales repro input", () => {
    expect(
      splitCaptureInput(
        "Work on ADHD App\nCreate Automation for Sales Calls\nRevise Marketing Plan\nCreate Affiliate Plan",
      ),
    ).toEqual([
      "Work on ADHD App",
      "Create Automation for Sales Calls",
      "Revise Marketing Plan",
      "Create Affiliate Plan",
    ]);
  });
});
