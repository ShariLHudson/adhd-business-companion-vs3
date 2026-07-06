import type { ExecutiveCommandCenterView } from "@/lib/executiveCommandCenter/types";

type CommandCenterEntryProps = {
  view: ExecutiveCommandCenterView;
};

export function CommandCenterEntry({ view }: CommandCenterEntryProps) {
  return (
    <section className="founder-hq__entry" aria-labelledby="hq-entry-title">
      <p className="founder-hq__overnight">{view.overnightMessage}</p>
      <h2 className="founder-hq__section-title" id="hq-entry-title">
        {view.headquartersMessage}
      </h2>
      <p className="founder-hq__lead">{view.companionVoice}</p>

      <article className="founder-hq__primary-card">
        <p className="founder-hq__meta">One mission · One recommendation · One next action</p>
        <h3 className="founder-hq__primary-mission">{view.primaryMission}</h3>
        <p className="founder-hq__primary-headline">{view.primaryRecommendation}</p>
        <p className="founder-hq__prose">{view.primaryRecommendationSummary}</p>
        <div className="founder-hq__today-row">
          <div>
            <p className="founder-hq__meta">Today&apos;s goal</p>
            <p className="founder-hq__prose">{view.todaysGoal}</p>
          </div>
          <div>
            <p className="founder-hq__meta">Estimated progress</p>
            <p className="founder-hq__progress">{view.estimatedProgress}%</p>
          </div>
        </div>
        <p className="founder-hq__next-action">
          <strong>Next:</strong> {view.nextAction}
        </p>
      </article>
    </section>
  );
}
