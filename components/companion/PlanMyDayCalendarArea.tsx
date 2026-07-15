"use client";

import { useEffect, useState } from "react";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import {
  connectedCalendarAuthHref,
  fetchConnectedCalendarsSnapshot,
  type CalendarProvider,
  type ConnectedCalendarsSnapshot,
  type UnifiedPlanningEvent,
} from "@/lib/connectedCalendars";
import { connectOutlookCalendarLocal } from "@/lib/connections";
import {
  memberCalendarLabel,
  openMemberCalendarExternal,
  rememberPreferredCalendarProvider,
  resolveMemberCalendarOpenTarget,
} from "@/lib/calendar/memberCalendarDestination";
import { formatPrefsClockTime, getTimeBlocks, todayStr } from "@/lib/companionStore";
import { readTodayPlanItems } from "@/lib/planMyDay";
import { PLANNING_CENTER_AREA_META } from "@/lib/planMyDay/planningCenter";

function formatEventClock(startTime?: string): string | null {
  if (!startTime) return null;
  const [h, m] = startTime.split(":").map(Number);
  if (Number.isNaN(h)) return startTime;
  const d = new Date();
  d.setHours(h ?? 0, m ?? 0, 0, 0);
  return formatPrefsClockTime(d);
}

function gatherSparkCalendarEvents(): UnifiedPlanningEvent[] {
  const today = todayStr();
  const fromBlocks = getTimeBlocks()
    .filter((b) => b.date && b.status !== "completed")
    .map((b) => ({
      id: `tb-${b.id}`,
      title: b.title,
      date: b.date,
      startTime: b.startTime,
      source: "spark-appointment" as const,
    }));

  const fromPlan = readTodayPlanItems()
    .filter((i) => !i.done && i.startTime)
    .map((i) => ({
      id: `plan-${i.id}`,
      title: i.title,
      date: i.dueDate ?? today,
      startTime: i.startTime,
      source: "spark-plan" as const,
    }));

  return [...fromBlocks, ...fromPlan].sort((a, b) => {
    const d = (a.date ?? "").localeCompare(b.date ?? "");
    if (d !== 0) return d;
    return (a.startTime ?? "").localeCompare(b.startTime ?? "");
  });
}

export type PlanMyDayCalendarAreaProps = {
  /**
   * When true, omit the inner Calendar heading — used by the dedicated
   * Calendar room which already shows the room title.
   */
  hideHeading?: boolean;
  /** Google OAuth return path (defaults to Plan My Day calendar area). */
  authReturnPath?: string;
  /** Open a plan item or appointment from the planning calendar list. */
  onOpenEvent?: (event: UnifiedPlanningEvent) => void;
};

/**
 * Planning Calendar home — Connected Calendars abstraction.
 * Reuses existing Google OAuth; Outlook plugs into the same snapshot.
 */
