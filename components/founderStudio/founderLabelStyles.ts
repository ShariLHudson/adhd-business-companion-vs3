import type { FounderLabelTone } from "@/lib/founderStudio/types";

export const FOUNDER_TONE_CLASS: Record<FounderLabelTone, string> = {
  critical: "founder-tone--critical",
  opportunity: "founder-tone--opportunity",
  "quick-win": "founder-tone--quick-win",
  "on-deck": "founder-tone--on-deck",
  insight: "founder-tone--insight",
  revenue: "founder-tone--revenue",
  ignore: "founder-tone--ignore",
};

export const FOUNDER_ACCENT_CLASS: Record<
  "teal" | "aqua" | "gold" | "bronze" | "purple",
  string
> = {
  teal: "founder-accent--teal",
  aqua: "founder-accent--aqua",
  gold: "founder-accent--gold",
  bronze: "founder-accent--bronze",
  purple: "founder-accent--purple",
};
