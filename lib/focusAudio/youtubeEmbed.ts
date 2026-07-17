export type YoutubeEmbedResult =
  | { kind: "embed"; videoId: string; embedUrl: string }
  | { kind: "not-embeddable"; reason: string };

const YOUTUBE_HOST =
  /(?:youtube\.com|youtu\.be|youtube-nocookie\.com|m\.youtube\.com)/i;

/** True when the URL points at YouTube (watch page, short link, embed, etc.). */
export function isYoutubeUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const host = new URL(trimmed).hostname;
    return YOUTUBE_HOST.test(host);
  } catch {
    return YOUTUBE_HOST.test(trimmed);
  }
}

/** Extract a single video id — null for search pages, bare playlists, or invalid URLs. */
export function parseYoutubeVideoId(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed || !isYoutubeUrl(trimmed)) return null;

  try {
    const parsed = new URL(trimmed);

    if (parsed.hostname === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      return id && id.length >= 6 ? id : null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      const id = parsed.pathname.replace("/embed/", "").split("/")[0];
      return id && id.length >= 6 ? id : null;
    }

    if (parsed.pathname.startsWith("/shorts/")) {
      const id = parsed.pathname.replace("/shorts/", "").split("/")[0];
      return id && id.length >= 6 ? id : null;
    }

    if (parsed.pathname === "/watch") {
      const id = parsed.searchParams.get("v");
      return id && id.length >= 6 ? id : null;
    }

    if (parsed.pathname === "/results" || parsed.searchParams.has("search_query")) {
      return null;
    }

    return null;
  } catch {
    const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (watchMatch?.[1]) return watchMatch[1];
    const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch?.[1]) return shortMatch[1];
    return null;
  }
}

/** Prepare embed — does not autoplay; member starts playback in the player. */
export function toYoutubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "0",
    rel: "0",
    modestbranding: "1",
  });
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

export function resolveYoutubeEmbed(url: string): YoutubeEmbedResult {
  if (!isYoutubeUrl(url)) {
    return {
      kind: "not-embeddable",
      reason: "This is not a YouTube link.",
    };
  }

  const videoId = parseYoutubeVideoId(url);
  if (!videoId) {
    return {
      kind: "not-embeddable",
      reason:
        "This YouTube page cannot play inside the app — try a direct video link (not a search results page).",
    };
  }

  return {
    kind: "embed",
    videoId,
    embedUrl: toYoutubeEmbedUrl(videoId),
  };
}
