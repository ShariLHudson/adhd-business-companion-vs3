import { describe, expect, it } from "vitest";
import { splitCaptureInput } from "./clearMyMindCapture";
import {
  detectThoughtSplitProposal,
  normalizeSplitSegments,
} from "./clearMyMindThoughtSplitter";

const QA_COMMA_DUMP =
  "Call doctor, work on newsletter, call Izna about marketing, text Connie, water plants";

const QA_LONG_DUMP =
  "I need to call my dr to schedule appt, work on newsletter, call Izna about marketing stuff, text Connie about Netflix show, water my plants";

describe("clearMyMindThoughtSplitter", () => {
  it("proposes split for the QA comma brain dump (5 segments)", () => {
    const proposal = detectThoughtSplitProposal(QA_COMMA_DUMP);
    expect(proposal).not.toBeNull();
    expect(proposal!.count).toBe(5);
    expect(proposal!.segments).toEqual([
      "Call doctor",
      "work on newsletter",
      "call Izna about marketing",
      "text Connie",
      "water plants",
    ]);
  });

  it("proposes split for three action-led comma clauses", () => {
    const proposal = detectThoughtSplitProposal(
      "Call doctor, finish newsletter, text Connie",
    );
    expect(proposal).not.toBeNull();
    expect(proposal!.count).toBe(3);
  });

  it("proposes split for long natural dump with leading I need to on first clause", () => {
    const proposal = detectThoughtSplitProposal(QA_LONG_DUMP);
    expect(proposal).not.toBeNull();
    expect(proposal!.count).toBe(5);
    expect(proposal!.segments[0]).toBe("call my dr to schedule appt");
  });

  it("does not propose split for but-clause narrative", () => {
    expect(
      detectThoughtSplitProposal(
        "I need to call the doctor, but I am nervous about it.",
      ),
    ).toBeNull();
  });

  it("does not propose split for and-clause continuation", () => {
    expect(
      detectThoughtSplitProposal(
        "I talked to Marcus, and I feel better now.",
      ),
    ).toBeNull();
  });

  it("does not propose split for which-clause subordinate phrase", () => {
    expect(
      detectThoughtSplitProposal(
        "The proposal, which Marcus sent yesterday, needs review.",
      ),
    ).toBeNull();
  });

  it("normalizes first segment prefix only when splitting", () => {
    expect(
      normalizeSplitSegments([
        "I need to call my dr to schedule appt",
        "work on newsletter",
      ]),
    ).toEqual(["call my dr to schedule appt", "work on newsletter"]);
  });

  it("does not change later segments when normalizing", () => {
    expect(normalizeSplitSegments(["call doctor", "Remember to water plants"])).toEqual(
      ["call doctor", "Remember to water plants"],
    );
  });
});

describe("clearMyMindThoughtSplitter — structural split regression", () => {
  it("newline splitting stays in clearMyMindCapture", () => {
    expect(
      splitCaptureInput("Work on ADHD app\nCreate automation\nRevise marketing plan"),
    ).toHaveLength(3);
    expect(detectThoughtSplitProposal("Work on ADHD app\nCreate automation")).toBeNull();
  });

  it("bullet splitting stays in clearMyMindCapture", () => {
    expect(splitCaptureInput("- first\n- second")).toEqual(["first", "second"]);
  });

  it("semicolon splitting stays in clearMyMindCapture", () => {
    expect(splitCaptureInput("call mom; email team; fix homepage")).toHaveLength(3);
  });
});
