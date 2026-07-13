"use client";

import {
  PLANNING_CENTER_AREAS,
  PLANNING_CENTER_AREA_META,
  type PlanningCenterArea,
} from "@/lib/planMyDay/planningCenter";

type Props = {
  active: PlanningCenterArea;
  onChange: (area: PlanningCenterArea) => void;
};

/**
 * Sub-navigation for Plan My Day as Planning Center.
 * Parent remains Plan My Day; areas stay under one room.
 */
export function PlanMyDayPlanningNav({ active, onChange }: Props) {
  return (
    <nav
      className="plan-my-day-planning-nav"
      aria-label="Planning areas"
      data-testid="plan-my-day-planning-nav"
    >
      <ul className="plan-my-day-planning-nav__list">
        {PLANNING_CENTER_AREAS.map((area) => {
          const meta = PLANNING_CENTER_AREA_META[area];
          const isActive = area === active;
          return (
            <li key={area}>
              <button
                type="button"
                onClick={() => onChange(area)}
                className={
                  isActive
                    ? "plan-my-day-planning-nav__btn plan-my-day-planning-nav__btn--active"
                    : "plan-my-day-planning-nav__btn"
                }
                aria-current={isActive ? "page" : undefined}
                data-testid={`plan-area-${area}`}
                title={meta.purpose}
              >
                {meta.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
