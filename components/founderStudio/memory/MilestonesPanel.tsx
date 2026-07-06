"use client";

import type { FounderMilestone } from "@/lib/founder/memory/types";

type MilestonesPanelProps = {
  milestones: FounderMilestone[];
};

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function MilestonesPanel({ milestones }: MilestonesPanelProps) {
  return (
    <section className="memory-milestones" aria-labelledby="memory-milestones-heading">
      <h2 className="memory-milestones__heading" id="memory-milestones-heading">
        Company Milestones
      </h2>
      <ul className="memory-milestones__grid">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="memory-milestones__card">
            <span className="memory-milestones__category">{milestone.category}</span>
            <h3 className="memory-milestones__title">{milestone.title}</h3>
            <p className="memory-milestones__description">{milestone.description}</p>
            <time className="memory-milestones__date" dateTime={milestone.achievedAt}>
              {formatWhen(milestone.achievedAt)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
