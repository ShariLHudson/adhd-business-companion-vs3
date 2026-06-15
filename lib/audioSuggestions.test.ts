import { describe, expect, it } from "vitest";
import { detectAudioRequest } from "./audioSuggestions";

describe("detectAudioRequest", () => {
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
