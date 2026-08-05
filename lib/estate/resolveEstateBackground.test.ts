import { describe, expect, it } from "vitest";
import {
  resolveEstateBackground,
  type EstateBackgroundRequest,
} from "./resolveEstateBackground";

const DEFAULT = { backgroundId: "welcome-home", imageUrl: "/backgrounds/welcome-home.png" };
const MEMBER_CHOICE = { backgroundId: "library", imageUrl: "/backgrounds/library.png" };
const ROOM_REQUIRED = {
  backgroundId: "boardroom-round-table",
  imageUrl: "/backgrounds/round-table.png",
  reason: "Boardroom's own identity plate",
};
const REMEMBERED = { backgroundId: "fireside-deck", imageUrl: "/backgrounds/fireside-deck.png" };
const RECOMMENDATION = {
  backgroundId: "greenhouse",
  imageUrl: "/backgrounds/greenhouse.png",
  reason: "time-of-day:morning",
};
const DEDICATED_REQUIRED = {
  backgroundId: "journal-desk",
  imageUrl: "/backgrounds/journal-desk.png",
  required: true,
  reason: "Journal Gazebo canonical plate",
};

describe("resolveEstateBackground", () => {
  it("dedicated experience wins when required, even over member choice", () => {
    const result = resolveEstateBackground({
      place: "journal",
      dedicatedExperience: DEDICATED_REQUIRED,
      memberChoice: MEMBER_CHOICE,
      remembered: REMEMBERED,
      default: DEFAULT,
    });
    expect(result.source).toBe("dedicated-experience");
    expect(result.backgroundId).toBe("journal-desk");
    expect(result.memberSelected).toBe(false);
    expect(result.temporary).toBe(true);
    expect(result.persistencePolicy).toBe("fixed");
  });

  it("dedicated experience does NOT win when required is false", () => {
    const result = resolveEstateBackground({
      place: "some-room",
      dedicatedExperience: { ...DEDICATED_REQUIRED, required: false },
      memberChoice: MEMBER_CHOICE,
      default: DEFAULT,
    });
    expect(result.source).toBe("member-choice");
    expect(result.backgroundId).toBe("library");
  });

  it("explicit member choice wins over remembered, default, and system recommendation", () => {
    const result = resolveEstateBackground({
      place: "welcome-home",
      memberChoice: MEMBER_CHOICE,
      remembered: REMEMBERED,
      systemRecommendation: RECOMMENDATION,
      default: DEFAULT,
    });
    expect(result.source).toBe("member-choice");
    expect(result.backgroundId).toBe("library");
    expect(result.memberSelected).toBe(true);
    expect(result.persistencePolicy).toBe("member-preference");
    // The recommendation is carried as metadata but never becomes the winner.
    expect(result.recommendation).toEqual(RECOMMENDATION);
    expect(result.recommendationOnly).toBe(false);
  });

  it("routine navigation does not erase or downgrade member choice across repeated calls", () => {
    const base: Omit<EstateBackgroundRequest, "remembered" | "systemRecommendation"> = {
      place: "welcome-home",
      memberChoice: MEMBER_CHOICE,
      roomRequired: ROOM_REQUIRED,
      default: DEFAULT,
    };
    const simulatedNavigations: Array<
      Pick<EstateBackgroundRequest, "remembered" | "systemRecommendation">
    > = [
      { remembered: null, systemRecommendation: null },
      { remembered: REMEMBERED, systemRecommendation: null },
      { remembered: null, systemRecommendation: RECOMMENDATION },
      {
        remembered: { backgroundId: "tea-room", imageUrl: "/backgrounds/tea-room.png" },
        systemRecommendation: { ...RECOMMENDATION, reason: "emotion:overwhelmed" },
      },
    ];

    for (const nav of simulatedNavigations) {
      const result = resolveEstateBackground({ ...base, ...nav });
      expect(result.source).toBe("member-choice");
      expect(result.backgroundId).toBe("library");
      expect(result.imageUrl).toBe(MEMBER_CHOICE.imageUrl);
    }
  });

  it("room-required background wins when there is no member choice", () => {
    const result = resolveEstateBackground({
      place: "boardroom",
      roomRequired: ROOM_REQUIRED,
      remembered: REMEMBERED,
      default: DEFAULT,
    });
    expect(result.source).toBe("room-required");
    expect(result.backgroundId).toBe("boardroom-round-table");
    expect(result.reason).toBe(ROOM_REQUIRED.reason);
  });

  it("room-required background does NOT win once a member choice exists (approved case only)", () => {
    const result = resolveEstateBackground({
      place: "boardroom",
      memberChoice: MEMBER_CHOICE,
      roomRequired: ROOM_REQUIRED,
      default: DEFAULT,
    });
    expect(result.source).toBe("member-choice");
    expect(result.backgroundId).toBe("library");
  });

  it("remembered last background is used when no explicit choice or room requirement exists", () => {
    const result = resolveEstateBackground({
      place: "welcome-home",
      remembered: REMEMBERED,
      default: DEFAULT,
    });
    expect(result.source).toBe("remembered");
    expect(result.backgroundId).toBe("fireside-deck");
    expect(result.persistencePolicy).toBe("session-remembered");
  });

  it("system recommendation never silently replaces the active choice, even with nothing else present", () => {
    const result = resolveEstateBackground({
      place: "welcome-home",
      systemRecommendation: RECOMMENDATION,
      default: DEFAULT,
    });
    // Only default and the recommendation exist — the recommendation must
    // NOT become the resolved background; default wins instead.
    expect(result.source).toBe("default");
    expect(result.backgroundId).toBe(DEFAULT.backgroundId);
    expect(result.recommendation).toEqual(RECOMMENDATION);
    expect(result.recommendationOnly).toBe(false);
  });

  it("default is used only when nothing stronger exists", () => {
    const result = resolveEstateBackground({ place: "welcome-home", default: DEFAULT });
    expect(result.source).toBe("default");
    expect(result.backgroundId).toBe(DEFAULT.backgroundId);
    expect(result.imageUrl).toBe(DEFAULT.imageUrl);
    expect(result.memberSelected).toBe(false);
    expect(result.persistencePolicy).toBe("not-persisted");
  });

  it.each([
    { ...RECOMMENDATION, reason: "time-of-day:evening" },
    { ...RECOMMENDATION, reason: "emotion:overwhelmed" },
    { ...RECOMMENDATION, reason: "topic-seed:new-project-kickoff" },
  ])(
    "time/emotion/topic-seed inputs ($reason) cannot override an explicit choice",
    (systemRecommendation) => {
      const result = resolveEstateBackground({
        place: "home",
        memberChoice: MEMBER_CHOICE,
        systemRecommendation,
        default: DEFAULT,
      });
      expect(result.source).toBe("member-choice");
      expect(result.backgroundId).toBe("library");
    },
  );

  it("deterministic output for identical inputs", () => {
    const request: EstateBackgroundRequest = {
      place: "welcome-home",
      memberChoice: MEMBER_CHOICE,
      roomRequired: ROOM_REQUIRED,
      remembered: REMEMBERED,
      systemRecommendation: RECOMMENDATION,
      default: DEFAULT,
    };
    const first = resolveEstateBackground(request);
    const second = resolveEstateBackground(request);
    expect(first).toEqual(second);
  });

  it("invalid member choice (empty imageUrl) falls through to room-required", () => {
    const result = resolveEstateBackground({
      place: "boardroom",
      memberChoice: { backgroundId: "library", imageUrl: "" },
      roomRequired: ROOM_REQUIRED,
      default: DEFAULT,
    });
    expect(result.source).toBe("room-required");
    expect(result.fallbackReason).toContain("member choice was present but invalid");
  });

  it("invalid member choice (empty backgroundId) falls through to remembered", () => {
    const result = resolveEstateBackground({
      place: "welcome-home",
      memberChoice: { backgroundId: "", imageUrl: "/backgrounds/library.png" },
      remembered: REMEMBERED,
      default: DEFAULT,
    });
    expect(result.source).toBe("remembered");
    expect(result.backgroundId).toBe("fireside-deck");
  });

  it("all optional tiers invalid or missing falls back safely to default without crashing", () => {
    const result = resolveEstateBackground({
      place: "welcome-home",
      memberChoice: { backgroundId: "", imageUrl: "" },
      roomRequired: null,
      remembered: undefined,
      default: DEFAULT,
    });
    expect(result.source).toBe("default");
    expect(result.backgroundId).toBe(DEFAULT.backgroundId);
    expect(result.imageUrl).toBe(DEFAULT.imageUrl);
    expect(result.fallbackReason).toContain("member choice was present but invalid");
  });

  it("even a malformed default falls back safely — never throws, never invents data", () => {
    expect(() =>
      resolveEstateBackground({
        place: "welcome-home",
        default: { backgroundId: "", imageUrl: "" },
      }),
    ).not.toThrow();
    const result = resolveEstateBackground({
      place: "welcome-home",
      default: { backgroundId: "", imageUrl: "" },
    });
    expect(result.source).toBe("default");
    expect(result.fallbackReason).toContain(
      "default background was missing a backgroundId or imageUrl",
    );
  });

  it("Clear My Mind's scoped member choice wins exactly like any other place — no special-casing", () => {
    const clearMyMindResult = resolveEstateBackground({
      place: "clear-my-mind",
      memberChoice: { backgroundId: "sunroom", imageUrl: "/backgrounds/sunroom.png" },
      remembered: { backgroundId: "greenhouse", imageUrl: "/backgrounds/greenhouse.png" },
      default: { backgroundId: "sunroom", imageUrl: "/backgrounds/sunroom.png" },
    });
    expect(clearMyMindResult.source).toBe("member-choice");
    expect(clearMyMindResult.backgroundId).toBe("sunroom");
    expect(clearMyMindResult.memberSelected).toBe(true);

    // Same shaped input against an unrelated place resolves identically —
    // proving there is no hardcoded "clear-my-mind" branch inside the resolver.
    const otherPlaceResult = resolveEstateBackground({
      place: "some-other-room",
      memberChoice: { backgroundId: "sunroom", imageUrl: "/backgrounds/sunroom.png" },
      remembered: { backgroundId: "greenhouse", imageUrl: "/backgrounds/greenhouse.png" },
      default: { backgroundId: "sunroom", imageUrl: "/backgrounds/sunroom.png" },
    });
    expect(otherPlaceResult.source).toBe(clearMyMindResult.source);
    expect(otherPlaceResult.backgroundId).toBe(clearMyMindResult.backgroundId);
  });

  it("Clear My Mind still falls to its own remembered/default tiers when no choice is saved", () => {
    const result = resolveEstateBackground({
      place: "clear-my-mind",
      remembered: { backgroundId: "greenhouse", imageUrl: "/backgrounds/greenhouse.png" },
      default: { backgroundId: "sunroom", imageUrl: "/backgrounds/sunroom.png" },
    });
    expect(result.source).toBe("remembered");
    expect(result.backgroundId).toBe("greenhouse");
  });

  it("has no audio-related input — an audio-shaped property has zero effect on resolution", () => {
    // *.test.ts is excluded from this project's tsc --noEmit (tsconfig.json),
    // so a type-only @ts-expect-error would never actually be checked. This
    // proves the stronger, enforced guarantee instead: even if a caller
    // smuggled an audio field past the type system, the resolver ignores it.
    const withoutAudioField = resolveEstateBackground({
      place: "home",
      memberChoice: MEMBER_CHOICE,
      default: DEFAULT,
    });
    const withAudioField = resolveEstateBackground({
      place: "home",
      memberChoice: MEMBER_CHOICE,
      default: DEFAULT,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioEnabled: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(withAudioField).toEqual(withoutAudioField);
  });
});
