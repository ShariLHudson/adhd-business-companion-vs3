import { beforeEach, describe, expect, it, vi } from "vitest";

import { getSparkEstateMemberProfile } from "./sparkEstateMemberProfileEngine";
import {
  buildSparkEstateMemberLifecycleContext,
  formatSparkEstateLifecycleWelcome,
  formatSparkEstateUserJourneyAndMemberLifecycleReport,
  isSparkEstateMemberReturningAfterAbsence,
  resolveSparkEstateMemberLifecycleStage,
  SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE,
  SPARK_ESTATE_LIFECYCLE_PRINCIPLE,
  SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES,
  SPARK_ESTATE_RE_ENGAGEMENT_WELCOME,
  sparkEstateMemberLifecycleCompanionHint,
  verifySparkEstateUserJourneyAndMemberLifecycle,
} from "./sparkEstateUserJourneyAndMemberLifecycleArchitecture";

function seedLocalStorage() {
  const mem = new Map<string, string>();
  const storage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      mem.set(k, v);
    },
    removeItem: (k: string) => {
      mem.delete(k);
    },
    clear: () => {
      mem.clear();
    },
  };
  vi.stubGlobal("localStorage", storage);
  vi.stubGlobal("window", {
    dispatchEvent: vi.fn(),
    localStorage: storage,
  });
}

describe("sparkEstateUserJourneyAndMemberLifecycleArchitecture", () => {
  beforeEach(() => {
    seedLocalStorage();
    localStorage.clear();
  });

  function newMemberProfile() {
    return {
      ...getSparkEstateMemberProfile(),
      isNewMember: true,
      progressHistory: [],
      frictionPatterns: [],
      successfulStrategies: [],
    };
  }

  it("defines eight lifecycle stages and the member journey headline", () => {
    const verification = verifySparkEstateUserJourneyAndMemberLifecycle();
    expect(SPARK_ESTATE_MEMBER_LIFECYCLE_STAGES).toHaveLength(8);
    expect(SPARK_ESTATE_LIFECYCLE_JOURNEY_HEADLINE).toContain("Discover");
    expect(SPARK_ESTATE_LIFECYCLE_PRINCIPLE).toContain("Discover");
    expect(verification.stages).toBe(8);
    expect(verification.successMeasuresReady).toBe(true);
    expect(verification.lifecycleResolutionReady).toBe(true);
  });

  it("resolves lifecycle stages from member profile signals", () => {
    expect(
      resolveSparkEstateMemberLifecycleStage({
        profile: {
          ...newMemberProfile(),
          identity: { ...getSparkEstateMemberProfile().identity, name: "" },
        },
      }),
    ).toBe("discovery");

    expect(
      resolveSparkEstateMemberLifecycleStage({
        profile: {
          ...newMemberProfile(),
          identity: {
            ...getSparkEstateMemberProfile().identity,
            preferredName: "Alex",
          },
        },
      }),
    ).toBe("onboarding");

    expect(
      resolveSparkEstateMemberLifecycleStage({
        profile: {
          ...getSparkEstateMemberProfile(),
          isNewMember: false,
          progressHistory: [
            {
              id: "win-1",
              label: "First milestone",
              kind: "win",
            },
          ],
          successfulStrategies: [],
          frictionPatterns: [],
        },
        lastVisitMs: Date.now() - 1000 * 60 * 60 * 24 * 5,
      }),
    ).toBe("returning-member");
  });

  it("formats welcoming re-engagement copy without guilt language", () => {
    expect(
      formatSparkEstateLifecycleWelcome({
        stage: "returning-member",
        projectName: "Workshop",
      }),
    ).toContain("Workshop");
    expect(SPARK_ESTATE_RE_ENGAGEMENT_WELCOME).not.toContain("behind");
  });

  it("builds lifecycle context and companion hints", () => {
    const context = buildSparkEstateMemberLifecycleContext({
      profile: newMemberProfile(),
    });
    expect(context.stageDefinition.title).toBeTruthy();
    expect(context.welcomeLine.length).toBeGreaterThan(0);

    const hint = sparkEstateMemberLifecycleCompanionHint({
      text: "I'm back after a while away",
    });
    expect(hint).toContain("Welcome back");
    expect(hint).toContain('Never say "You are behind."');
  });

  it("detects returning members after absence", () => {
    expect(
      isSparkEstateMemberReturningAfterAbsence(
        Date.now(),
        Date.now() - 1000 * 60 * 60 * 24 * 5,
      ),
    ).toBe(true);
    expect(
      isSparkEstateMemberReturningAfterAbsence(
        Date.now(),
        Date.now() - 1000 * 60 * 60,
      ),
    ).toBe(false);
  });

  it("formats a readable lifecycle architecture report", () => {
    const report = formatSparkEstateUserJourneyAndMemberLifecycleReport();
    expect(report).toContain("Lifecycle stages");
    expect(report).toContain("Success measures");
    expect(report).toContain("Integration checks");
  });
});
