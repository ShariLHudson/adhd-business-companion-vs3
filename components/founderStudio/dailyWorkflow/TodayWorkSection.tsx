import Link from "next/link";

import type { FounderDailyWorkflow, TodayWorkItem } from "@/lib/founder/dailyWorkflow";

type TodayWorkSectionProps = {
  workflow: FounderDailyWorkflow;
};

function WorkList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: TodayWorkItem[];
  emptyLabel?: string;
}) {
  if (items.length === 0) {
    return emptyLabel ? (
      <p className="founder-today-work__empty">{emptyLabel}</p>
    ) : null;
  }

  return (
    <div className="founder-today-work__group">
      <h3 className="founder-today-work__group-title">{title}</h3>
      <ul className="founder-today-work__list">
        {items.map((entry) => (
          <li
            key={entry.id}
            className={`founder-today-work__item founder-today-work__item--${entry.tone ?? "context"}`}
          >
            <span className="founder-today-work__item-title">{entry.title}</span>
            {entry.summary ? (
              <p className="founder-today-work__item-summary">{entry.summary}</p>
            ) : null}
            {entry.href ? (
              <Link className="founder-today-work__item-link" href={entry.href}>
                {entry.hrefLabel ?? "Open"}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Today's work — one executive surface, not modules. */
export function TodayWorkSection({ workflow }: TodayWorkSectionProps) {
  const { mission, workMode, primaryAction, opportunities, pendingDecisions, canWait } =
    workflow;

  return (
    <section className="founder-today-work" aria-labelledby="founder-today-work-title">
      <div className="founder-today-work__header">
        <p className="founder-today-work__mode">Today · {workMode.label}</p>
        <h2 className="founder-today-work__title" id="founder-today-work-title">
          {mission.title}
        </h2>
        <p className="founder-today-work__summary">{mission.summary}</p>
        <p className="founder-today-work__why">
          <span className="founder-today-work__why-label">Why it matters</span>
          {mission.whyItMatters}
        </p>
      </div>

      <div className="founder-today-work__primary">
        <p className="founder-today-work__primary-label">Start here</p>
        <p className="founder-today-work__primary-title">{primaryAction.title}</p>
        {primaryAction.summary ? (
          <p className="founder-today-work__primary-summary">{primaryAction.summary}</p>
        ) : null}
        {primaryAction.href ? (
          <Link className="founder-today-work__primary-action" href={primaryAction.href}>
            {primaryAction.hrefLabel ?? "Begin"}
          </Link>
        ) : null}
      </div>

      <div className="founder-today-work__columns">
        <WorkList title="Opportunities" items={opportunities} />
        <WorkList title="Decisions waiting" items={pendingDecisions} />
        <WorkList
          title="Can wait"
          items={canWait}
          emptyLabel="Nothing needs to compete for your attention right now."
        />
      </div>
    </section>
  );
}
