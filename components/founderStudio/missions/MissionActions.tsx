import Link from "next/link";

import type { MissionAction } from "@/lib/founder/missions";

type MissionActionsProps = {
  actions: MissionAction[];
};

export function MissionActions({ actions }: MissionActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section className="founder-mission-actions" aria-labelledby="founder-mission-actions-title">
      <h3 className="founder-mission-actions__title" id="founder-mission-actions-title">
        Mission actions
      </h3>
      <ul className="founder-mission-actions__list">
        {actions.map((action) => (
          <li key={action.id} className="founder-mission-actions__item">
            {action.href ? (
              <Link className="founder-mission-actions__link" href={action.href}>
                <span className="founder-mission-actions__label">{action.label}</span>
                {action.summary ? (
                  <span className="founder-mission-actions__summary">{action.summary}</span>
                ) : null}
              </Link>
            ) : (
              <div className="founder-mission-actions__static">
                <span className="founder-mission-actions__label">{action.label}</span>
                {action.summary ? (
                  <span className="founder-mission-actions__summary">{action.summary}</span>
                ) : null}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
