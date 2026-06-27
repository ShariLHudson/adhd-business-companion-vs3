import { COMPANION_TTS_MAX_CHARS } from "@/lib/companionTts";

/**
 * Split long narration into ElevenLabs-safe chunks while preferring paragraph breaks.
 */
export function chunkSpeechText(
  text: string,
  maxLen = COMPANION_TTS_MAX_CHARS,
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= maxLen) return [trimmed];

  const chunks: string[] = [];
  const paragraphs = trimmed.split(/\n\n+/);
  let current = "";

  const flush = () => {
    if (current) {
      chunks.push(current);
      current = "";
    }
  };

  const pushLongParagraph = (paragraph: string) => {
    let rest = paragraph;
    while (rest.length > maxLen) {
      const slice = rest.slice(0, maxLen);
      const sentenceBreak = slice.lastIndexOf(". ");
      const wordBreak = slice.lastIndexOf(" ");
      const cut =
        sentenceBreak > maxLen * 0.45
          ? sentenceBreak + 2
          : wordBreak > maxLen * 0.45
            ? wordBreak + 1
            : maxLen;
      chunks.push(rest.slice(0, cut).trim());
      rest = rest.slice(cut).trim();
    }
    current = rest;
  };

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }
    flush();
    if (paragraph.length <= maxLen) {
      current = paragraph;
    } else {
      pushLongParagraph(paragraph);
    }
  }

  flush();
  return chunks;
}
