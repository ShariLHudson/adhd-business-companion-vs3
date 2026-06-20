import { describe, expect, it } from "vitest";
import {
  buildAudiencePromptBlock,
  buildContentGenerationContext,
  CONTENT_VOICE_TONES,
  findContentAudienceOption,
  MATCH_AUDIENCE_TONE_ID,
  resolveToneForGeneration,
} from "./contentAudience";

describe("contentAudience", () => {
  it("preset audiences have distinct prompt blocks", () => {
    const adhd = findContentAudienceOption("preset:adhd-business");
    const wisdom = findContentAudienceOption("preset:wisdom");
    const workshop = findContentAudienceOption("preset:workshop-attendees");
    expect(adhd?.promptBlock).toMatch(/ADHD/i);
    expect(wisdom?.promptBlock).toMatch(/Wisdom Companion/i);
    expect(workshop?.promptBlock).toMatch(/Workshop Attendees/i);
    expect(adhd?.promptBlock).not.toBe(wisdom?.promptBlock);
  });

  it("audience block forbids generic motivational copy", () => {
    const block = buildAudiencePromptBlock("preset:adhd-business");
    expect(block).toMatch(/AUDIENCE-FIRST/i);
    expect(block).toMatch(/Do NOT write generic/i);
    expect(block).toMatch(/ADHD entrepreneurs often spend hours/i);
  });

  it("defaults tone to match audience", () => {
    expect(CONTENT_VOICE_TONES[0]?.id).toBe(MATCH_AUDIENCE_TONE_ID);
    const tone = resolveToneForGeneration(MATCH_AUDIENCE_TONE_ID, "ADHD audience");
    expect(tone).toMatch(/Match the audience/i);
  });

  it("buildContentGenerationContext puts audience before tone", () => {
    const ctx = buildContentGenerationContext({
      audienceId: "preset:coaches",
      toneId: "direct",
    });
    expect(ctx.indexOf("PRIMARY AUDIENCE")).toBeLessThan(
      ctx.indexOf("Voice/Tone"),
    );
    expect(ctx).toMatch(/Coaches/i);
    expect(ctx).toMatch(/Direct/i);
  });
});
