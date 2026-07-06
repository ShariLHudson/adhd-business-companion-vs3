import type { FounderLabelTone } from "@/lib/founderStudio/types";

import { FOUNDER_TONE_CLASS } from "./founderLabelStyles";

type FounderLabelProps = {
  tone: FounderLabelTone;
  children: React.ReactNode;
};

export function FounderLabel({ tone, children }: FounderLabelProps) {
  return (
    <span className={`founder-label ${FOUNDER_TONE_CLASS[tone]}`}>
      {children}
    </span>
  );
}
