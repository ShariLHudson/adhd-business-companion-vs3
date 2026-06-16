"use client";

import {
  PROJECT_COACH_TOPICS,
  type ProjectCoachTopic,
} from "@/lib/projectCoachHandoff";

export function ProjectCoachTopicPicker({
  onSelect,
  onDismiss,
}: {
  onSelect: (topic: ProjectCoachTopic) => void;
  onDismiss?: () => void;
}) {
  return (
    <div className="mt-3 rounded-2xl border border-[#1e4f4f]/20 bg-[#f0f5f5]/80 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#6b635a]">
        What would you like help with?
      </p>
      <div className="flex flex-wrap gap-2">
        {PROJECT_COACH_TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className="rounded-xl border border-[#1e4f4f]/25 bg-white px-3 py-2 text-sm font-semibold text-[#1e4f4f] transition-colors hover:border-[#1e4f4f] hover:bg-white"
          >
            <span aria-hidden="true">{t.emoji} </span>
            {t.label}
          </button>
        ))}
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 text-xs font-semibold text-[#9a8f82] hover:text-[#6b635a]"
        >
          Dismiss
        </button>
      ) : null}
    </div>
  );
}
