"use client";

import { useEffect, useState } from "react";
import { SparkLoadingState } from "@/components/companion/SparkThinkingFlame";
import {
  connectedCalendarAuthHref,
  fetchConnectedCalendarsSnapshot,
  type ConnectedCalendarsSnapshot,
  type UnifiedPlanningEvent,
} from "@/lib/connectedCalendars";
import { connectOutlookCalendarLocal } from "@/lib/connections";
import { getTimeBlocks, todayStr } from "@/lib/companionStore";
import { readTodayPlanItems } from "@/lib/planMyDay";
import { PLANNING_CENTER_AREA_META } from "@/lib/planMyDay/planningCenter";

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
};

/**
 * Planning Calendar home — Connected Calendars abstraction.
 * Reuses existing Google OAuth; Outlook plugs into the same snapshot.
 */
export function PlanMyDayCalendarArea({
  hideHeading = false,
  authReturnPath = "/companion?section=plan-my-day&planningArea=calendar",
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
    return () => {
      cancelled = true;
      window.removeEventListener("companion-outlook-calendar-updated", sync);
    };
  }, []);

  const connected = (snapshot?.connections.length ?? 0) > 0;
  const googleProvider = snapshot?.providers.find((p) => p.id === "google");
  const outlookProvider = snapshot?.providers.find((p) => p.id === "outlook");
  const connectHref = connectedCalendarAuthHref("google", authReturnPath);
  const outlookDisconnected = outlookProvider?.status === "disconnected";

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
          Connected Calendars
        </h3>

        {loading ? (
          <div className="mt-3">
            <SparkLoadingState message="Checking connections…" size="sm" />
          </div>
        ) : !connected ? (
          <div className="mt-3 flex flex-col gap-3">
            <p className="text-base text-[#1f1c19]">
              No calendars are connected.
            </p>
            <div className="flex flex-wrap gap-2">
              {connectHref && googleProvider?.status !== "unavailable" ? (
                <a
                  href={connectHref}
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
            <div className="flex flex-wrap gap-2">
              {connectHref && googleProvider?.status !== "connected" ? (
                <a
                  href={connectHref}
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
              Google uses your existing Spark Google connection. Outlook Calendar
              plugs into the same Connected Calendars list — Microsoft Graph sync
              will attach here when ready.
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
            {events.map((ev) => (
              <li
                key={ev.id}
                className="rounded-xl border border-[#e7dfd4] bg-white px-4 py-3"
              >
                <p className="text-base font-semibold text-[#1f1c19]">
                  {ev.title}
                </p>
                <p className="mt-1 text-sm text-[#6b635a]">
                  {[ev.date, ev.startTime].filter(Boolean).join(" · ")}
                  {ev.source === "spark-appointment"
                    ? " · Appointment"
                    : " · Plan item"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
