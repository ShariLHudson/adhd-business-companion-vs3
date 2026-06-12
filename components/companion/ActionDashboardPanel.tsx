"use client";

import { useMemo } from "react";
import type { FounderEvent } from "@/lib/ecosystem/events";
import { eventStore } from "@/lib/ecosystem/eventStore";
import { buildActionDashboard } from "@/lib/ecosystem/actions/actionDashboard";
import type { FounderAction } from "@/lib/ecosystem/actions/actionTypes";

function ActionRow({
  action,
  onOpen,
}: {
  action: FounderAction;
  onOpen?: (action: FounderAction) => void;
}) {
  return (
    <div className="rounded-xl border border-[#e4ddd2] bg-white px-3 py-2">
      <p className="text-sm font-medium text-[#1f1c19]">
        {action.emoji ?? "📋"} {action.title}
      </p>
      <p className="mt-0.5 text-xs text-[#6b635a]">{action.description}</p>
      {onOpen ? (
        <button
          type="button"
          onClick={() => onOpen(action)}
          className="mt-2 rounded-lg bg-[#1e4f4f] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#163a3a]"
        >
          Open
        </button>
      ) : null}
    </div>
  );
}

export function ActionDashboardPanel({
  events,
  founderId = "founder-001",
  onOpenAction,
}: {
  events?: FounderEvent[];
  founderId?: string;
  onOpenAction?: (action: FounderAction) => void;
}) {
  const evts = useMemo(
    () => events ?? eventStore.query({ founderId }),
    [events, founderId],
  );

  const dash = useMemo(
    () => buildActionDashboard(evts, founderId),
    [evts, founderId],
  );

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Current action
        </h3>
        {dash.currentAction ? (
          <div className="mt-3">
            <ActionRow action={dash.currentAction} onOpen={onOpenAction} />
          </div>
        ) : (
          <p className="mt-2 text-sm text-[#9a8f82]">Nothing queued — you&apos;re clear.</p>
        )}
      </section>

      <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Recommended actions
        </h3>
        <div className="mt-3 flex flex-col gap-2">
          {dash.recommendedActions.map((a) => (
            <ActionRow key={a.id} action={a} onOpen={onOpenAction} />
          ))}
          {dash.recommendedActions.length === 0 && (
            <p className="text-sm text-[#9a8f82]">No recommendations right now.</p>
          )}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Completed today
          </h3>
          <p className="mt-2 text-2xl font-semibold text-[#1e4f4f]">
            {dash.stats.completedToday}
          </p>
          {dash.completedToday.length > 0 && (
            <ul className="mt-2 flex flex-col gap-1 text-xs text-[#6b635a]">
              {dash.completedToday.map((a) => (
                <li key={a.id}>✓ {a.title}</li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
            Stalled actions
          </h3>
          {dash.stalledActions.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-[#2d2926]">
              {dash.stalledActions.slice(0, 4).map((a) => (
                <li key={a.id}>{a.title}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[#9a8f82]">Nothing stalled.</p>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[#d4cdc3] bg-white/90 p-4 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wide text-[#6b635a]">
          Action history
        </h3>
        <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#6b635a]">
          <span>Completed: {dash.stats.completed}</span>
          <span>Skipped: {dash.stats.skipped}</span>
          <span>Dismissed: {dash.stats.dismissed}</span>
          <span>Postponed: {dash.stats.postponed}</span>
        </div>
        {dash.stats.mostSuccessful.length > 0 && (
          <p className="mt-2 text-xs text-[#6b635a]">
            Most completed:{" "}
            {dash.stats.mostSuccessful.map((m) => m.title).join(", ")}
          </p>
        )}
      </section>
    </div>
  );
}
