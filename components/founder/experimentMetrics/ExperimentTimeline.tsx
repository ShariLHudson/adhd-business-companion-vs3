"use client";

import type { ExperimentTimelineEvent } from "@/lib/founderWorkspace/experimentMetrics";

const KIND_COLORS: Record<string, string> = {
  experiment: "#1e4f4f",
  status: "#e8c547",
  outcome: "#a85c4a",
  task: "#1e4f4f",
  google: "#4a7c9b",
  project: "#6b635a",
};

export function ExperimentTimeline({ events }: { events: ExperimentTimelineEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-[#6b635a]">No timeline events yet.</p>;
  }

  return (
    <ol className="relative border-l border-[#d4cdc3] pl-4">
      {events.map((e) => (
        <li key={e.id} className="mb-4 last:mb-0">
          <span
            className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-white"
            style={{ backgroundColor: KIND_COLORS[e.kind] ?? "#d4cdc3" }}
          />
          <time className="text-[11px] text-[#6b635a]">
            {new Date(e.ts).toLocaleString()}
          </time>
          <p className="text-sm font-medium text-[#1f1c19]">{e.label}</p>
          {e.detail ? (
            <p className="text-xs text-[#6b635a]">{e.detail}</p>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
