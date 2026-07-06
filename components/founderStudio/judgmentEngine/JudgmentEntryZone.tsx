"use client";

import type { ExecutiveJudgmentView } from "@/lib/executiveJudgmentEngine/types";

type JudgmentEntryZoneProps = {
  view: ExecutiveJudgmentView;
  onOpenPyramid: () => void;
};

export function JudgmentEntryZone({ view, onOpenPyramid }: JudgmentEntryZoneProps) {
  return (
    <section className="founder-judgment__entry" aria-labelledby="judgment-entry-title">
      <h2 className="founder-judgment__section-title" id="judgment-entry-title">
        {view.todaysQuestion}
      </h2>
      <p className="founder-judgment__lead">
        Everything competes. Judgment decides what deserves your attention today — not more information.
      </p>

      <article className="founder-judgment__primary-preview">
        <p className="founder-judgment__meta">Today&apos;s primary recommendation</p>
        <h3 className="founder-judgment__preview-headline">{view.pyramid.primary.headline}</h3>
        <p className="founder-judgment__prose">{view.pyramid.primary.summary}</p>
        <p className="founder-judgment__score-badge">
          Composite score {view.pyramid.primary.compositeScore} · {view.pyramid.primary.reasoning.confidence} confidence
        </p>
      </article>

      <button type="button" className="founder-judgment__primary-button" onClick={onOpenPyramid}>
        View Executive Judgment
      </button>
    </section>
  );
}
