import type { FounderLabelTone } from "@/lib/founder/types";

import { FounderLabel } from "../FounderLabel";
import { toneDisplayLabel } from "./toneDisplayLabel";

type StatusChipProps = {
  tone?: FounderLabelTone;
  label: string;
};

export function StatusChip({ tone = "on-deck", label }: StatusChipProps) {
  return <FounderLabel tone={tone}>{label || toneDisplayLabel(tone) || tone}</FounderLabel>;
}
