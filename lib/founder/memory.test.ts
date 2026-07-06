import { describe, expect, it } from "vitest";

import { listVaultDecisions } from "./memory/decisionVault";
import { listLessonsLearned, lessonsByKind } from "./memory/lessons";
import { listCompanyMilestones } from "./memory/milestones";
import { SAMPLE_MEMORY_VAULT } from "./memory/repositories/sample/data";
import { searchFounderMemory } from "./memory/search";
import { getMemoryVaultOverview } from "./memory/services";
import { listMemoryTimeline } from "./memory/timeline";

describe("Founder Memory & Decision Vault", () => {
  it("getMemoryVaultOverview returns full institutional archive", () => {
    const vault = getMemoryVaultOverview();
    expect(vault.decisions.length).toBeGreaterThanOrEqual(3);
    expect(vault.lessons.length).toBeGreaterThanOrEqual(5);
    expect(vault.milestones.length).toBeGreaterThanOrEqual(4);
    expect(vault.timeline.length).toBeGreaterThanOrEqual(6);
    expect(vault.links.length).toBeGreaterThanOrEqual(3);
    expect(vault.journal.length).toBeGreaterThanOrEqual(2);
  });

  it("listVaultDecisions sorts newest first", () => {
    const decisions = listVaultDecisions();
    expect(decisions[0].decidedAt >= decisions[1].decidedAt).toBe(true);
    expect(decisions.every((d) => d.finalDecision.length > 5)).toBe(true);
  });

  it("searchFounderMemory finds decisions and lessons", () => {
    const decisions = searchFounderMemory("architecture", "decisions");
    expect(decisions.length).toBeGreaterThan(0);
    const lessons = searchFounderMemory("dashboard", "lessons");
    expect(lessons.length).toBeGreaterThan(0);
  });

  it("searchFounderMemory returns empty for blank query", () => {
    expect(searchFounderMemory("")).toEqual([]);
  });

  it("lessonsByKind filters sample lessons", () => {
    expect(lessonsByKind("avoid").length).toBeGreaterThan(0);
    expect(listLessonsLearned().length).toBe(SAMPLE_MEMORY_VAULT.lessons.length);
  });

  it("timeline and milestones are chronological", () => {
    const timeline = listMemoryTimeline();
    expect(timeline[0].occurredAt >= timeline[1].occurredAt).toBe(true);
    const milestones = listCompanyMilestones();
    expect(milestones[0].achievedAt >= milestones[1].achievedAt).toBe(true);
  });
});
