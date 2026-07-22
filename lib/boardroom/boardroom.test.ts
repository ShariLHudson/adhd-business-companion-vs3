/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from "vitest";
import { savePrefs } from "@/lib/companionStore";
import {
  generateDecisionBrief,
  generateOpeningDiscussion,
  recommendBestBoard,
  titleFromSituation,
} from "@/lib/boardroom";

afterEach(() => {
  savePrefs({
    name: "",
    email: "",
    preferredName: "",
    profileImage: "",
  });
});

describe("boardroom", () => {
  it("recommends a balanced board from situation keywords", () => {
    const ids = recommendBestBoard(
      "I need to set pricing for a new offer and I'm overwhelmed.",
    );
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(ids.length).toBeLessThanOrEqual(7);
    expect(ids).toContain("adhd-expert");
  });

  it("titles a discussion from the situation", () => {
    expect(titleFromSituation("Should I hire a VA this quarter?")).toBe(
      "Should I hire a VA this quarter",
    );
  });

  it("opens a moderated discussion without deciding for the member", () => {
    const memberIds = recommendBestBoard("Launch a workshop or wait?");
    const turns = generateOpeningDiscussion({
      situation: "Launch a workshop or wait?",
      memberIds,
      style: "full-discussion",
    });
    expect(turns.some((t) => t.role === "moderator")).toBe(true);
    expect(turns.some((t) => t.role === "member")).toBe(true);

    const brief = generateDecisionBrief({
      situation: "Launch a workshop or wait?",
      memberIds,
      turns,
    });
    expect(brief.yourDecision).toBe("");
    expect(brief.situation).toContain("workshop");
  });

  it("board member perspectives address the member by preferred name", () => {
    savePrefs({ preferredName: "Shari", name: "Shari Anderson" });
    const memberIds = recommendBestBoard("Launch a workshop or wait?");
    const turns = generateOpeningDiscussion({
      situation: "Launch a workshop or wait?",
      memberIds: memberIds.slice(0, 2),
      style: "quick-review",
    });
    const memberText = turns
      .filter((t) => t.role === "member")
      .map((t) => (t.role === "member" ? t.turn.perspective : ""))
      .join("\n");
    expect(memberText).toMatch(/Shari's question/);
    expect(memberText).toMatch(/Shari,/);
    expect(memberText).not.toMatch(/\buser\b/i);
  });
});
