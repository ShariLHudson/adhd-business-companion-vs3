"use client";

import type { CollectionSummary } from "@/lib/thinkingSpace/collectionSummaries";
import {
  MY_THOUGHTS_COLLECTION_NEED_ATTENTION,
  MY_THOUGHTS_COLLECTION_PROJECTS,
  MY_THOUGHTS_COLLECTION_REMINDERS,
  MY_THOUGHTS_COLLECTION_THOUGHTS,
} from "@/lib/thinkingSpace/copy";

type Props = {
  summary: CollectionSummary;
  onOpen: (collectionId: string) => void;
};

/**
 * Collection dashboard card — primary navigation for My Thoughts™.
 */
export function ThinkingSpaceCollectionCard({ summary, onOpen }: Props) {
  const palette = summary.palette;
  const thoughtLabel =
    summary.thoughtCount === 1
      ? "1 Thought"
      : `${summary.thoughtCount} ${MY_THOUGHTS_COLLECTION_THOUGHTS}`;

  return (
    <button
      type="button"
      onClick={() => onOpen(summary.id)}
      className="thinking-space-collection-card companion-fade-in w-full min-h-[8.5rem] rounded-2xl border-2 p-5 text-left transition-all hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e4f4f]/40 sm:p-6"
      style={{
        background: palette.bgGradient,
        borderColor: palette.border,
      }}
      data-testid={`collection-card-${summary.id}`}
    >
      <div className="flex h-full items-start gap-4">
        <span className="text-3xl leading-none" aria-hidden>
          {summary.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-lg font-semibold leading-snug sm:text-xl"
            style={{ color: palette.text }}
          >
            {summary.label}
          </p>
          <p
            className="mt-2 text-sm font-medium opacity-90"
            style={{ color: palette.text }}
          >
            {thoughtLabel}
          </p>
          <ul
            className="mt-3 space-y-1 text-sm opacity-85"
            style={{ color: palette.text }}
          >
            {summary.needAttentionCount > 0 ? (
              <li>
                {summary.needAttentionCount}{" "}
                {MY_THOUGHTS_COLLECTION_NEED_ATTENTION}
              </li>
            ) : null}
            {summary.connectedProjectsCount > 0 ? (
              <li>
                {summary.connectedProjectsCount}{" "}
                {MY_THOUGHTS_COLLECTION_PROJECTS}
              </li>
            ) : null}
            {summary.remindersDueCount > 0 ? (
              <li>
                {summary.remindersDueCount} {MY_THOUGHTS_COLLECTION_REMINDERS}
              </li>
            ) : null}
            {summary.updatedToday ? (
              <li className="text-xs opacity-75">Updated today</li>
            ) : null}
          </ul>
        </div>
      </div>
    </button>
  );
}
