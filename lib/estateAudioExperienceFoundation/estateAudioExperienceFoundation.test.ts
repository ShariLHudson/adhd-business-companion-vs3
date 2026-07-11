import { describe, expect, it } from "vitest";
import { getLiveAudioCategories } from "./audioCategories";
import {
  audioExperiencesAtLocation,
  getAudioExperienceById,
  getLiveAudioExperiences,
} from "./audioExperiences";
import {
  audioExperienceIdFromLegacyFeature,
  audioExperiencesForEntity,
  audioExperiencesForNeedSignal,
} from "./audioMappings";
import { classifyAudioIntent } from "./classifyAudioIntent";
import {
  isResolvedAudioExperience,
  resolveAudioExperienceQuery,
} from "./resolveAudioExperienceQuery";

describe("Audio Experience Foundation", () => {
  it("loads live audio categories", () => {
    const categories = getLiveAudioCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some((cat) => cat.categoryId === "focus-ambience")).toBe(
      true,
    );
  });

  it("only surfaces live experiences with live primary locations", () => {
    const live = getLiveAudioExperiences();
    expect(live.every((exp) => exp.status === "Live")).toBe(true);
    expect(live.some((exp) => exp.audioExperienceId === "peaceful-places-focus")).toBe(
      true,
    );
    expect(
      live.some((exp) => exp.audioExperienceId === "coffee-house-murmur"),
    ).toBe(false);
  });

  it("maps music room to piano and peaceful places experiences", () => {
    const experiences = audioExperiencesForEntity("room", "music-room");
    expect(experiences.map((exp) => exp.audioExperienceId)).toEqual([
      "music-room-piano",
      "peaceful-places-focus",
    ]);
  });

  it("maps need-focus signal to focus audio experiences", () => {
    const experiences = audioExperiencesForNeedSignal("need-focus");
    expect(experiences[0]?.audioExperienceId).toBe("peaceful-places-focus");
  });

  it("bridges legacy focus-audio feature id to experience id", () => {
    expect(audioExperienceIdFromLegacyFeature("focus-audio")).toBe(
      "peaceful-places-focus",
    );
  });

  it("finds audio experiences at the current location", () => {
    const atMusicRoom = audioExperiencesAtLocation("music-room");
    expect(atMusicRoom.some((exp) => exp.location === "music-room")).toBe(true);
  });

  it("classifies music listening intent", () => {
    expect(classifyAudioIntent("Where can I listen to music?")?.kind).toBe(
      "where_audio",
    );
    expect(classifyAudioIntent("I want to hear music")?.kind).toBe("want_music");
  });

  it("resolves play focus audio without inventing tracks", () => {
    const decision = resolveAudioExperienceQuery("Play focus audio");
    expect(isResolvedAudioExperience(decision)).toBe(true);
    expect(decision.experiences[0]?.audioExperienceId).toBe(
      "peaceful-places-focus",
    );
    expect(decision.memberFacingResponse).not.toMatch(/playlist|track list/i);
  });

  it("explains how audio works for how-to questions", () => {
    const decision = resolveAudioExperienceQuery(
      "How does focus audio work?",
    );
    expect(decision.route).toBe("audio_how_to");
    expect(decision.memberFacingResponse).toContain("Peaceful Places");
  });

  it("returns unresolved for unrelated chat", () => {
    const decision = resolveAudioExperienceQuery("Write my newsletter");
    expect(decision.kind).toBe("unresolved");
  });

  it("experience records include required foundation fields", () => {
    const experience = getAudioExperienceById("peaceful-places-focus");
    expect(experience?.name).toBeTruthy();
    expect(experience?.purpose.length).toBeGreaterThan(0);
    expect(experience?.relatedLocations).toContain("music-room");
    expect(experience?.relatedFeatures).toContain("focus-audio");
  });
});
