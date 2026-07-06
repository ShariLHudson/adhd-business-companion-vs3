import Link from "next/link";

import type { ThinkingSpaceSuggestion } from "@/lib/founder/concierge/types";

type ConciergeThinkingSpaceProps = {
  suggestion: ThinkingSpaceSuggestion;
};

export function ConciergeThinkingSpace({ suggestion }: ConciergeThinkingSpaceProps) {
  return (
    <section
      className="founder-concierge-thinking"
      aria-labelledby="concierge-thinking-heading"
    >
      <h2 className="founder-concierge-thinking__title" id="concierge-thinking-heading">
        Thinking Space
      </h2>
      <p className="founder-concierge-thinking__reason">{suggestion.reason}</p>
      <Link href={suggestion.href} className="founder-concierge-thinking__link">
        Continue in {suggestion.label}
      </Link>
    </section>
  );
}
