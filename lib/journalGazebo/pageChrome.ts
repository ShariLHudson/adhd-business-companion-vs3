/** Rotating estate watermarks and occasional page decorations — almost watermark level. */

export type PageWatermarkId =
  | "gazebo"
  | "greenhouse"
  | "library"
  | "observatory"
  | "garden"
  | "pond"
  | "fountain"
  | "conservatory"
  | "gates"
  | "discovery-key"
  | "horse"
  | "lantern"
  | "trees"
  | "flowers";

export type PageDecorationKind =
  | "none"
  | "quote"
  | "discovery-key"
  | "pressed-flower"
  | "estate-seal"
  | "flourish"
  | "botanical";

const WATERMARKS: PageWatermarkId[] = [
  "gazebo",
  "greenhouse",
  "library",
  "observatory",
  "garden",
  "pond",
  "fountain",
  "conservatory",
  "gates",
  "discovery-key",
  "horse",
  "lantern",
  "trees",
  "flowers",
];

const ESTATE_QUOTES = [
  "Small steps become extraordinary journeys.",
  "Write what you want to remember.",
  "One honest line is enough.",
  "This page will wait for you.",
  "Let the garden keep your secrets.",
  "Slow is allowed here.",
  "What mattered today?",
  "Someone is proud of you for showing up.",
];

export function pageWatermarkForIndex(
  pageIndex: number,
  side: "left" | "right",
): PageWatermarkId {
  const seed = Math.max(0, pageIndex) * 2 + (side === "right" ? 1 : 0);
  return WATERMARKS[seed % WATERMARKS.length]!;
}

/** Hidden notes — roughly every 7 pages after the opening spreads. */
export function pageDecorationForIndex(pageIndex: number): {
  kind: PageDecorationKind;
  quote?: string;
} {
  if (pageIndex >= 5 && pageIndex % 7 === 5) {
    const quoteIndex = Math.floor(pageIndex / 7) % ESTATE_QUOTES.length;
    return { kind: "quote", quote: ESTATE_QUOTES[quoteIndex]! };
  }
  if (pageIndex % 11 === 8) return { kind: "flourish" };
  if (pageIndex % 13 === 9) return { kind: "pressed-flower" };
  if (pageIndex % 17 === 12) return { kind: "estate-seal" };
  return { kind: "none" };
}
