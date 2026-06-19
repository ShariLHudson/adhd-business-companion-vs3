import { describe, expect, it } from "vitest";
import {
  evaluateResumeWorkEligibility,
  pickMostRecentEligibleResume,
} from "./resumeWorkEligibility";

describe("resume work eligibility", () => {
  it("rejects viewed-only workspace opens", () => {
    const result = evaluateResumeWorkEligibility({
      kind: "project",
      id: "p1",
      title: "Project",
      lastTouchedAt: new Date().toISOString(),
      viewedOnly: true,
    });
    expect(result.eligible).toBe(false);
  });

  it("accepts meaningful draft content", () => {
    const result = evaluateResumeWorkEligibility({
      kind: "create",
      id: "c1",
      title: "Marketing Plan",
      lastTouchedAt: new Date().toISOString(),
      contentCharCount: 120,
    });
    expect(result.eligible).toBe(true);
  });

  it("accepts answered decision compass questions", () => {
    const result = evaluateResumeWorkEligibility({
      kind: "decision-compass",
      id: "d1",
      title: "Hiring Decision",
      lastTouchedAt: new Date().toISOString(),
      answeredQuestionCount: 2,
    });
    expect(result.eligible).toBe(true);
  });

  it("accepts project task creation", () => {
    const result = evaluateResumeWorkEligibility({
      kind: "project",
      id: "p1",
      title: "Sales Funnel",
      lastTouchedAt: new Date().toISOString(),
      createdTaskCount: 3,
    });
    expect(result.eligible).toBe(true);
  });

  it("picks the most recent eligible work item", () => {
    const oldDate = "2026-06-01T10:00:00.000Z";
    const newDate = "2026-06-02T10:00:00.000Z";
    const picked = pickMostRecentEligibleResume([
      {
        kind: "project",
        id: "viewed",
        title: "Viewed Project",
        lastTouchedAt: newDate,
        viewedOnly: true,
      },
      {
        kind: "create",
        id: "old",
        title: "Old Draft",
        lastTouchedAt: oldDate,
        contentCharCount: 100,
      },
      {
        kind: "decision-compass",
        id: "new",
        title: "New Decision",
        lastTouchedAt: newDate,
        answeredQuestionCount: 1,
      },
    ]);
    expect(picked?.id).toBe("new");
  });
});
