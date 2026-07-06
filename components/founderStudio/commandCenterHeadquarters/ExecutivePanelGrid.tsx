import type { ExecutivePanelSummary, ExecutivePanelId } from "@/lib/executiveCommandCenter/types";

type ExecutivePanelGridProps = {
  panels: ExecutivePanelSummary[];
  expandedPanelId: ExecutivePanelId | null;
  onSelectPanel: (panelId: ExecutivePanelId) => void;
};

export function ExecutivePanelGrid({
  panels,
  expandedPanelId,
  onSelectPanel,
}: ExecutivePanelGridProps) {
  return (
    <section className="founder-hq__panels" aria-labelledby="hq-panels-title">
      <h2 className="founder-hq__section-title" id="hq-panels-title">
        Six executive panels
      </h2>
      <p className="founder-hq__lead">One click expands everything in that domain. Nothing competes for attention until you ask.</p>
      <div className="founder-hq__panel-grid">
        {panels.map((panel) => {
          const expanded = expandedPanelId === panel.id;
          return (
            <article
              key={panel.id}
              className={`founder-hq__panel-card${expanded ? " founder-hq__panel-card--expanded" : ""}`}
            >
              <button
                type="button"
                className="founder-hq__panel-trigger"
                onClick={() => onSelectPanel(panel.id)}
                aria-expanded={expanded}
              >
                <p className="founder-hq__panel-eyebrow">{panel.mission}</p>
                <h3 className="founder-hq__panel-title">{panel.title}</h3>
                <p className="founder-hq__panel-teaser">{panel.teaser}</p>
                <span className="founder-hq__panel-count">{panel.itemCount} items ready</span>
              </button>
              {expanded ? (
                <ul className="founder-hq__panel-items">
                  {panel.items.map((item) => (
                    <li key={item.id} className="founder-hq__panel-item">
                      <p className="founder-hq__meta">{item.label}</p>
                      <p className="founder-hq__prose">{item.detail}</p>
                      {item.roomHref ? (
                        <a className="founder-hq__panel-link" href={item.roomHref}>
                          Open in Founder Studio →
                        </a>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