export function PlanMyDayCalendarArea({
  hideHeading = false,
  authReturnPath = "/companion?section=plan-my-day&planningArea=calendar",
  onOpenEvent,
}: PlanMyDayCalendarAreaProps) {
  const [snapshot, setSnapshot] = useState<ConnectedCalendarsSnapshot | null>(
    null,
  );
  const [events, setEvents] = useState<UnifiedPlanningEvent[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshSnapshot() {
    setLoading(true);
    const snap = await fetchConnectedCalendarsSnapshot();
    setSnapshot(snap);
    setEvents(gatherSparkCalendarEvents());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const snap = await fetchConnectedCalendarsSnapshot();
      if (cancelled) return;
      setSnapshot(snap);
      setEvents(gatherSparkCalendarEvents());
      setLoading(false);
    })();
    const sync = () => {
      void refreshSnapshot();
    };
    window.addEventListener("companion-outlook-calendar-updated", sync);
    window.addEventListener("companion-plan-my-day-updated", sync);
    return () => {
      cancelled = true;
      window.removeEventListener("companion-outlook-calendar-updated", sync);
      window.removeEventListener("companion-plan-my-day-updated", sync);
    };
  }, []);

  const connected = (snapshot?.connections.length ?? 0) > 0;
  const googleProvider = snapshot?.providers.find((p) => p.id === "google");
  const outlookProvider = snapshot?.providers.find((p) => p.id === "outlook");
  const connectHref = connectedCalendarAuthHref("google", authReturnPath);
  const outlookDisconnected = outlookProvider?.status === "disconnected";
  const openTarget = snapshot
    ? resolveMemberCalendarOpenTarget(snapshot)
    : null;

  function openMyCalendar(provider: CalendarProvider) {
    openMemberCalendarExternal(provider);
  }

  return (
    <div className="mt-4 flex flex-col gap-6" data-testid="plan-area-calendar-panel">
      {hideHeading ? null : (
        <div>
          <h2 className="text-xl font-semibold text-[#1f1c19]">
            {PLANNING_CENTER_AREA_META.calendar.label}
          </h2>
          <p className="mt-1 text-base text-[#6b635a]">
            {PLANNING_CENTER_AREA_META.calendar.purpose}
          </p>
        </div>
      )}

      <section
        className="rounded-xl border border-[#e7dfd4] bg-[#faf7f2] p-4"
        data-testid="connected-calendars"
      >
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          My Calendar
        </h3>

        {loading ? (
          <div className="mt-3">
            <SparkLoadingState message="Checking connections…" size="sm" />
          </div>
        ) : !connected ? (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-base text-[#1f1c19]">
              Connect the calendar you use — Google, Outlook, or another when
              available — and Spark will open that one.
            </p>
            <div className="flex flex-wrap gap-2">
              {connectHref && googleProvider?.status !== "unavailable" ? (
                <a
                  href={connectHref}
                  onClick={() => rememberPreferredCalendarProvider("google")}
                  className="companion-btn-primary inline-flex self-start rounded-xl px-4 py-2.5 text-sm font-semibold no-underline"
                  data-testid="connect-google-calendar"
                >
                  Connect Google Calendar
                </a>
              ) : null}
              {outlookDisconnected ? (
                <button
                  type="button"
                  onClick={() => {
                    connectOutlookCalendarLocal();
                    rememberPreferredCalendarProvider("outlook");
                    void refreshSnapshot();
                  }}
                  className="inline-flex self-start rounded-xl border border-[#d4cdc3] bg-white px-4 py-2.5 text-sm font-semibold text-[#4b463f]"
                  data-testid="connect-outlook-calendar"
                >
                  Connect Outlook Calendar
                </button>
              ) : null}
            </div>
            {!connectHref || googleProvider?.status === "unavailable" ? (
              <p className="text-sm text-[#6b635a]">
                Google Calendar connection isn&apos;t available in this
                environment yet. Outlook can still be prepared from Settings →
                Connections.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {snapshot!.connections.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-center gap-2 text-base text-[#1f1c19]"
                >
                  <span aria-hidden="true">✓</span>
                  <span className="font-semibold">{c.label} Connected</span>
                  {c.accountEmail ? (
                    <span className="text-sm text-[#6b635a]">
                      ({c.accountEmail})
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
            {openTarget?.kind === "external" ? (
              <button
                type="button"
                onClick={() => openMyCalendar(openTarget.provider)}
                className="companion-btn-primary inline-flex self-start rounded-xl px-4 py-2.5 text-sm font-semibold"
                data-testid="open-my-calendar"
              >
                Open {openTarget.label}
              </button>
            ) : null}
            {openTarget?.kind === "choose" ? (
              <div
                className="flex flex-wrap gap-2"
                data-testid="choose-my-calendar"
              >
                <p className="w-full text-base text-[#1f1c19]">
                  Which calendar do you use day to day?
                </p>
                {openTarget.providers.map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    onClick={() => openMyCalendar(provider)}
                    className="companion-btn-primary inline-flex self-start rounded-xl px-4 py-2.5 text-sm font-semibold"
                    data-testid={`open-my-calendar-${provider}`}
                  >
                    Open {memberCalendarLabel(provider)}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {connectHref && googleProvider?.status !== "connected" ? (
                <a
                  href={connectHref}
                  onClick={() => rememberPreferredCalendarProvider("google")}
                  className="inline-flex self-start rounded-xl border border-[#d4cdc3] bg-white px-4 py-2.5 text-sm font-semibold text-[#4b463f] no-underline hover:bg-white/80"
                  data-testid="connect-another-calendar"
                >
                  Connect Google Calendar
                </a>
              ) : null}
              {outlookDisconnected ? (
                <button
                  type="button"
                  onClick={() => {
                    connectOutlookCalendarLocal();
                    rememberPreferredCalendarProvider("outlook");
                    void refreshSnapshot();
                  }}
                  className="inline-flex self-start rounded-xl border border-[#d4cdc3] bg-white px-4 py-2.5 text-sm font-semibold text-[#4b463f]"
                  data-testid="connect-outlook-calendar"
                >
                  Connect Outlook Calendar
                </button>
              ) : null}
            </div>
            <p className="text-sm text-[#6b635a]">
              Spark opens the calendar you connected — not a fixed vendor. You
              can switch anytime from here or Settings → Connections.
            </p>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          On your planning calendar
        </h3>
        {events.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed border-[#d4cdc3] bg-white/70 px-4 py-5 text-base text-[#6b635a]">
            Nothing scheduled from Spark yet. Appointments and timed plan items
            will show here when they exist — we won&apos;t invent events.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {events.map((ev) => {
              const clock = formatEventClock(ev.startTime);
              const meta = [
                ev.date,
                clock,
                ev.source === "spark-appointment"
                  ? "Appointment"
                  : "Plan item",
              ]
                .filter(Boolean)
                .join(" · ");
              const interactive = Boolean(onOpenEvent);
              const label =
                ev.source === "spark-appointment"
                  ? `Open appointment: ${ev.title}`
                  : `Open plan item: ${ev.title}`;

              return (
                <li key={ev.id}>
                  {interactive ? (
                    <button
                      type="button"
                      className="w-full rounded-xl border border-[#e7dfd4] bg-white px-4 py-3 text-left transition hover:border-[#c4b8a8] hover:bg-[#faf7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e4f4f]"
                      data-testid={`planning-calendar-event-${ev.id}`}
                      aria-label={label}
                      onClick={() => onOpenEvent?.(ev)}
                    >
                      <p className="text-base font-semibold text-[#1f1c19]">
                        {ev.title}
                      </p>
                      <p className="mt-1 text-sm text-[#6b635a]">{meta}</p>
                    </button>
                  ) : (
                    <div
                      className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
                      data-testid={`planning-calendar-event-${ev.id}`}
                    >
                      <p className="text-base font-semibold text-[#1f1c19]">
                        {ev.title}
                      </p>
                      <p className="mt-1 text-sm text-[#6b635a]">{meta}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
