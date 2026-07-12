"use client";

import {
  PROJECT_HOME_STATUS_LABEL,
  getProjectHomeBackgroundUrl,
  getProjectHomeRoom,
  prototypeOpenQuestions,
  prototypeRecentProgress,
  prototypeRecentWins,
  prototypeRelatedConversations,
  prototypeUpcomingMilestones,
  resolveProjectHomeArtwork,
  type ProjectHomeRecord,
} from "@/lib/projectHomes";
import { ConnectedPlacesSection } from "@/components/companion/projectHomes/ConnectedPlacesSection";

type Props = {
  project: ProjectHomeRecord;
};

/** Project Home workspace — progress first, living place feel. */
export function ProjectHomeDetail({ project }: Props) {
  const room = getProjectHomeRoom(project.projectHomeId);
  const artwork = resolveProjectHomeArtwork(project);
  const cover = getProjectHomeBackgroundUrl(project);

  return (
    <div className="project-home-workspace">
      <p className="project-homes-kicker">Walking into the Project Home</p>
      <h1 className="project-homes-title">{project.name}</h1>
      <p className="project-homes-lead">{project.purpose}</p>
      <span className="project-homes-badge">
        {PROJECT_HOME_STATUS_LABEL[project.status]} · {room.name}
      </span>

      <div
        className="project-homes-detail-hero"
        style={{ backgroundImage: `url(${cover})` }}
      >
        <div className="project-homes-detail-hero__veil" aria-hidden />
        <div className="project-homes-detail-hero__copy">
          <p className="text-xs font-bold uppercase tracking-wide opacity-90">
            Project Home
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold">{room.name}</p>
          <p className="mt-2 text-sm leading-relaxed opacity-95">
            {room.description}
          </p>
          {artwork.isPlaceholder ? (
            <p className="project-homes-placeholder-note">
              Temporary room artwork — dedicated Strategy Conference plate
              coming later.
            </p>
          ) : null}
        </div>
      </div>

      <section className="project-homes-section project-homes-section--emphasis">
        <h3>Current Focus</h3>
        <p>{project.currentFocus}</p>
      </section>

      <section className="project-homes-section project-homes-section--emphasis">
        <h3>Next Suggested Step</h3>
        <p>{project.nextSuggestedStep}</p>
      </section>

      <section className="project-homes-section">
        <h3>Recent Progress</h3>
        <ul>
          {prototypeRecentProgress(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Upcoming Milestones</h3>
        <ul>
          {prototypeUpcomingMilestones(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Related Conversations</h3>
        <ul>
          {prototypeRelatedConversations(project.currentFocus).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Open Questions</h3>
        <ul>
          {prototypeOpenQuestions(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="project-homes-section">
        <h3>Recent Wins</h3>
        <ul>
          {prototypeRecentWins(project).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <ConnectedPlacesSection projectHomeId={project.projectHomeId} />

      <p className="project-homes-prototype-note">
        Prototype workspace — progress sections and Connected Places are
        illustrative. Existing Projects storage and routing are unchanged.
      </p>
    </div>
  );
}
