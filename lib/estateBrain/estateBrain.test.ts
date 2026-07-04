/**
 * Estate Brain™ — search and routing from one knowledge registry.
 */

import { describe, expect, it } from "vitest";
import {
  resolveExperienceFromBrain,
  searchEstateBrain,
  searchEstateBrainByNeed,
  searchEstateBrainFromNaturalQuestion,
  whatCanIDoHere,
} from "./search";
import { estateBrainEntryById } from "./knowledgeRegistry";

describe("Estate Brain search", () => {
  it("routes write email to Create", () => {
    const result = searchEstateBrain("help me write an email");
    expect(result.best?.entry.experienceId).toBe("create");
    expect(result.best!.score).toBeGreaterThan(14);
  });

  it("routes project launch to Momentum", () => {
    const result = searchEstateBrain("I need to plan my launch");
    expect(result.best?.entry.experienceId).toBe("momentum");
  });

  it("finds restore spaces when overwhelmed", () => {
    const matches = searchEstateBrainByNeed("overwhelmed");
    const names = matches.map((m) => m.entry.name);
    expect(names).toContain("Restore");
    expect(names.some((n) => /clear my mind|sunroom|hammock/i.test(n))).toBe(
      true,
    );
  });

  it("answers where to build business", () => {
    const result = searchEstateBrainFromNaturalQuestion(
      "where can I build my business?",
    );
    const ids = result.matches.map((m) => m.entry.experienceId);
    expect(ids).toContain("business");
    expect(ids).toContain("momentum");
    expect(ids).toContain("create");
  });

  it("resolveExperienceFromBrain matches create intents", () => {
    expect(resolveExperienceFromBrain("draft a newsletter")).toBe("create");
    expect(resolveExperienceFromBrain("weekly planning")).toBe("momentum");
    expect(resolveExperienceFromBrain("journal gratitude")).toBe("journal");
  });

  it("whatCanIDoHere returns capabilities for Journal Gazebo", () => {
    const entry = whatCanIDoHere("journal");
    expect(entry?.name).toBe("Journal");
    expect(entry?.capabilities).toContain("Gratitude");
    expect(entry?.capabilities).toContain("Prayer");
  });

  it("Create entry has expected structure", () => {
    const create = estateBrainEntryById("create");
    expect(create?.purpose).toBe("Bring ideas to life.");
    expect(create?.relatedSpaceIds).toContain("goals-projects");
    expect(create?.triggers).toContain("email");
  });
});
