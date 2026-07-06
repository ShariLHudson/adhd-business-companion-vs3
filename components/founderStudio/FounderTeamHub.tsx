import Link from "next/link";

import { FOUNDER_STUDIO_BASE } from "@/lib/founderStudio/founderConfig";
import { TEAM_HUB_SECTIONS } from "@/lib/founderStudio/sampleData";

import { FounderPanel } from "./FounderPanel";
import { FounderRoomNav } from "./FounderRoomNav";

export function FounderTeamHub() {
  return (
    <div className="founder-team-hub">
      <header className="founder-room-page__hero">
        <Link href={FOUNDER_STUDIO_BASE} className="founder-room-page__back">
          ← Back to Founder Studio
        </Link>
        <p className="founder-room-page__eyebrow">Team Hub™ · Execution layer</p>
        <h1>Team Hub™</h1>
        <p className="founder-room-page__question">
          What needs to be executed, assigned, reviewed, or approved?
        </p>
        <p className="founder-room-page__purpose">
          Founder thinks. Team Hub executes. Izna&apos;s lane stays here — not in
          private strategy intelligence.
        </p>
      </header>

      <div className="founder-team-hub__grid">
        {TEAM_HUB_SECTIONS.map((section) => (
          <FounderPanel
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
          </FounderPanel>
        ))}
      </div>

      <FounderRoomNav activeRoomId="team-hub" />
    </div>
  );
}
