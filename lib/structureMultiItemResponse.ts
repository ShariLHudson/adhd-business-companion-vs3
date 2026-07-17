/**
 * Global readability repair for multi-item companion replies.
 * Parses inline numbered lists crushed into one paragraph and separates them
 * before display — without relying on the model to emit line breaks.
 */

const PROTECTED_TOKEN = "\uE000";
const PROTECTED_END = "\uE001";

/** Numbered item marker: "1. Word" — not decimals (1.5), money ($3.50), or versions (2.0). */
const NUMBERED_ITEM_MARKER =
  /\b([1-9]|1[0-9])\.\s+(?=[A-Za-zÀ-ÖØ-öø-ÿ“"‘'])/g;

function protectSegments(text: string): {
  text: string;
  restore: (s: string) => string;
} {
  const blocks: string[] = [];
  const push = (m: string) => {
    const i = blocks.length;
    blocks.push(m);
    return `${PROTECTED_TOKEN}${i}${PROTECTED_END}`;
  };

  let out = text.replace(/```[\s\S]*?```/g, push);
  out = out.replace(/`[^`\n]+`/g, push);
  out = out.replace(/\[[^\]]+\]\([^)]+\)/g, push);

  return {
    text: out,
    restore: (s: string) =>
      s.replace(
        new RegExp(`${PROTECTED_TOKEN}(\\d+)${PROTECTED_END}`, "g"),
        (_, i: string) => blocks[Number(i)] ?? "",
      ),
  };
}

function collectMarkers(paragraph: string): { index: number; num: number }[] {
  const markers: { index: number; num: number }[] = [];
  NUMBERED_ITEM_MARKER.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = NUMBERED_ITEM_MARKER.exec(paragraph)) !== null) {
    markers.push({ index: m.index, num: parseInt(m[1]!, 10) });
  }
  return markers;
}

function looksLikeNumberedSequence(
  markers: { index: number; num: number }[],
): boolean {
  if (markers.length < 2) return false;
  const has1 = markers.some((x) => x.num === 1);
  const has2 = markers.some((x) => x.num === 2);
  if (has1 && has2) return true;
  for (let i = 0; i < markers.length - 1; i++) {
    if (markers[i + 1]!.num === markers[i]!.num + 1) return true;
  }
  return false;
}

/** True when numbered items already start on their own lines. */
function alreadyLineBrokenList(text: string): boolean {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return false;
  const numbered = lines.filter((l) => /^\d{1,2}\.\s+\S/.test(l));
  return numbered.length >= 2;
}

function splitInlineNumberedList(paragraph: string): string {
  const markers = collectMarkers(paragraph);
  if (!looksLikeNumberedSequence(markers)) return paragraph;

  let startAt = markers.findIndex((x) => x.num === 1);
  if (startAt < 0) startAt = 0;
  const seq = markers.slice(startAt);
  if (seq.length < 2) return paragraph;

  const firstItemAt = seq[0]!.index;
  const intro = paragraph.slice(0, firstItemAt).trim();
  const items: string[] = [];
  for (let i = 0; i < seq.length; i++) {
    const from = seq[i]!.index;
    const to = i + 1 < seq.length ? seq[i + 1]!.index : paragraph.length;
    const item = paragraph.slice(from, to).trim();
    if (item) items.push(item);
  }

  return [...(intro ? [intro] : []), ...items].join("\n\n");
}

/** Ensure consecutive numbered item lines have a blank line between them. */
function ensureNumberedItemSpacing(text: string): string {
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    out.push(line);
    const next = lines[i + 1];
    if (
      next !== undefined &&
      /^\d{1,2}\.\s+\S/.test(line.trim()) &&
      /^\d{1,2}\.\s+\S/.test(next.trim())
    ) {
      out.push("");
    }
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

function structureChunk(chunk: string): string {
  const trimmed = chunk.trim();
  if (!trimmed) return trimmed;

  if (alreadyLineBrokenList(trimmed)) {
    return ensureNumberedItemSpacing(trimmed);
  }

  // Crush case: multiple numbered markers in one unbroken (or mostly unbroken) chunk.
  const markers = collectMarkers(trimmed);
  if (!looksLikeNumberedSequence(markers)) return trimmed;

  // If markers sit on distinct lines already, only ensure spacing.
  const markerLines = new Set(
    markers.map((m) => trimmed.slice(0, m.index).split("\n").length),
  );
  if (markerLines.size >= 2 && trimmed.includes("\n")) {
    return ensureNumberedItemSpacing(trimmed);
  }

  return splitInlineNumberedList(trimmed);
}

/**
 * Separate inline multi-item lists into readable blocks.
 * Safe on ordinary paragraphs, dates, decimals, code, and links.
 */
export function structureMultiItemResponse(text: string): string {
  if (!text?.trim()) return text ?? "";

  const { text: protectedText, restore } = protectSegments(
    text.replace(/\r\n/g, "\n"),
  );

  const blocks = protectedText.split(/\n{2,}/);
  const structured = blocks.map((block) => structureChunk(block));

  return restore(
    structured
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  );
}

export function shouldStructureMultiItemResponse(text: string): boolean {
  if (!text?.trim()) return false;
  return looksLikeNumberedSequence(
    collectMarkers(text.replace(/\r\n/g, "\n")),
  );
}
