import Link from "next/link";

import type { WorkspaceSuggestion } from "@/lib/founder/concierge/types";

type ConciergeWorkspaceSuggestionProps = {
  suggestion: WorkspaceSuggestion;
};

export function ConciergeWorkspaceSuggestion({
  suggestion,
}: ConciergeWorkspaceSuggestionProps) {
  return (
    <section
      className="founder-concierge-suggestion"
      aria-labelledby="concierge-workspace-heading"
    >
      <h2 className="founder-concierge-suggestion__title" id="concierge-workspace-heading">
        Workspace
      </h2>
      <p className="founder-concierge-suggestion__reason">{suggestion.reason}</p>
      <Link href={suggestion.href} className="founder-concierge-suggestion__link">
        {suggestion.title}
      </Link>
      <p className="founder-concierge-suggestion__optional">
        A gentle suggestion — stay here or choose any workspace below.
      </p>
    </section>
  );
}
