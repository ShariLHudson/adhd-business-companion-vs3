import type { FounderLabelTone } from "@/lib/founder/types";

export function toneDisplayLabel(tone?: FounderLabelTone): string | undefined {
  if (!tone) return undefined;
  if (tone === "quick-win") return "Quick Win";
  if (tone === "on-deck") return "On Deck";
  return tone.charAt(0).toUpperCase() + tone.slice(1);
}
