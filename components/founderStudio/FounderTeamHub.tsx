import { getTeamHubSections } from "@/lib/founder/teamhub";
import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";

import { ExecutivePanel, RoomHeader } from "./executive";

export function FounderTeamHub() {
  const sections = getTeamHubSections();

  return (
    <div className="founder-team-hub">
      <RoomHeader
        backHref={FOUNDER_STUDIO_BASE}
        backLabel="← Back to the Office"
        eyebrow="Team Hub™ · Execution layer"
        title="Team Hub™"
        question="What needs to be executed, assigned, reviewed, or approved?"
        purpose="Founder thinks. Team Hub executes. Izna's lane stays here — not in private strategy intelligence."
      />

      <div className="founder-team-hub__grid">
        {sections.map((section) => (
          <ExecutivePanel
            key={section.id}
            title={section.title}
            collapsible
            defaultOpen={
              section.id === "active-projects" ||
              section.id === "waiting-shari" ||
              section.id === "approvals"
            }
          >
            <ul className="founder-team-hub__list">
              {section.items.map((item) => (
                <li key={item.id}>
                  <p className="founder-team-hub__item-title">{item.title}</p>
                  {item.meta ? (
                    <p className="founder-team-hub__item-meta">{item.meta}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </ExecutivePanel>
        ))}
      </div>
    </div>
  );
}
