import type { FounderWorkspace } from "@/lib/founder/types/workspace";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { FounderExecutiveRecommendationCard } from "./FounderExecutiveRecommendation";
import {
  ExecutiveCard,
  ExecutivePanel,
  PriorityBadge,
  RoomHeader,
} from "./executive";

type FounderWorkspaceViewProps = {
  workspace: FounderWorkspace;
};

export function FounderWorkspaceView({ workspace }: FounderWorkspaceViewProps) {
  const surfaceSections = workspace.sections.filter((s) => s.depth === "surface");
  const deepSections = workspace.sections.filter((s) => s.depth === "deep");
  const isSimplify = workspace.id === "simplify";

  return (
    <div className={`founder-workspace founder-workspace--${workspace.id}`}>
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Executive Workspace"
        title={`${workspace.icon} ${workspace.title}`}
        purpose={workspace.purpose}
      />

      <div className="founder-workspace__surface">
        <FounderExecutiveRecommendationCard recommendation={workspace.recommendation} />

        {!isSimplify && workspace.priorities.length > 0 ? (
          <ExecutivePanel
            title="Priorities"
            subtitle={`${workspace.priorities.length} max — what matters first`}
            defaultOpen
          >
            <ol className="founder-priority-list">
              {workspace.priorities.map((item, index) => (
                <li key={item.id}>
                  <span className="founder-priority-list__index">{index + 1}</span>
                  <div>
                    <p className="founder-priority-list__title">{item.title}</p>
                    {item.summary ? (
                      <p className="founder-priority-list__note">{item.summary}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </ExecutivePanel>
        ) : null}

        {!isSimplify && workspace.actions.length > 0 ? (
          <ExecutivePanel title="Actions" subtitle="Three clear next steps">
            <ul className="founder-workspace__action-list">
              {workspace.actions.map((action) => (
                <li key={action.id}>
                  {action.tone ? (
                    <PriorityBadge tone={action.tone}>
                      {action.meta ?? "Action"}
                    </PriorityBadge>
                  ) : null}
                  <span>{action.title}</span>
                  {action.summary ? (
                    <p className="founder-workspace__action-detail">{action.summary}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </ExecutivePanel>
        ) : null}
      </div>

      {isSimplify ? (
        <div className="founder-workspace__simplify">
          {workspace.sections.map((section) => (
            <ExecutivePanel
              key={section.id}
              title={section.title}
              subtitle={section.subtitle}
              defaultOpen
            >
              <ul className="founder-workspace__item-list">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <p className="founder-workspace__item-title">{item.title}</p>
                    {item.summary ? (
                      <p className="founder-workspace__item-summary">{item.summary}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </ExecutivePanel>
          ))}
        </div>
      ) : (
        <>
          {surfaceSections.length > 0 ? (
            <div className="founder-workspace__sections">
              {surfaceSections.map((section) => (
                <ExecutivePanel
                  key={section.id}
                  title={section.title}
                  subtitle={section.subtitle}
                  defaultOpen={workspace.id === "start"}
                  collapsible={workspace.id !== "start"}
                >
                  {section.items.length === 0 ? (
                    <p className="founder-workspace__empty">Nothing queued here yet.</p>
                  ) : (
                    <div className="founder-room-page__cards">
                      {section.items.map((item) => (
                        <ExecutiveCard
                          key={item.id}
                          title={item.title}
                          summary={item.summary ?? item.meta ?? ""}
                          tone={item.tone}
                          meta={item.meta && item.summary ? item.meta : undefined}
                        />
                      ))}
                    </div>
                  )}
                </ExecutivePanel>
              ))}
            </div>
          ) : null}

          {deepSections.length > 0 ? (
            <details className="founder-workspace__deeper">
              <summary className="founder-workspace__deeper-summary">
                Go deeper — projects, research, and details
              </summary>
              <div className="founder-workspace__sections founder-workspace__sections--deep">
                {deepSections.map((section) => (
                  <ExecutivePanel
                    key={section.id}
                    title={section.title}
                    subtitle={section.subtitle}
                    collapsible
                    defaultOpen={false}
                  >
                    {section.items.length === 0 ? (
                      <p className="founder-workspace__empty">Nothing here yet.</p>
                    ) : (
                      <ul className="founder-workspace__item-list">
                        {section.items.map((item) => (
                          <li key={item.id}>
                            <p className="founder-workspace__item-title">{item.title}</p>
                            {item.summary ? (
                              <p className="founder-workspace__item-summary">
                                {item.summary}
                              </p>
                            ) : null}
                            {item.meta && !item.summary ? (
                              <p className="founder-workspace__item-meta">{item.meta}</p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </ExecutivePanel>
                ))}
              </div>
            </details>
          ) : null}
        </>
      )}
    </div>
  );
}
