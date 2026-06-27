"use client";

import type { ReactNode } from "react";
import { PLAN_MY_DAY_MORNING_BG } from "@/lib/planMyDay/morningRoom";

type Props = {
  children: ReactNode;
};

/**
 * Full-screen Morning Room — background is the page; workspace floats on the desk.
 */
export function PlanMyDayMorningRoomShell({ children }: Props) {
  return (
    <div
      className="plan-my-day-morning-room"
      data-testid="plan-my-day-morning-room"
    >
      <div
        className="plan-my-day-morning-room__bg"
        style={{ backgroundImage: `url(${PLAN_MY_DAY_MORNING_BG})` }}
        aria-hidden
      />
      <div className="plan-my-day-morning-room__scroll">
        <div className="plan-my-day-morning-room__center">
          <div className="plan-my-day-morning-room__workspace">{children}</div>
        </div>
      </div>
    </div>
  );
}
