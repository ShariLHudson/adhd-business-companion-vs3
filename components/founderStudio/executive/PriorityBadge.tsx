import type { FounderLabelTone } from "@/lib/founder/types";

import { FounderLabel } from "../FounderLabel";
import { toneDisplayLabel } from "./toneDisplayLabel";

type PriorityBadgeProps = {
  tone: FounderLabelTone;
  children?: string;
};

export function PriorityBadge({ tone, children }: PriorityBadgeProps) {
  return (
    <FounderLabel tone={tone}>{children ?? toneDisplayLabel(tone) ?? tone}</FounderLabel>
  );
}
