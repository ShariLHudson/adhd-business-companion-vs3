"use client";

import type { TodaysPath } from "@/lib/momentumBuilderRoom/types";

type Props = {
  path: TodaysPath;
};

/** Today's Path™ on the planning table — a journey, not a checklist. */
export function MomentumBuilderPlanningTable({ path }: Props) {
  const hasFirstStep = Boolean(path.firstStep);
  const hasEasyWins = path.easyWins.length > 0;
  const hasFocus = path.focusSessions.length > 0;
  const hasRoadblocks = path.roadblocks.length > 0;
  const hasTomorrow = Boolean(path.tomorrowStartsHere?.trim());

  return (
    <div
      className="momentum-builder-room__notebook momentum-builder-room__notebook--open"
      data-testid="momentum-planning-table"
    >
      <div className="momentum-builder-room__notebook-spine" aria-hidden />
      <div className="momentum-builder-room__notebook-page">
        <p className="momentum-builder-room__path-journey-label">Today&apos;s Path™</p>
        <h2 className="momentum-builder-room__path-headline">{path.headline}</h2>

        {hasFirstStep && path.firstStep ? (
          <section className="momentum-builder-room__path-section">
            <h3 className="momentum-builder-room__path-section-title">First Step™</h3>
            <p className="momentum-builder-room__path-section-body">
              {path.firstStep.label}
            </p>
            {path.firstStep.rationale ? (
              <p className="momentum-builder-room__path-section-note">
                {path.firstStep.rationale}
              </p>
            ) : null}
          </section>
        ) : null}

        {hasEasyWins ? (
          <section className="momentum-builder-room__path-section">
            <h3 className="momentum-builder-room__path-section-title">Easy Win™</h3>
            <ul className="momentum-builder-room__path-list">
              {path.easyWins.map((win) => (
                <li key={win.id}>{win.label}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasFocus ? (
          <section className="momentum-builder-room__path-section">
            <h3 className="momentum-builder-room__path-section-title">
              Focus Session™
            </h3>
            <ul className="momentum-builder-room__path-list">
              {path.focusSessions.map((session) => (
                <li key={session.id}>
                  {session.label}
                  {session.durationMinutes
                    ? ` · ${session.durationMinutes} min`
                    : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasRoadblocks ? (
          <section className="momentum-builder-room__path-section">
            <h3 className="momentum-builder-room__path-section-title">Roadblocks™</h3>
            <ul className="momentum-builder-room__path-list momentum-builder-room__path-list--soft">
              {path.roadblocks.map((block) => (
                <li key={block.id}>{block.label}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasTomorrow ? (
          <section className="momentum-builder-room__path-section">
            <h3 className="momentum-builder-room__path-section-title">
              Tomorrow Starts Here™
            </h3>
            <p className="momentum-builder-room__path-section-body">
              {path.tomorrowStartsHere}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}
