"use client";

import {
  findingMayShowCitation,
  type SharedResearchFinding,
} from "@/lib/research/types";
import { ResearchFindingCard } from "@/components/companion/research/ResearchFindingCard";

/**
 * Honest evidence presentation for a research collection.
 *
 * The old collection view rendered `collection.sourceReferences` (synthetic
 * topic-pack strings such as "Spark Estate stable knowledge") under a "Sources"
 * heading — presenting built-in guidance as if it were cited evidence. That is
 * gone. This section reads the SHARED evidence model instead:
 *
 * - Genuine sourced findings (`live_source` / `connected_source` whose sources
 *   are real citations — `findingMayShowCitation` is true) render under a
 *   "Sources" heading via the shared `ResearchFindingCard`, which shows the
 *   collapsible `ResearchSourceList`. Today the Research Library produces none
 *   of these, so the heading simply does not appear; when live retrieval lands
 *   (Stage 3B) genuine sources render here with no Research-Library-specific
 *   evidence model.
 * - Everything else — built-in frameworks and guidance — renders under
 *   "Frameworks and Guidance" with the shared Built-in Guidance label and NEVER
 *   a citation, publisher, date, URL, confidence, freshness, or verification
 *   badge (the shared card + `makeFinding` enforce this).
 */
export function CollectionEvidenceSection({
  findings,
}: {
  findings: SharedResearchFinding[];
}) {
  const cited = findings.filter(findingMayShowCitation);
  const hasGuidance = findings.some((f) => !findingMayShowCitation(f));

  return (
    <>
      {cited.length ? (
        <section data-testid="research-library-sources">
          <h3 className="text-lg font-semibold">Sources</h3>
          <div className="mt-2 space-y-2">
            {cited.map((f) => (
              <ResearchFindingCard key={f.id} finding={f} />
            ))}
          </div>
        </section>
      ) : null}

      {hasGuidance ? (
        <section data-testid="research-library-guidance">
          <h3 className="text-lg font-semibold">Knowledge &amp; Frameworks</h3>
          <p className="mt-1 text-sm text-[#6b6358]">
            These insights come from established frameworks and Spark Estate&rsquo;s
            built-in knowledge. They are not live web sources.
          </p>
        </section>
      ) : null}
    </>
  );
}
