import type { ExecutiveAgenda } from "@/lib/founder/concierge/types";

type ConciergeAgendaProps = {
  agenda: ExecutiveAgenda;
};

export function ConciergeAgenda({ agenda }: ConciergeAgendaProps) {
  return (
    <section className="founder-concierge-agenda" aria-labelledby="concierge-agenda-heading">
      <h2 className="founder-concierge-agenda__title" id="concierge-agenda-heading">
        Today's Executive Agenda
      </h2>

      <div className="founder-concierge-agenda__grid">
        <div className="founder-concierge-agenda__block">
          <h3>Priorities</h3>
          <ol>
            {agenda.priorities.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.summary}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="founder-concierge-agenda__block">
          <h3>Watch Items</h3>
          <ul>
            {agenda.watchItems.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span>{item.note}</span>
              </li>
            ))}
          </ul>
        </div>

        {agenda.opportunity ? (
          <div className="founder-concierge-agenda__block founder-concierge-agenda__block--highlight">
            <h3>Opportunity</h3>
            <p className="founder-concierge-agenda__highlight-title">
              {agenda.opportunity.title}
            </p>
            <p className="founder-concierge-agenda__highlight-summary">
              {agenda.opportunity.summary}
            </p>
          </div>
        ) : null}

        {agenda.recommendation ? (
          <div className="founder-concierge-agenda__block founder-concierge-agenda__block--recommendation">
            <h3>Recommendation</h3>
            <p className="founder-concierge-agenda__highlight-title">
              {agenda.recommendation.title}
            </p>
            <p className="founder-concierge-agenda__highlight-summary">
              {agenda.recommendation.summary}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
