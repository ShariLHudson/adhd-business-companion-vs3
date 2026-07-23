import { beforeEach, describe, expect, it } from "vitest";
import "@/lib/universalWorkEngine";
import {
  clearSectionIdeasCatalogsForTests,
  clearSectionIdeasSessionsForTests,
  debugSectionIdeasPoolSize,
  expandSectionIdea,
  generateSectionIdeas,
} from "./sectionIdeas";
import { ensureEventPlanWorkTypeRegistered } from "../packages/eventPlan/registerEventPlanWorkType";
import { ensureMarketingPlanWorkTypeRegistered } from "../packages/marketingPlan/registerMarketingPlanWorkType";
import { ensureBusinessPlanWorkTypeRegistered } from "../packages/businessPlan/registerBusinessPlanWorkType";
import { ensureFacebookCommunityWorkTypeRegistered } from "../packages/facebookCommunity/registerFacebookCommunityWorkType";

describe("UWE section ideas — iterative assistance", () => {
  beforeEach(() => {
    clearSectionIdeasCatalogsForTests();
    clearSectionIdeasSessionsForTests();
    ensureEventPlanWorkTypeRegistered();
    ensureMarketingPlanWorkTypeRegistered();
    ensureBusinessPlanWorkTypeRegistered();
    ensureFacebookCommunityWorkTypeRegistered();
  });

  const focus = {
    workTypeId: "event_plan",
    sectionId: "agenda",
    title: "Agenda",
    creationId: "iter-ws-1",
  };

  it("Refresh Ideas returns a different set when unused ideas exist", () => {
    expect(debugSectionIdeasPoolSize(focus)).toBeGreaterThanOrEqual(6);
    const first = generateSectionIdeas(focus, { mode: "initial" });
    expect(first.ok).toBe(true);
    expect(first.suggestions.length).toBe(3);
    const second = generateSectionIdeas(focus, {
      mode: "refresh",
      session: first.session,
    });
    expect(second.ok).toBe(true);
    expect(second.suggestions.length).toBeGreaterThan(0);
    const firstIds = first.suggestions.map((s) => s.id).sort().join("|");
    const secondIds = second.suggestions.map((s) => s.id).sort().join("|");
    expect(secondIds).not.toBe(firstIds);
    // No exact overlap of visible ids
    for (const id of second.session.visibleIds) {
      expect(first.session.visibleIds).not.toContain(id);
    }
  });

  it("More Ideas appends rather than replaces", () => {
    const first = generateSectionIdeas(focus, { mode: "initial" });
    const more = generateSectionIdeas(focus, {
      mode: "more",
      session: first.session,
    });
    expect(more.suggestions.length).toBeGreaterThan(first.suggestions.length);
    for (const s of first.suggestions) {
      expect(more.suggestions.some((m) => m.id === s.id)).toBe(true);
    }
  });

  it("avoids exact duplicate suggestion ids in a set", () => {
    const first = generateSectionIdeas(focus, { mode: "initial" });
    const more = generateSectionIdeas(focus, {
      mode: "more",
      session: first.session,
    });
    const ids = more.suggestions.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const texts = more.suggestions.map((s) => s.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it("catalog exhaustion produces an honest message", () => {
    let session = generateSectionIdeas(focus, { mode: "initial" }).session;
    // Drain pool via refresh + more
    for (let i = 0; i < 8; i++) {
      const next = generateSectionIdeas(focus, {
        mode: "refresh",
        session,
      });
      session = next.session;
      if (next.exhausted) {
        expect(next.notice || next.intro).toMatch(
          /seen the available ideas|return later/i,
        );
        return;
      }
    }
    const drained = generateSectionIdeas(focus, {
      mode: "refresh",
      session,
    });
    expect(drained.exhausted).toBe(true);
    expect(`${drained.notice ?? ""} ${drained.intro}`).toMatch(
      /seen the available ideas|return later/i,
    );
  });

  it("Expand This Idea shows a richer version without auto-inserting", () => {
    const first = generateSectionIdeas(focus, { mode: "initial" });
    const idea = first.suggestions[0];
    const expanded = expandSectionIdea(focus, idea);
    expect(expanded.ok).toBe(true);
    expect(expanded.expanded.text.length).toBeGreaterThan(idea.text.length);
    expect(expanded.expanded.text).toMatch(/timing|purpose|facilitat|activity|transition/i);
    expect(expanded.original.text).toBe(idea.text);
  });

  it("assigns stable idea ids (not array-position only)", () => {
    const first = generateSectionIdeas(focus, { mode: "initial" });
    clearSectionIdeasSessionsForTests();
    const again = generateSectionIdeas(focus, { mode: "initial" });
    expect(first.suggestions[0].id).toBe(again.suggestions[0].id);
    expect(first.suggestions[0].id).toMatch(/agenda:/);
    expect(first.suggestions[0].id).not.toMatch(/^0$/);
  });

  it("type-specific expansion remains relevant for all four packages", () => {
    const cases = [
      {
        workTypeId: "event_plan",
        sectionId: "agenda",
        expect: /timing|facilitat|transition|participant activity/i,
      },
      {
        workTypeId: "marketing_plan",
        sectionId: "channels",
        expect: /audience angle|message|channel|call to action|implementation note/i,
      },
      {
        workTypeId: "business_plan",
        sectionId: "pricing",
        expect: /strategic rationale|assumptions|evidence needed|milestones|risks/i,
      },
      {
        workTypeId: "facebook_community",
        sectionId: "welcome_and_onboarding",
        expect: /member value|recurring rhythm|engagement prompt|moderation|success signal/i,
      },
    ] as const;
    for (const c of cases) {
      const result = generateSectionIdeas(
        {
          workTypeId: c.workTypeId,
          sectionId: c.sectionId,
          title: c.sectionId,
          creationId: `pkg-${c.workTypeId}`,
        },
        { mode: "initial" },
      );
      expect(result.ok).toBe(true);
      const exp = expandSectionIdea(
        {
          workTypeId: c.workTypeId,
          sectionId: c.sectionId,
          title: c.sectionId,
        },
        result.suggestions[0],
      );
      expect(exp.expanded.text).toMatch(c.expect);
    }
  });

  it("returning later can provide further unused ideas", () => {
    const first = generateSectionIdeas(focus, { mode: "initial" });
    // Simulate close (no UI) then reopen initial — shown ids remain in store
    const again = generateSectionIdeas(focus, { mode: "initial" });
    expect(again.suggestions.length).toBeGreaterThan(0);
    for (const id of again.session.visibleIds) {
      expect(first.session.visibleIds).not.toContain(id);
    }
  });
});
