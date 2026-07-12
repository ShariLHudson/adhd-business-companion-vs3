"use client";

import {
  formatProjectHomeDate,
  getProjectHomeRoom,
  getProjectHomeBackgroundUrl,
  shortPurpose,
  type ProjectHomeRecord,
} from "@/lib/projectHomes";

type Props = {
  project: ProjectHomeRecord;
  onOpen: (id: string) => void;
};

/**
 * Project Home card — room artwork is the visual focus.
 * Shows name, Project Home, short purpose, focus, last worked, next step.
 */
export function ProjectHomeCard({ project, onOpen }: Props) {
  const room = getProjectHomeRoom(project.projectHomeId);
  const cover = getProjectHomeBackgroundUrl(project);

  return (
    <button
      type="button"
      className="project-home-card"
      onClick={() => onOpen(project.id)}
      data-testid={`project-home-card-${project.id}`}
    >
      <span
        className="project-home-card__cover"
        style={{ backgroundImage: `url(${cover})` }}
        aria-hidden
      />
      <span className="project-home-card__veil" aria-hidden />
      <span className="project-home-card__body">
        <span className="project-home-card__name">{project.name}</span>
        <span className="project-home-card__room">
          Project Home · {room.name}
        </span>
        <span className="project-home-card__purpose">
          {shortPurpose(project.purpose)}
        </span>
        <span className="project-home-card__meta">
          <span className="project-home-card__meta-row">
            <span className="project-home-card__meta-label">Focus</span>
            {project.currentFocus}
          </span>
          <span className="project-home-card__meta-row">
            <span className="project-home-card__meta-label">Last worked</span>
            {formatProjectHomeDate(project.lastWorkedAt)}
          </span>
          <span className="project-home-card__meta-row">
            <span className="project-home-card__meta-label">Next</span>
            {project.nextSuggestedStep}
          </span>
        </span>
      </span>
    </button>
  );
}
