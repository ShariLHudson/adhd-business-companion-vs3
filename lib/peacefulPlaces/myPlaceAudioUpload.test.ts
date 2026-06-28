import { describe, expect, it } from "vitest";
import { isMyPlaceAudioFile } from "./myPlaceAudioUpload";

describe("myPlaceAudioUpload", () => {
  it("accepts common audio mime types and extensions", () => {
    expect(isMyPlaceAudioFile(new File(["x"], "rain.mp3", { type: "audio/mpeg" }))).toBe(
      true,
    );
    expect(isMyPlaceAudioFile(new File(["x"], "calm.wav", { type: "" }))).toBe(true);
    expect(isMyPlaceAudioFile(new File(["x"], "notes.txt", { type: "text/plain" }))).toBe(
      false,
    );
  });
});
