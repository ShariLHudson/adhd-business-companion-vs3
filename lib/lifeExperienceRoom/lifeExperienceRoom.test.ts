import { describe, expect, it } from "vitest";
import {
  getLifeExperienceLetter,
  isLifeExperienceLetterId,
  LIFE_EXPERIENCE_LETTERS,
  LIFE_EXPERIENCE_ROOM_TAGLINE,
} from "@/lib/lifeExperienceRoom";
import { resolveEnvironment } from "@/lib/companionConstitution/environmentIntelligence/resolveEnvironment";

describe("lifeExperienceRoom", () => {
  it("exposes twelve letter invitations", () => {
    expect(LIFE_EXPERIENCE_LETTERS).toHaveLength(12);
    expect(LIFE_EXPERIENCE_ROOM_TAGLINE).toBe("Let's sit together for a while.");
  });

  it("resolves letters by id", () => {
    expect(getLifeExperienceLetter("kinsey")?.title).toBe(
      "What Kinsey Has Taught Me",
    );
    expect(isLifeExperienceLetterId("kinsey")).toBe(true);
    expect(isLifeExperienceLetterId("not-a-letter")).toBe(false);
  });

  it("each letter includes reflection questions", () => {
    for (const letter of LIFE_EXPERIENCE_LETTERS) {
      expect(letter.reflectionQuestions.length).toBeGreaterThanOrEqual(2);
      expect(letter.paragraphs.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("life-experience environment", () => {
  it("uses full-screen homestead scene with custom ambient motion off", () => {
    const env = resolveEnvironment({
      section: "life-experience",
      workspaceId: "life-experience-room",
    });
    expect(env.workspaceId).toBe("life-experience-room");
    expect(env.placeId).toBe("reading-nook");
    expect(env.background.mode).toBe("photo-scene");
    expect(env.background.dominanceCap).toBeGreaterThanOrEqual(0.94);
    expect(env.motionProfile.enabled).toBe(false);
    expect(env.motionProfile.placement).toBe("none");
  });
});
