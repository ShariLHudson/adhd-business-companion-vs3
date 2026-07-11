import { describe, expect, it } from "vitest";

import {
  composeBoardDiscussion,
  composeConsensus,
  getBoardMember,
  getPerspective,
  listBoardMembers,
  listOpenQuestions,
  listAdvisoryRelationships,
  relationshipsForTopic,
  SAMPLE_BOARD_DISCUSSIONS,
} from "./index";

describe("Founder Advisory Council", () => {
  it("board composition includes 18 executive disciplines", () => {
    const members = listBoardMembers();
    expect(members).toHaveLength(18);
    expect(getBoardMember("ceo")?.role).toContain("Executive");
    expect(getBoardMember("adhd-expert")?.expertise.length).toBeGreaterThan(0);
    expect(getBoardMember("accessibility-expert")?.typicalQuestions.length).toBeGreaterThan(0);
  });

  it("sample discussions cover all eight sprint topics", () => {
    expect(SAMPLE_BOARD_DISCUSSIONS).toHaveLength(8);
    const topics = SAMPLE_BOARD_DISCUSSIONS.map((d) => d.topicId);
    expect(topics).toContain("listening-rooms");
    expect(topics).toContain("founder-daily-workflow");
    expect(topics).toContain("automation-studio");
  });

  it("Listening Rooms perspective generation matches spec disciplines", () => {
    const discussion = composeBoardDiscussion("listening-rooms");
    expect(discussion).not.toBeNull();
    expect(discussion!.question).toMatch(/Listening Rooms/i);
    expect(discussion!.perspectiveCount).toBe(7);

    const memberIds = discussion!.perspectives.map((p) => p.memberId);
    expect(memberIds).toContain("ceo");
    expect(memberIds).toContain("marketing-director");
    expect(memberIds).toContain("adhd-expert");
    expect(memberIds).toContain("operations");
    expect(memberIds).toContain("finance");
    expect(memberIds).toContain("technology-advisor");
    expect(memberIds).toContain("accessibility-expert");

    const ceo = getPerspective("listening-rooms", "ceo");
    expect(ceo?.opportunities.length).toBeGreaterThan(0);
    expect(ceo?.concerns.length).toBeGreaterThan(0);
    expect(ceo?.questions.length).toBeGreaterThan(0);
    expect(ceo?.recommendations.length).toBeGreaterThan(0);
    expect(ceo?.unknowns.length).toBeGreaterThan(0);
    expect(ceo?.suggestedNextStep).toBeTruthy();
    expect(ceo?.confidence.score).toBeGreaterThan(0);
  });

  it("board consensus surfaces agreement, disagreement, and founder decisions", () => {
    const consensus = composeConsensus("listening-rooms");
    expect(consensus).not.toBeNull();
    expect(consensus!.agreement.length).toBeGreaterThan(0);
    expect(consensus!.needsFounderDecision.length).toBeGreaterThan(0);

    const automation = composeConsensus("automation-studio");
    expect(automation!.disagreement.length).toBeGreaterThan(0);
    expect(automation!.needsFounderDecision.length).toBeGreaterThan(0);
  });

  it("relationships and mission links connect advisory to ecosystem objects", () => {
    const rels = listAdvisoryRelationships();
    expect(rels.length).toBeGreaterThan(0);

    const lrRels = relationshipsForTopic("listening-rooms");
    expect(lrRels.some((r) => r.link.kind === "mission")).toBe(true);
    expect(lrRels.some((r) => r.link.kind === "opportunity")).toBe(true);

    const discussion = composeBoardDiscussion("listening-rooms");
    expect(discussion!.missionIds).toContain("listening-rooms");
    expect(discussion!.links.some((l) => l.kind === "research")).toBe(true);
  });

  it("listOpenQuestions aggregates across discussions", () => {
    const all = listOpenQuestions();
    expect(all.length).toBeGreaterThan(0);

    const scoped = listOpenQuestions("automation-studio");
    expect(scoped.some((q) => /approval/i.test(q))).toBe(true);
  });
});
