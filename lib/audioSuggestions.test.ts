import { describe, expect, it } from "vitest";
import { detectAudioRequest, isRhetoricalSoundUsage } from "./audioSuggestions";
import { detectStandaloneToolRequest } from "./standaloneToolRouting";
import { detectAudioIntent } from "./workspaceMode";

describe("detectAudioRequest — rhetorical sound (no Focus Audio)", () => {
  it.each([
    "I don't want it to sound like a tool",
    "I don't want it to sound like a tool, planner, or ecosystem",
    "Make this sound warmer",
    "That sounds good",
    "Does this sound right?",
    "It sounds too corporate",
    "That sounds like ChatGPT",
  ])("%s → not audio", (text) => {
    expect(isRhetoricalSoundUsage(text)).toBe(true);
    expect(detectAudioRequest(text).isAudio).toBe(false);
    expect(detectStandaloneToolRequest(text)).toBeNull();
    expect(detectAudioIntent(text)).toBeNull();
  });
});

describe("detectAudioRequest — allowed Focus Audio triggers", () => {
  it.each([
    "Open focus audio",
    "Play brown noise",
    "I need music to focus",
    "focus music please",
    "calming sounds for work",
    "background sound while I write",
    "help me focus with sound",
    "I need audio to focus",
    "open music",
  ])("%s → audio", (text) => {
    expect(detectAudioRequest(text).isAudio).toBe(true);
    expect(detectStandaloneToolRequest(text)?.tool).toBe("focus-audio");
  });

  it("treats energize requests as audio even without the word music", () => {
    const req = detectAudioRequest("I need something to energize me");
    expect(req.isAudio).toBe(true);
    expect(req.categoryId).toBe("motivation-boost");
  });

  it("routes explicit music requests", () => {
    expect(detectAudioRequest("I need music").isAudio).toBe(true);
  });

  it("routes calm requests to calm-brain", () => {
    expect(detectAudioRequest("something calm to listen to").categoryId).toBe(
      "calm-brain",
    );
  });

  it("routes calming audio without extra words", () => {
    const req = detectAudioRequest("calming audio");
    expect(req.isAudio).toBe(true);
    expect(req.categoryId).toBe("calm-brain");
  });

  it("routes motivation requests to motivation-boost", () => {
    const req = detectAudioRequest("I need motivation");
    expect(req.isAudio).toBe(true);
    expect(req.categoryId).toBe("motivation-boost");
  });

  it("routes motivational audio phrasing", () => {
    const req = detectAudioRequest("play something motivational");
    expect(req.isAudio).toBe(true);
    expect(req.categoryId).toBe("motivation-boost");
  });
});
