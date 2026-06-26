"use client";

import { useState, type ReactNode } from "react";
import {
  FLEXIBLE_PLANNING_INTRO,
  FLEXIBLE_SUGGESTIONS_HINT,
  type FlexiblePlanningContext,
} from "@/lib/planMyDay/companionBrainClient/flexiblePlanning";
import { PlanDayShariPresence } from "@/components/companion/PlanDayShariPresence";

type Props = {
  context: FlexiblePlanningContext;
  onUseSuggestions: () => void;
  onBuildMyWay: () => void;
  onOpenProject?: (projectId: string) => void;
  onOpenProjects?: () => void;
  onOpenCalendar?: () => void;
  onBringParkingItem?: (itemId: string) => void;
  onOpenItem?: (itemId: string) => void;
  onReturnToGateway?: () => void;
};

function SectionCard({
  title,
  hint,
  count,
  children,
  defaultOpen = false,
}: {
  title: string;
  hint?: string;
  count?: number;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const label =
    count !== undefined && count > 0 ? `${title} (${count})` : title;

  return (
    <div className="rounded-xl border border-[#e7dfd4] bg-white/80">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-base font-semibold text-[#1f1c19]">{label}</span>
        <span className="text-sm text-[#9a8f82]">{open ? "−" : "+"}</span>
      </button>
      {hint && !open ? (
        <p className="px-4 pb-3 text-sm leading-relaxed text-[#6b635a]">{hint}</p>
      ) : null}
      {open ? <div className="border-t border-[#e7dfd4] px-4 py-3">{children}</div> : null}
    </div>
  );
}

/**
 * Flexible Planning Mode™ — supported paths when the user isn't ready to commit.
 */
export function PlanDayFlexiblePlanningMode({
  context,
  onUseSuggestions,
  onBuildMyWay,
  onOpenProject,
  onOpenProjects,
  onOpenCalendar,
  onBringParkingItem,
  onOpenItem,
  onReturnToGateway,
}: Props) {
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const shariMessage = FLEXIBLE_PLANNING_INTRO.join(" ");

  return (
    <section
      className="plan-day-flexible companion-fade-in mx-auto w-full max-w-xl"
      data-testid="plan-day-flexible-planning"
      aria-label="Flexible planning"
    >
      <PlanDayShariPresence message={shariMessage} />

      <p className="mt-6 text-base leading-relaxed text-[#6b635a]">
        I&apos;m still here. Pick any direction — there&apos;s no wrong path.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {context.suggestionCount > 0 ? (
          <div
            className="rounded-xl border border-[#e7dfd4] bg-white/80 px-4 py-3"
            data-testid="flexible-todays-suggestions"
          >
            <p className="text-base font-semibold text-[#1f1c19]">
              Today&apos;s Suggestions ({context.suggestionCount})
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
              {FLEXIBLE_SUGGESTIONS_HINT}
            </p>
            {suggestionsOpen ? (
              <ol className="mt-3 space-y-2 text-base text-[#3d3630]">
                {context.suggestionLabels.map((label, index) => (
                  <li key={`${index}-${label}`} className="flex gap-2">
                    <span className="shrink-0 font-semibold text-[#1e4f4f]">
                      {index + 1}.
                    </span>
                    <span>{label}</span>
                  </li>
                ))}
              </ol>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              {!suggestionsOpen ? (
                <button
                  type="button"
                  onClick={() => setSuggestionsOpen(true)}
                  className="rounded-lg border border-[#c9bfb0] bg-[#faf7f2] px-4 py-2 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f5f0ea]"
                  data-testid="flexible-show-suggestions"
                >
                  Show Suggestions
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onUseSuggestions}
                  className="rounded-lg bg-[#1e4f4f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163a3a]"
                  data-testid="flexible-use-suggestions"
                >
                  Use These Suggestions
                </button>
              )}
            </div>
          </div>
        ) : null}

        <div
          className="rounded-xl border border-[#1e4f4f]/25 bg-[#f0f8f8]/60 px-4 py-4"
          data-testid="flexible-build-my-way"
        >
          <p className="text-base font-semibold text-[#1f1c19]">Build Today My Way</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6b635a]">
            Already know what you want? Open the planning board and shape today
            yourself — I&apos;ll stay nearby.
          </p>
          <button
            type="button"
            onClick={onBuildMyWay}
            className="mt-3 rounded-lg border border-[#1e4f4f]/40 bg-white px-4 py-2.5 text-sm font-semibold text-[#1e4f4f] hover:bg-[#f0f8f8]"
          >
            Open Planning Board
          </button>
        </div>

        {context.parkingLot.length > 0 ? (
          <SectionCard
            title="Parking Lot"
            hint="Ideas that are waiting — sometimes today's best plan starts with yesterday's unfinished thought."
            count={context.parkingLot.length}
          >
            <ul className="flex flex-col gap-2">
              {context.parkingLot.slice(0, 6).map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-2 text-base text-[#3d3630]"
                >
                  <span className="min-w-0 flex-1">{item.title}</span>
                  {onBringParkingItem ? (
                    <button
                      type="button"
                      onClick={() => onBringParkingItem(item.id)}
                      className="shrink-0 text-sm font-semibold text-[#1e4f4f] hover:underline"
                    >
                      Bring to today
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </SectionCard>
        ) : null}

        {context.projects.length > 0 ? (
          <SectionCard title="Projects" count={context.projects.length}>
            <ul className="flex flex-col gap-2">
              {context.projects.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenProject
                        ? onOpenProject(project.id)
                        : onOpenProjects?.()
                    }
                    className="w-full rounded-lg px-2 py-2 text-left text-base text-[#1f1c19] hover:bg-[#faf7f2]"
                  >
                    {project.name}
                  </button>
                </li>
              ))}
            </ul>
            {onOpenProjects ? (
              <button
                type="button"
                onClick={onOpenProjects}
                className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
              >
                Open all projects
              </button>
            ) : null}
          </SectionCard>
        ) : null}

        {context.calendarEvents.length > 0 ? (
          <SectionCard title="Calendar" count={context.calendarEvents.length}>
            <ul className="flex flex-col gap-2">
              {context.calendarEvents.map((event) => (
                <li
                  key={event.id}
                  className="flex justify-between gap-2 text-base text-[#3d3630]"
                >
                  <span>{event.title}</span>
                  <span className="shrink-0 text-sm text-[#6b635a]">
                    {event.timeLabel}
                  </span>
                </li>
              ))}
            </ul>
            {onOpenCalendar ? (
              <button
                type="button"
                onClick={onOpenCalendar}
                className="mt-2 text-sm font-semibold text-[#1e4f4f] hover:underline"
              >
                Open calendar
              </button>
            ) : null}
          </SectionCard>
        ) : null}

        {context.morePossibilityCount > 0 ? (
          <SectionCard
            title="More Possibilities"
            hint="Other options I kept nearby — not required, just available."
            count={context.morePossibilityCount}
          >
            {context.heldItems.length > 0 ? (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  Being held for capacity
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {context.heldItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem?.(item.id)}
                        className="text-left text-base text-[#3d3630] hover:underline"
                      >
                        {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {context.upcomingItems.length > 0 ? (
              <div className={context.heldItems.length > 0 ? "mt-4" : ""}>
                <p className="text-xs font-bold uppercase tracking-wide text-[#9a8f82]">
                  Upcoming deadlines
                </p>
                <ul className="mt-2 flex flex-col gap-1">
                  {context.upcomingItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => onOpenItem?.(item.id)}
                        className="text-left text-base text-[#3d3630] hover:underline"
                      >
                        {item.title}
                        {item.dueDate ? (
                          <span className="ml-2 text-sm text-[#6b635a]">
                            {item.dueDate}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </SectionCard>
        ) : null}
      </div>

      {onReturnToGateway && context.suggestionCount > 0 ? (
        <button
          type="button"
          onClick={onReturnToGateway}
          className="mt-8 text-sm font-semibold text-[#1e4f4f] hover:underline"
          data-testid="flexible-return-gateway"
        >
          Return to today&apos;s gateway
        </button>
      ) : null}
    </section>
  );
}
