import { describe, expect, it } from "vitest";
import {
  isYoutubeUrl,
  parseYoutubeVideoId,
  resolveYoutubeEmbed,
  toYoutubeEmbedUrl,
} from "./youtubeEmbed";

describe("youtubeEmbed", () => {
  it("detects YouTube hosts", () => {
    expect(isYoutubeUrl("https://www.youtube.com/watch?v=mPZkdNFkNps")).toBe(
      true,
    );
    expect(isYoutubeUrl("https://open.spotify.com/track/abc")).toBe(false);
  });

  it("parses watch and short links", () => {
    expect(parseYoutubeVideoId("https://www.youtube.com/watch?v=mPZkdNFkNps")).toBe(
      "mPZkdNFkNps",
    );
    expect(parseYoutubeVideoId("https://youtu.be/mPZkdNFkNps")).toBe(
      "mPZkdNFkNps",
    );
  });

  it("rejects search result pages", () => {
    expect(
      parseYoutubeVideoId(
        "https://www.youtube.com/results?search_query=brown+noise+adhd+focus",
      ),
    ).toBeNull();
    expect(
      resolveYoutubeEmbed(
        "https://www.youtube.com/results?search_query=rain",
      ).kind,
    ).toBe("not-embeddable");
  });

  it("builds nocookie embed URLs with autoplay", () => {
    expect(toYoutubeEmbedUrl("abc123xyz01")).toContain(
      "youtube-nocookie.com/embed/abc123xyz01",
    );
    expect(toYoutubeEmbedUrl("abc123xyz01")).toContain("autoplay=0");
  });
});
