"use client";

import { useEffect, useState } from "react";
import { CalendarRoomShell } from "@/components/companion/CalendarRoomShell";
import { PlanMyDayCalendarArea } from "@/components/companion/PlanMyDayCalendarArea";
import { PLAN_MY_DAY_MORNING_COPY } from "@/lib/planMyDay/morningRoom";

export const CALENDAR_HOW_DO_I_COPY =
  "Connect your calendars and see your upcoming events in one place.";

function CalendarHowDoI() {
  const [open, setOpen] = useState(false);
  return (
    <div className="plan-day-how-do-i" data-testid="calendar-how-do-i">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="plan-day-how-do-i__toggle inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e4f4f] transition-colors hover:text-[#163c3c] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
        aria-expanded={open}
        data-testid="calendar-how-do-i-toggle"
      >
        How Do I?
        <span aria-hidden="true" className="text-xs font-bold">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <p
          className="plan-day-how-do-i__body mt-2 max-w-xl whitespace-pre-line text-sm leading-relaxed text-[#4b463f]"
          data-testid="calendar-how-do-i-body"
        >
          {CALENDAR_HOW_DO_I_COPY}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Dedicated My Workday → Calendar room — Connected Calendars via PlanMyDayCalendarArea.
 * Never opens Momentum Appointments, Plan My Day shell, Reminders, or Rhythms.
 */
export function CalendarRoomPanel({
  onBack,
  registerBack,
}: {
  onBack: () => void;
  registerBack?: (fn: (() => boolean) | null) => void;
}) {
  useEffect(() => {
    if (!registerBack) return;
    // No nested drill-down — return false so goBack restores the prior screen.
    registerBack(() => false);
    return () => registerBack(null);
  }, [registerBack]);

  return (
    <CalendarRoomShell onOutsideDismiss={onBack}>
      <div
        className="plan-day-morning-note"
        data-testid="calendar-room-panel"
      >
        <CalendarHowDoI />
        <div className="mt-3">
          <button
            type="button"
            className="plan-day-morning-note__previous"
            onClick={onBack}
            data-testid="app-back-button"
            aria-label="Previous Screen"
          >
            <span aria-hidden="true">←</span>
            <span>{PLAN_MY_DAY_MORNING_COPY.previousScreen}</span>
          </button>
        </div>
        <h1
          className="plan-day-morning-note__title mt-4"
          data-testid="calendar-title"
        >
          Calendar
        </h1>

        <PlanMyDayCalendarArea
          hideHeading
          authReturnPath="/companion?section=calendar"
        />
      </div>
    </CalendarRoomShell>
  );
}
